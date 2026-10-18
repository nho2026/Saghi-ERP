import { getSettings } from "../../settings/settings.service.js";
import { verifySecret } from "../../../shared/security/password.js";
import { HikvisionClient } from "../hikvision/hikvision.client.js";
import { peopleModel as model } from "./people.model.js";
const fail = (m, s) => {
  throw Object.assign(new Error(m), { status: s });
};
const syncDevice = async (d, errors) => {
  let count = 0;
  const api = new HikvisionClient(d);
  const users = await api.allUsers();
  const cards = new Map();
  let cardsAvailable = true;
  const deviceCards = await api.allCards().catch((error) => {
    cardsAvailable = false;
    errors.push({
      deviceId: d.id,
      deviceName: d.name,
      message: `Users imported without card updates: ${error.message}`,
    });
    return [];
  });
  for (const card of deviceCards) {
    const employeeNo = String(card.employeeNo ?? "");
    if (employeeNo && card.cardNo != null && !cards.has(employeeNo))
      cards.set(employeeNo, String(card.cardNo));
  }
  for (const user of users) {
    const employeeNo = String(user.employeeNo ?? user.employeeNoString ?? "");
    if (!employeeNo) continue;
    const matchedEmployeeId = await model.employee(employeeNo);
    await model.upsert(d.id, employeeNo, {
      name: user.name || `Employee #${employeeNo}`,
      // Never erase an explicit ERP employee link when the terminal number
      // does not happen to equal the ERP employee code.
      employeeId: matchedEmployeeId ?? undefined,
      cardNo: cardsAvailable ? (cards.get(employeeNo) ?? null) : undefined,
      hasFingerprint:
        user.numOfFP == null ? undefined : Number(user.numOfFP) > 0,
      hasFace: user.numOfFace == null ? undefined : Number(user.numOfFace) > 0,
      hasPassword:
        user.password == null ? undefined : String(user.password).length > 0,
    });
    count++;
  }
  await model.deviceStatus(d.id, { status: "online", lastSeenAt: new Date() });
  return count;
};
const admin = async (user, password) => {
  if (
    !user.roles.some(({ role }) => role.name === "Super Administrator") ||
    ((await getSettings("security")).passwordForDeletion &&
      !(await verifySecret(password || "", user.passwordHash)))
  )
    fail("Super Administrator password is incorrect.", 403);
};
export const peopleService = {
  async list(deviceId, query) {
    return model.findAll(deviceId, query);
  },
  async sync(deviceId) {
    let synced = 0;
    const errors = [];
    for (const d of await model.devices(deviceId)) {
      try {
        synced += await syncDevice(d, errors);
      } catch (error) {
        errors.push({
          deviceId: d.id,
          deviceName: d.name,
          message: error.message,
        });
        await model.deviceStatus(d.id, { status: "offline" }).catch(() => {});
      }
    }
    return { synced, errors };
  },
  async create(input) {
    const d = (await model.devices(input.deviceId))[0];
    if (!d) fail("Record not found.", 404);
    if (await model.findNumber(input.deviceId, input.employeeNo))
      fail(
        `Employee number ${input.employeeNo} already exists on this device.`,
        409,
      );
    const api = new HikvisionClient(d);
    try {
      await api.addUser(input);
    } catch (error) {
      if (error.deviceStatus !== "employeeNoAlreadyExist") throw error;
      fail(
        `Employee number ${input.employeeNo} already exists on the Hikvision terminal.`,
        409,
      );
    }
    if (input.cardNo)
      await api.addCard(input.employeeNo, input.cardNo).catch((error) => {
        if (
          !["cardNoAlreadyExist", "employeeNoAndCardNoAlreadyExist"].includes(
            error.deviceStatus,
          )
        )
          throw error;
      });
    return model.create({
      ...input,
      employeeId: input.employeeId ?? (await model.employee(input.employeeNo)),
    });
  },
  async update(id, data) {
    const p = await model.find(id),
      api = new HikvisionClient(p.device);
    let recreated = false;
    try {
      await api.updateUser({ ...p, ...data });
    } catch (error) {
      if (error.deviceStatus !== "employeeNoNotExist") throw error;
      // The local record may outlive a terminal user deleted directly on the
      // device. Repair that drift instead of making the user recreate the ERP
      // link manually.
      await api.addUser({ ...p, ...data });
      recreated = true;
      const cardNo = data.cardNo === undefined ? p.cardNo : data.cardNo;
      if (cardNo) await api.addCard(p.employeeNo, cardNo);
    }
    if (!recreated && data.cardNo !== undefined && data.cardNo !== p.cardNo) {
      if (p.cardNo) await api.deleteCards(p.employeeNo);
      if (data.cardNo) await api.addCard(p.employeeNo, data.cardNo);
    }
    return model.update(
      id,
      recreated
        ? {
            ...data,
            hasFingerprint: false,
            hasFace: false,
            hasPassword: false,
          }
        : data,
    );
  },
  async remove(id, user, password) {
    await admin(user, password);
    const p = await model.find(id);
    await new HikvisionClient(p.device).deleteUser(p.employeeNo);
    await model.remove(id);
  },
  async removeCredential(id, method) {
    const p = await model.find(id),
      api = new HikvisionClient(p.device);
    let data;
    if (method === "card") {
      await api.deleteCards(p.employeeNo);
      data = { cardNo: null };
    } else if (method === "fingerprint") {
      await api.deleteFingerprint(p.employeeNo);
      data = { hasFingerprint: false };
    } else if (method === "face") {
      await api.deleteFace(p.employeeNo);
      data = { hasFace: false };
    } else {
      await api.clearUserPassword(p);
      data = { hasPassword: false };
    }
    return model.update(id, data);
  },
  async addCredential(id, method, input) {
    const p = await model.find(id),
      api = new HikvisionClient(p.device);
    let data;
    if (method === "card") {
      if (!input.cardNo) fail("Card number is required.", 400);
      await api.addCard(p.employeeNo, input.cardNo);
      data = { cardNo: input.cardNo };
    } else if (method === "pin") {
      if (!input.pin) fail("PIN is required.", 400);
      await api.setUserPassword(p, input.pin);
      data = { hasPassword: true };
    } else if (method === "fingerprint") {
      await api.captureFingerprint(p.employeeNo);
      data = { hasFingerprint: true };
    } else {
      await api.captureFace(p.employeeNo, p.name);
      data = { hasFace: true };
    }
    return model.update(id, data);
  },
};
