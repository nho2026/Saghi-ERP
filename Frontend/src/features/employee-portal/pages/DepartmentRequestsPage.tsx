import { useTranslation } from "react-i18next";
import DepartmentRequests from "./DepartmentRequests";

export default function DepartmentRequestsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("departmentRequest.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("departmentRequest.help")}
        </p>
      </div>
      <DepartmentRequests />
    </div>
  );
}
