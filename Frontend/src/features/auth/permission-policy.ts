import policy from "../../../../Backend/src/shared/constants/access-policy.json";

export const permissionCatalog = policy.catalog;
// Only actions supported by the application are offered in role management.
export const assignablePermissionCatalog = permissionCatalog.filter(
  ({ key, module }) => {
    const actions = policy.availableActions as Record<string, string[]>;
    return actions[module]?.includes(key.slice(module.length + 1));
  },
);
const pages = Object.entries(policy.pages).sort(
  ([a], [b]) => b.length - a.length,
);
export function permissionForPath(path: string): string {
  const page = pages.find(([pattern]) =>
    new RegExp(`^${pattern.replace(/:[^/]+/g, "[^/]+")}(?:/|$)`).test(path),
  );
  return page ? `${page[1]}.view` : "access.unregistered";
}
export function permissionForRequest(
  method: string,
  url: string,
): string | null {
  const path =
    new URL(url, "http://localhost").pathname
      .replace(/^\/api(?=\/|$)/, "")
      .replace(/\/+$/, "") || "/";
  method = method.toUpperCase();
  if (
    (path === "/auth/me" ||
      path === "/auth/profile" ||
      path === "/auth/profile/events" ||
      path === "/settings/runtime") &&
    ["GET", "HEAD"].includes(method)
  )
    return null;
  if (["/auth/login", "/auth/logout", "/settings/logo"].includes(path))
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
  const override = policy.overrides.find(
    (entry) =>
      (entry.method === method ||
        (method === "HEAD" && entry.method === "GET")) &&
      new RegExp(entry.pattern).test(path),
  );
  if (override) return override.permission;
  const resource = policy.resources.find((entry) =>
    new RegExp(entry.pattern).test(path),
  )?.resource;
  const action = (
    {
      GET: "view",
      HEAD: "view",
      POST: "create",
      PUT: "update",
      PATCH: "update",
      DELETE: "delete",
    } as Record<string, string>
  )[method];
  return resource && action ? `${resource}.${action}` : "access.unregistered";
}

export function effectivePermissions(keys: Iterable<string>) {
  const result = new Set(keys);
  const dependencies = policy.readDependencies as Record<string, string[]>;
  for (const key of result) {
    for (const dependency of dependencies[key] ?? []) {
      if (dependency.endsWith(".view")) result.add(dependency);
    }
  }
  return result;
}
