import { prisma } from "../database/client.js";

const actionFor = (req) =>
  req.originalUrl.startsWith("/api/auth/login")
    ? "login"
    : {
        POST: "create",
        PUT: "update",
        PATCH: "update",
        DELETE: "delete",
      }[req.method];

const moduleFor = (path) => path.split("/").filter(Boolean)[1] ?? "system";
const normalizeIp = (value) => String(value ?? "").replace(/^::ffff:/, "");

const secretKey = /password|passcode|pin|token|secret|authorization|cookie/i;
function sanitize(value, depth = 0) {
  if (depth > 4) return "[nested]";
  if (value === null || ["string", "number", "boolean"].includes(typeof value))
    return typeof value === "string" ? value.slice(0, 500) : value;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value))
    return value.slice(0, 25).map((item) => sanitize(item, depth + 1));
  if (typeof value !== "object") return String(value).slice(0, 500);
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !secretKey.test(key))
      .slice(0, 40)
      .map(([key, item]) => [key, sanitize(item, depth + 1)]),
  );
}

const detailsFor = (req, action) => {
  if (action === "login")
    return {
      loginMethod:
        req.validatedBody?.method ?? req.body?.method ?? "credentials",
    };
  const body = sanitize(req.validatedBody ?? req.body ?? {});
  const parts = req.originalUrl.split("?")[0].split("/").filter(Boolean);
  const recordId = parts.length > 3 ? parts.at(-1) : undefined;
  return {
    ...(recordId && { recordId }),
    ...(body && typeof body === "object" ? body : {}),
  };
};

export function auditApiRequest(req, res, next) {
  if (
    !req.originalUrl.startsWith("/api/") ||
    req.method === "GET" ||
    req.path === "/api/health" ||
    req.originalUrl.startsWith("/api/system-logs") ||
    req.originalUrl.startsWith("/api/auth/logout")
  )
    return next();

  const action = actionFor(req);
  if (!action) return next();

  const startedAt = Date.now();
  res.once("finish", () => {
    void prisma.auditLog
      .create({
        data: {
          userId: req.auditUser?.id ?? req.user?.id ?? null,
          userName:
            req.auditUser?.name ??
            req.user?.name ??
            req.user?.username ??
            req.validatedBody?.username ??
            null,
          method: req.method,
          path: req.originalUrl.split("?")[0].slice(0, 500),
          module: moduleFor(req.originalUrl),
          action,
          statusCode: res.statusCode,
          ipAddress:
            normalizeIp(req.ip ?? req.socket?.remoteAddress).slice(0, 100) ||
            null,
          userAgent: String(req.get("user-agent") ?? "").slice(0, 1000) || null,
          details: detailsFor(req, action),
          durationMs: Math.max(0, Date.now() - startedAt),
        },
      })
      .catch((error) => console.error("Unable to write audit log:", error));
  });
  next();
}
