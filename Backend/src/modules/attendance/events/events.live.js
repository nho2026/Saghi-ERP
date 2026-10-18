import crypto from "node:crypto";
import { HikvisionClient } from "../hikvision/hikvision.client.js";
import { eventsModel } from "./events.model.js";
import { verifiedAttendanceEvent } from "./events.verification.js";

const streams = new Map();
const subscribers = new Set();
let reconcileTimer;
let stopping = false;

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const xmlValue = (xml, name) =>
  xml.match(
    new RegExp(`<(?:\\w+:)?${name}[^>]*>([^<]*)<\\/(?:\\w+:)?${name}>`, "i"),
  )?.[1];

const parseXmlEvent = (xml) => ({
  employeeNoString:
    xmlValue(xml, "employeeNoString") ?? xmlValue(xml, "employeeNo"),
  name: xmlValue(xml, "name"),
  time: xmlValue(xml, "dateTime") ?? xmlValue(xml, "time"),
  serialNo: xmlValue(xml, "serialNo") ?? xmlValue(xml, "serialNumber"),
  currentVerifyMode: xmlValue(xml, "currentVerifyMode"),
  attendanceStatus: xmlValue(xml, "attendanceStatus"),
  eventType: xmlValue(xml, "eventType"),
  major: xmlValue(xml, "majorEventType") ?? xmlValue(xml, "major"),
  minor: xmlValue(xml, "subEventType") ?? xmlValue(xml, "minor"),
});

const createParser = (onEvent) => {
  let buffer = "";
  return (chunk) => {
    buffer += chunk.toString("utf8");
    for (;;) {
      const jsonStart = buffer.indexOf("{");
      const xmlStart = buffer.search(/<(?:\w+:)?EventNotificationAlert\b/i);
      if (xmlStart >= 0 && (jsonStart < 0 || xmlStart < jsonStart)) {
        const match = buffer
          .slice(xmlStart)
          .match(/<((?:\w+:)?EventNotificationAlert)\b[\s\S]*?<\/\1>/i);
        if (!match) break;
        onEvent(parseXmlEvent(match[0]));
        buffer = buffer.slice(xmlStart + match[0].length);
        continue;
      }
      if (jsonStart < 0) {
        buffer = buffer.slice(-8192);
        break;
      }
      let depth = 0,
        inString = false,
        escaped = false,
        end = -1;
      for (let index = jsonStart; index < buffer.length; index++) {
        const character = buffer[index];
        if (inString) {
          if (escaped) escaped = false;
          else if (character === "\\") escaped = true;
          else if (character === '"') inString = false;
        } else if (character === '"') inString = true;
        else if (character === "{") depth++;
        else if (character === "}" && --depth === 0) {
          end = index + 1;
          break;
        }
      }
      if (end < 0) break;
      try {
        const payload = JSON.parse(buffer.slice(jsonStart, end));
        onEvent(
          payload.AcsEvent ??
            payload.EventNotificationAlert?.AcsEvent ??
            payload.EventNotificationAlert ??
            payload,
        );
      } catch {}
      buffer = buffer.slice(end);
    }
  };
};

export async function saveLiveEvent(device, event) {
  const employeeNo = String(
      event.employeeNoString ?? event.employeeNo ?? "",
    ).trim(),
    occurredAt = new Date(event.time ?? event.dateTime),
    major = Number(event.major ?? event.majorEventType ?? 0),
    minor = Number(event.minor ?? event.subEventType ?? 0);
  const attendance = verifiedAttendanceEvent(event);
  if (!employeeNo || Number.isNaN(occurredAt.getTime()) || !attendance)
    return null;
  if (device.eventsClearedAt && occurredAt <= device.eventsClearedAt)
    return null;
  const person = await eventsModel.person(device.id, employeeNo),
    serial = event.serialNo ?? event.serialNumber,
    deviceEventId =
      serial != null
        ? String(serial)
        : crypto
            .createHash("sha256")
            .update(
              `${employeeNo}:${occurredAt.toISOString()}:${major}:${minor}`,
            )
            .digest("hex"),
    result = await eventsModel.saveUnique(device.id, deviceEventId, {
      personId: person?.id,
      employeeNo,
      personName: event.name ?? person?.name,
      eventType: attendance.eventType,
      occurredAt,
      verification: attendance.verification,
    });
  if (!result.created) return null;
  const saved = result.event;
  const message = { ...saved, device: { name: device.name } };
  for (const subscriber of subscribers) subscriber(message);
  return message;
}

const runStream = async (device, controller) => {
  let retry = 1000;
  while (!stopping && !controller.signal.aborted) {
    try {
      const parser = createParser((event) => {
        void saveLiveEvent(device, event).catch((error) =>
          console.error(
            `Attendance event save failed for ${device.name}:`,
            error,
          ),
        );
      });
      await eventsModel.status(device.id, {
        status: "online",
        lastSeenAt: new Date(),
      });
      await new HikvisionClient(device).alertStream(parser, controller.signal);
      retry = 1000;
    } catch (error) {
      if (controller.signal.aborted) break;
      await eventsModel
        .status(device.id, { status: "offline" })
        .catch(() => {});
    }
    if (!controller.signal.aborted) {
      await delay(retry);
      retry = Math.min(retry * 2, 30000);
    }
  }
};

export async function reconcileAttendanceStreams() {
  if (stopping) return;
  const devices = await eventsModel.devices(),
    ids = new Set(devices.map(({ id }) => id));
  for (const [id, stream] of streams)
    if (!ids.has(id)) {
      stream.controller.abort();
      streams.delete(id);
    }
  for (const device of devices) {
    const signature = `${device.ipAddress}:${device.port}:${device.username}:${device.password}`,
      current = streams.get(device.id);
    if (current?.signature === signature) continue;
    current?.controller.abort();
    const controller = new AbortController();
    streams.set(device.id, { controller, signature });
    void runStream(device, controller);
  }
}

export function subscribeToAttendanceEvents(listener) {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

export async function startAttendanceStreams() {
  stopping = false;
  await reconcileAttendanceStreams();
  reconcileTimer = setInterval(() => {
    void reconcileAttendanceStreams().catch((error) =>
      console.error("Attendance stream reconciliation failed:", error),
    );
  }, 30000);
}

export function stopAttendanceStreams() {
  stopping = true;
  clearInterval(reconcileTimer);
  for (const { controller } of streams.values()) controller.abort();
  streams.clear();
}
