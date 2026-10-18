import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { hasPermission, storedUser } from "./access";
import { PermissionScope } from "./permission-context";
import { permissionForPath } from "./permission-policy";

export function RequireAccess({ children }: { children: ReactNode }) {
  const user = storedUser();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  if (!user) return <Navigate to="/login" replace />;
  const permission = permissionForPath(pathname);
  if (!hasPermission(user, permission))
    return (
      <div role="alert" className="p-8 text-center">
        {t("access.denied")}
      </div>
    );
  return (
    <PermissionScope.Provider value={permission.slice(0, -5)}>
      {children}
    </PermissionScope.Provider>
  );
}
