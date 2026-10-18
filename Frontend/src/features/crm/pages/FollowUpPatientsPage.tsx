import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { crmApi, type CrmRecord } from "../api/crm.api";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { apiErrorMessage } from "@/shared/api/client";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card } from "@/shared/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/shared/components/ui/table";
import { PaginationControls } from "@/shared/components/ui/pagination-controls";
import { Label } from "@/shared/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

export default function FollowUpPatientsPage() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pendingPatient, setPendingPatient] = useState<CrmRecord | null>(null);
  const [followUpDate, setFollowUpDate] = useState("");
  const updateLock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  const result = useApiResource(
    useCallback(
      () => crmApi.patients.list(page, 50, { search: query, followUp: "true" }),
      [page, query],
    ),
  );
  const updateStatus = async () => {
    if (!pendingPatient) return;
    if (updateLock.current) return;
    updateLock.current = true;
    setBusy(true);
    setError("");
    try {
      await crmApi.patients.update(pendingPatient.id, {
        status:
          pendingPatient.status === "post_discharge_follow_up"
            ? "post_discharge_follow_up_completed"
            : "post_discharge_follow_up",
        followUpDate,
      });
      setPendingPatient(null);
      await result.refresh();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      updateLock.current = false;
      setBusy(false);
    }
  };
  return (
    <div className="space-y-4" dir={i18n.dir()}>
      <h1 className="text-xl font-bold">{t("postDischargeFollowUp.title")}</h1>
      <p className="text-sm text-muted-foreground">
        {t("postDischargeFollowUp.description")}
      </p>
      {(error || result.error) && (
        <p role="alert" className="text-destructive">
          {error || result.error}
        </p>
      )}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap gap-3 p-4">
          <Input
            className="max-w-sm"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("postDischargeFollowUp.search")}
            aria-label={t("postDischargeFollowUp.search")}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {[
                "code",
                "patient",
                "phone",
                "followUpDate",
                "surgeryType",
                "status",
                "actions",
              ].map((key) => (
                <TableHead key={key}>
                  {t(`postDischargeFollowUp.${key}`)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody autoPaginate={false}>
            {result.isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {t("resourceState.loading")}
                </TableCell>
              </TableRow>
            ) : result.data?.items.length ? (
              result.data.items.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{String(patient.patientCode ?? "")}</TableCell>
                  <TableCell>
                    <Link
                      className="text-primary underline"
                      to={`/crm/patients/${patient.id}`}
                      state={{ from: "/crm/follow-up" }}
                    >
                      {String(patient.firstName ?? "")}{" "}
                      {String(patient.lastName ?? "")}
                    </Link>
                  </TableCell>
                  <TableCell dir="ltr">{String(patient.phone ?? "")}</TableCell>
                  <TableCell>
                    {patient.followUpDate
                      ? new Intl.DateTimeFormat(i18n.language).format(
                          new Date(String(patient.followUpDate)),
                        )
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {String(
                      (
                        (
                          patient.surgeryAppointments as CrmRecord[] | undefined
                        )?.[0]?.surgery as CrmRecord | undefined
                      )?.name ?? "—",
                    )}
                  </TableCell>
                  <TableCell>
                    {t(
                      patient.status === "post_discharge_follow_up"
                        ? "postDischargeFollowUp.active"
                        : "postDischargeFollowUp.completed",
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      permission="crm.patients.update"
                      variant="outline"
                      disabled={busy}
                      onClick={() => {
                        setFollowUpDate(
                          patient.followUpDate
                            ? String(patient.followUpDate).slice(0, 10)
                            : "",
                        );
                        setPendingPatient(patient);
                      }}
                    >
                      {t(
                        patient.status === "post_discharge_follow_up"
                          ? "postDischargeFollowUp.complete"
                          : "postDischargeFollowUp.reopen",
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  {t("postDischargeFollowUp.empty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <PaginationControls
          page={page}
          totalPages={result.data?.pagination.totalPages ?? 1}
          total={result.data?.pagination.total ?? 0}
          onPageChange={(value) => {
            if (!result.isLoading) setPage(value);
          }}
        />
      </Card>
      <AlertDialog
        open={Boolean(pendingPatient)}
        onOpenChange={(open) => !open && setPendingPatient(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("postDischargeFollowUp.confirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("postDischargeFollowUp.confirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="follow-up-date">
              {t("postDischargeFollowUp.followUpDate")}
            </Label>
            <Input
              id="follow-up-date"
              type="date"
              required
              value={followUpDate}
              onChange={(event) => setFollowUpDate(event.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              permission="crm.patients.update"
              disabled={!followUpDate || busy}
              onClick={(event) => {
                event.preventDefault();
                void updateStatus();
              }}
            >
              {t("postDischargeFollowUp.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
