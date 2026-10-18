import type { AuthUser } from "./types/auth.types";
import policy from "../../../../Backend/src/shared/constants/access-policy.json";
import { effectivePermissions, permissionForPath } from "./permission-policy";

export const storedUser = (): AuthUser | null => {
  try {
    return JSON.parse(sessionStorage.getItem("nho-current-user") ?? "null");
  } catch {
    return null;
  }
};
export const isCashier = (user: AuthUser | null) =>
  Boolean(
    user?.roles?.some(({ name }) =>
      ["cashier", "cashir"].includes(name.trim().toLowerCase()),
    ),
  );
export const hasPermission = (user: AuthUser | null, permission?: string) =>
  Boolean(
    user &&
    permission &&
    (permission === "profile.view" ||
      permission === "employee-portal.view" ||
      user.permissions?.includes("*") ||
      effectivePermissions(user.permissions ?? []).has(permission)),
  );
export const hasPagePermission = (
  user: AuthUser | null,
  ...actions: string[]
) => {
  const resource = permissionForPath(
    window.location.protocol === "file:"
      ? window.location.hash.slice(1).split("?")[0]
      : window.location.pathname,
  ).slice(0, -5);
  return actions.some((action) => hasPermission(user, `${resource}.${action}`));
};

export function landingPage(user: AuthUser): string {
  const candidates = [
    ...(isCashier(user) ? ["/pos/checkout"] : []),
    "/dashboard",
    ...Object.keys(policy.pages).filter(
      (path) =>
        !path.includes(":") &&
        path !== "/profile" &&
        path !== "/employee-portal",
    ),
  ];
  return (
    candidates.find((path) => hasPermission(user, permissionForPath(path))) ??
    "/profile"
  );
}
