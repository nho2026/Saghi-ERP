import {
  missingRequestPermissions,
  requestPermission,
} from "../security/access-policy.js";

/** Runs immediately after authentication, before uploads, validation or controllers. */
export function requireRequestPermission(req, res, next) {
  const missing = missingRequestPermissions(
    req.permissionKeys,
    req.method,
    req.originalUrl,
  );
  if (missing.length)
    return res
      .status(403)
      .json({ message: `Missing permission: ${missing.join(", ")}` });
  const path = new URL(req.originalUrl, "http://localhost").pathname.replace(
    /^\/api/,
    "",
  );
  const body = req.body ?? {};
  if (!req.permissionKeys?.has("*")) {
    const extra = [];
    if (
      /^\/tasks\/[^/]+$/.test(path) &&
      ["completed", "rejected"].includes(body.status)
    )
      extra.push("tasks.list.approve");
    if (/^\/tasks\/[^/]+$/.test(path) && body.adjustment)
      extra.push(
        "hr.payroll-adjustments.view",
        "hr.payroll-adjustments.create",
      );
    if (/^\/targets\/[^/]+$/.test(path) && body.rewardAmount != null)
      extra.push("targets.reward");
    if (
      /^\/roles(?:\/|$)/.test(path) &&
      Object.hasOwn(body, "permissionIds") &&
      (req.method !== "POST" || body.permissionIds?.length)
    )
      extra.push("roles.assign_permissions");
    if (
      /^\/users(?:\/|$)/.test(path) &&
      Object.hasOwn(body, "roleIds") &&
      (req.method !== "POST" || body.roleIds?.length)
    )
      extra.push("users.assign_roles");
    if (
      /^\/users\/[^/]+$/.test(path) &&
      (Object.hasOwn(body, "password") || Object.hasOwn(body, "pin"))
    )
      extra.push("users.password");
    if (/^\/roles(?:\/|$)/.test(path) && body.name === "Super Administrator")
      return res
        .status(403)
        .json({
          message:
            "Only a Super Administrator can create or rename the unrestricted role.",
        });
    const denied = extra.filter((key) => !req.permissionKeys?.has(key));
    if (denied.length)
      return res
        .status(403)
        .json({ message: `Missing permission: ${denied.join(", ")}` });
  }
  next();
}

// Old route declarations use broad module keys. Resolve those to the exact
// resource/action instead of allowing legacy manage/view grants to bypass it.
const legacy = new Set([
  "employees.view",
  "employees.manage",
  "inventory.view",
  "inventory.manage",
  "inventory.adjust",
  "finance.view",
  "journal.create",
  "pos.use",
  "payroll.process",
]);
export const requirePermission = (permission) => (req, res, next) => {
  const required = legacy.has(permission)
    ? requestPermission(req.method, req.originalUrl)
    : permission;
  if (
    req.permissionKeys?.has("*") ||
    (required && req.permissionKeys?.has(required))
  )
    return next();
  return res
    .status(403)
    .json({ message: `Missing permission: ${required ?? permission}` });
};
export const requireAnyPermission =
  (...permissions) =>
  (req, res, next) => {
    const resolved = permissions.map((permission) =>
      legacy.has(permission)
        ? requestPermission(req.method, req.originalUrl)
        : permission,
    );
    if (
      req.permissionKeys?.has("*") ||
      resolved.some(
        (permission) => permission && req.permissionKeys?.has(permission),
      )
    )
      return next();
    return res
      .status(403)
      .json({ message: `Missing one of permissions: ${resolved.join(", ")}` });
  };
