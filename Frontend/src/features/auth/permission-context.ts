import { createContext, useContext } from "react";
import { hasPermission, storedUser } from "./access";

export const PermissionScope = createContext<string | null>(null);
export function useActionPermission(action?: string) {
  const scope = useContext(PermissionScope);
  if (!action) return true;
  const permission = action.includes(".")
    ? action
    : scope
      ? `${scope}.${action}`
      : "access.unregistered";
  const user = storedUser();
  return (
    hasPermission(user, permission) &&
    hasPermission(
      user,
      `${permission.slice(0, permission.lastIndexOf("."))}.view`,
    )
  );
}
