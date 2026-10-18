import policy from "../constants/access-policy.json" with { type: "json" };

export const permissionCatalog = policy.catalog;
// Only actions supported by the application are offered in role management.
export const assignablePermissionCatalog = permissionCatalog.filter(
  ({ key, module }) => {
    const actions = policy.availableActions;
    return actions[module]?.includes(key.slice(module.length + 1));
  },
);
const resources = policy.resources.map((entry) => ({
  ...entry,
  regex: new RegExp(entry.pattern),
}));
const overrides = policy.overrides.map((entry) => ({
  ...entry,
  regex: new RegExp(entry.pattern),
}));
const actions = {
  GET: "view",
  HEAD: "view",
  POST: "create",
  PUT: "update",
  PATCH: "update",
  DELETE: "delete",
};

export function requestPermission(method, url) {
  const path =
    new URL(url, "http://localhost").pathname
      .replace(/^\/api(?=\/|$)/, "")
      .replace(/\/+$/, "") || "/";
  method = method.toUpperCase();
  // Session introspection and runtime presentation settings have no business data/actions.
  if (
    (path === "/auth/me" ||
      path === "/auth/profile" ||
      path === "/auth/profile/events" ||
      path === "/settings/runtime") &&
    ["GET", "HEAD"].includes(method)
  )
    return null;
  if (
    ["GET", "HEAD"].includes(method) &&
    [
      "/employee-portal/my-tasks",
      "/employee-portal/ideas",
      "/employee-portal/warnings",
    ].includes(path)
  )
    return null;
  const override = overrides.find(
    (entry) =>
      (entry.method === method ||
        (method === "HEAD" && entry.method === "GET")) &&
      entry.regex.test(path),
  );
  if (override) return override.permission;
  const resource = resources.find((entry) => entry.regex.test(path))?.resource;
  return resource && actions[method]
    ? `${resource}.${actions[method]}`
    : "access.unregistered";
}

export function missingRequestPermissions(keys, method, url) {
  keys = effectivePermissions(keys ?? []);
  if (keys.has("*")) return [];
  const permission = requestPermission(method, url);
  if (permission === null) return [];
  const view = `${permission.slice(0, permission.lastIndexOf("."))}.view`;
  return [...new Set([view, permission])].filter(
    (key) => key !== "employee-portal.view" && !keys?.has(key),
  );
}

export function effectivePermissions(keys) {
  const result = new Set(keys);
  const dependencies = policy.readDependencies;
  for (const key of result) {
    for (const dependency of dependencies[key] ?? []) {
      if (dependency.endsWith(".view")) result.add(dependency);
    }
  }
  return result;
}
