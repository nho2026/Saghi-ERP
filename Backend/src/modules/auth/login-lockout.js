import { createPinLookup } from "../../shared/security/token.js";
import { createHash } from "node:crypto";
import { prisma } from "../../shared/database/client.js";
import { authModel } from "./auth.model.js";

export const MAX_LOGIN_FAILURES = 4;
export const LOGIN_LOCK_MS = 15 * 60 * 1000;
const hash = (value) => createHash("sha256").update(value).digest("hex");
export async function clearUserLoginAttempts(userId) {
  const key = hash(`account:${userId}`);
  await prisma.$executeRaw`DELETE FROM auth_LoginAttempt WHERE id = ${key}`;
}
export const lockedError = (until) =>
  Object.assign(
    new Error(
      "Too many failed login attempts. Login is blocked for 15 minutes. Please try again later.",
    ),
    {
      status: 429,
      retryAfter: Math.max(1, Math.ceil((until.getTime() - Date.now()) / 1000)),
    },
  );
export function failedAttempt(row, now) {
  const attempts = row.expiresAt <= now ? 1 : row.attempts + 1;
  return { attempts, expiresAt: new Date(now.getTime() + LOGIN_LOCK_MS) };
}
export async function withLoginLockout(input, source, login) {
  const keys = [hash(`source:${source}`)];
  const user =
    input.method === "credentials"
      ? await authModel.findByLogin(input.username)
      : await authModel.findByPinLookup(createPinLookup(input.pin));
  // Super Administrator accounts must never be locked out by either the
  // account or source-IP failure counters.
  if (user?.roles?.some(({ role }) => role.name === "Super Administrator"))
    return login(prisma);
  if (user || input.method === "credentials") {
    keys.push(
      hash(`account:${user?.id ?? input.username.trim().toLowerCase()}`),
    );
  }
  keys.sort();
  const result = await prisma.$transaction(
    async (tx) => {
      const now = new Date();
      const rows = [];
      for (const key of keys) {
        await tx.$executeRaw`INSERT IGNORE INTO auth_LoginAttempt (id, attempts, expiresAt) VALUES (${key}, 0, ${now})`;
        const [row] =
          await tx.$queryRaw`SELECT id, attempts, expiresAt FROM auth_LoginAttempt WHERE id = ${key} FOR UPDATE`;
        rows.push(row);
      }
      const blocked = rows.find(
        (row) => row.attempts >= MAX_LOGIN_FAILURES && row.expiresAt > now,
      );
      if (blocked) return { error: lockedError(blocked.expiresAt) };
      try {
        // Reuse the transaction connection so login cannot wait for a second
        // pool connection while holding the lockout rows locked.
        const value = await login(tx);
        for (const key of keys)
          await tx.$executeRaw`DELETE FROM auth_LoginAttempt WHERE id = ${key}`;
        return { value };
      } catch (error) {
        if (![401, 403].includes(error.status)) throw error;
        let lockUntil;
        for (const row of rows) {
          const next = failedAttempt(row, now);
          await tx.$executeRaw`UPDATE auth_LoginAttempt SET attempts = ${next.attempts}, expiresAt = ${next.expiresAt} WHERE id = ${row.id}`;
          if (next.attempts >= MAX_LOGIN_FAILURES) lockUntil = next.expiresAt;
        }
        return { error: lockUntil ? lockedError(lockUntil) : error };
      }
    },
    { timeout: 15000 },
  );
  if (result.error) throw result.error;
  return result.value;
}
