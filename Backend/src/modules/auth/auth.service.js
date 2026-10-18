import { getSettings } from "../settings/settings.service.js";
import { createPinLookup, signToken } from "../../shared/security/token.js";
import { verifySecret } from "../../shared/security/password.js";
import { authModel } from "./auth.model.js";
import { presentUser } from "./auth.presenter.js";

const httpError = (message, status) =>
  Object.assign(new Error(message), { status });
export const authService = {
  present: presentUser,
  async login(input, db) {
    const user =
      input.method === "credentials"
        ? await authModel.findByLogin(input.username, db)
        : await authModel.findByPinLookup(createPinLookup(input.pin), db);
    if (
      input.method === "pin" &&
      !user?.roles?.some(({ role }) => role.name === "Super Administrator")
    )
      throw httpError(
        "PIN login is only available to superadmins. Use your username and password.",
        401,
      );
    const valid =
      input.method === "credentials"
        ? user && (await verifySecret(input.password, user.passwordHash))
        : user?.pinHash && (await verifySecret(input.pin, user.pinHash));
    if (!valid)
      throw httpError(
        input.method === "credentials"
          ? "Invalid username or password."
          : "Invalid PIN.",
        401,
      );
    if (user.status !== "active")
      throw httpError("This account is inactive.", 403);
    const remember = input.method === "credentials" && input.remember;
    const security = await getSettings("security", db);
    const maxAge =
      (remember
        ? security.rememberDays * 86400
        : security.sessionHours * 3600) * 1000;
    return {
      maxAge,
      user: presentUser(user),
      token: signToken(user.id, remember, maxAge / 1000),
      remember,
    };
  },
  async profile(userId) {
    const user = await authModel.getProfile(userId);
    return { ...presentUser(user), employee: user.employee };
  },
  async updateProfile(userId, input) {
    const user = await authModel.updateProfile(userId, {
      ...input,
      department: input.department || null,
    });
    return { ...presentUser(user), employee: user.employee };
  },
  async profileEvents(userId, query) {
    const employee = await authModel.getEmployeeIdentity(userId);
    if (!employee && query?.page === undefined) return [];
    return authModel.findOwnEvents(employee?.id ?? "", query);
  },
};
