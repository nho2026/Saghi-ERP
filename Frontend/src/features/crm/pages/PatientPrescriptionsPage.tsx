import { hasPagePermission } from "@/features/auth/access";
import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { crmApi } from "../api/crm.api";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { storedUser } from "@/features/auth/access";
import { Button } from "@/shared/components/ui/button";
import PrescriptionWorkspace from "../components/PrescriptionWorkspace";

export default function PatientPrescriptionsPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const patient = useApiResource(
    useCallback(() => crmApi.patients.get(id), [id]),
  );
  return (
    <main className="w-full min-w-0 space-y-4" dir={i18n.dir()}>
      <header className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          aria-label={t("prescription.patient")}
          onClick={() => navigate(`/crm/patients/${id}`)}
        >
          <ArrowLeft className="size-4 rtl:rotate-180" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {t("prescription.medications")}
          </h1>
          {patient.data && (
            <p className="text-muted-foreground">
              {String(patient.data.firstName ?? "")}{" "}
              {String(patient.data.lastName ?? "")} ·{" "}
              {String(patient.data.patientCode ?? "")}
            </p>
          )}
        </div>
      </header>
      {patient.error ? (
        <p role="alert" className="text-destructive">
          {patient.error}
        </p>
      ) : patient.isLoading ? (
        <p>{t("resourceState.loading")}</p>
      ) : (
        patient.data && (
          <PrescriptionWorkspace
            key={id}
            patientId={id}
            patientWeightKg={
              patient.data.weightKg == null
                ? null
                : Number(patient.data.weightKg)
            }
            canManage={hasPagePermission(
              storedUser(),
              "create",
              "update",
              "delete",
            )}
          />
        )
      )}
    </main>
  );
}
