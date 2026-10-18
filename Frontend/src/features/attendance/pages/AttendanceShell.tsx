import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
export default function AttendanceShell() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
          {t("attendancePage.workforce")}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{t("attendancePage.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("attendancePage.description")}
        </p>
      </div>
      <Outlet />
    </div>
  );
}
