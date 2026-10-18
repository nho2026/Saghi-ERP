import { useServerTable } from "@/shared/hooks/useServerTable";
import { useSearchParams } from "react-router-dom";
import { Monitor, ArrowLeft } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/shared/components/ui/alert-dialog";
import PatientProfilePage from "@/features/crm/pages/PatientProfilePage";
import { PermissionScope } from "@/features/auth/permission-context";
import { hasPermission, storedUser } from "@/features/auth/access";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RefreshCw,
  CalendarDays,
  Clock3,
  CircleCheck,
  Stethoscope,
} from "lucide-react";
import { apiClient, apiErrorMessage } from "@/shared/api/client";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/shared/components/ui/table";
type Appointment = {
  patientId?: string;
  operatingRoom?: string | null;
  id: string;
  patientName: string;
  patientPhone: string;
  scheduledAt: string;
  durationMinutes: number;
  reason: string | null;
  status: string;
  doctorId: string | null;
  doctor: { employee: { firstName: string; lastName: string } } | null;
  department: { name: string } | null;
};
type PatientMatch = {
  id: string;
  patientCode: string;
  firstName: string;
  lastName: string;
  phone: string;
};
const doctorName = (item: Appointment) =>
  item.doctor
    ? `${item.doctor.employee.firstName} ${item.doctor.employee.lastName}`
    : "—";
export default function TodayPatientsPage() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tvMode = searchParams.get("tv") === "1";
  const toggleTv = () => {
    const next = new URLSearchParams(searchParams);
    if (tvMode) next.delete("tv");
    else next.set("tv", "1");
    setSearchParams(next);
  };
  const tr = (key: string) => t(`todayPatients.${key}`);
  const [visitId, setVisitId] = useState<string | null>(null);
  const [confirmVisit, setConfirmVisit] = useState<Appointment | null>(null);
  const serveLock = useRef(false);
  const [serving, setServing] = useState(false);
  const [serveError, setServeError] = useState("");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const canViewProfile = hasPermission(storedUser(), "crm.patients.view");
  const profiles = useApiResource(
    useCallback(async () => {
      if (!selectedId || !canViewProfile) return [];
      return apiClient
        .get<PatientMatch[]>(
          `/crm/appointments/${selectedId}/profile-candidates`,
        )
        .then((response) => response.data);
    }, [selectedId, canViewProfile]),
  );
  const [search, setSearch] = useState("");
  const [doctor, setDoctor] = useState("all");
  const [status, setStatus] = useState("current");
  const table = useServerTable<
    Appointment,
    {
      date: string;
      timezone: string;
      doctors: [string, string][];
      totals: { total: number; current: number; completed: number };
    }
  >("/crm/appointments/today", { search, doctor, status });
  const resource = { ...table, data: table.pageData };
  const refreshAppointments = resource.refresh;
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") void refreshAppointments();
    };
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [refreshAppointments]);
  const items = resource.data?.items ?? [];
  const selected = items.find((item) => item.id === selectedId);
  const rows = items;
  const doctors = resource.data?.doctors ?? [];
  const active = rows.filter(
    (item) => item.status === "in_progress" && item.patientId,
  );
  const shownProfileId =
    profileId ?? (active.length === 1 ? active[0].patientId : null);
  const visit = items.find(
    (item) =>
      item.id === (visitId ?? (active.length === 1 ? active[0].id : null)),
  );
  async function serve() {
    if (
      !confirmVisit ||
      serveLock.current ||
      !hasPermission(storedUser(), "healthcare.appointments.update")
    )
      return;
    serveLock.current = true;
    setServing(true);
    setServeError("");
    try {
      await apiClient.patch(
        `/crm/appointments/${encodeURIComponent(confirmVisit.id)}/served`,
      );
      setConfirmVisit(null);
      setProfileId("");
      setVisitId(null);
      setSelectedId(null);
      await resource.refresh();
    } catch (error) {
      setServeError(apiErrorMessage(error));
    } finally {
      serveLock.current = false;
      setServing(false);
    }
  }
  const servedButton =
    visit &&
    hasPermission(storedUser(), "healthcare.appointments.update") &&
    !["completed", "cancelled", "no_show"].includes(visit.status) ? (
      <div className="flex flex-col items-end gap-2 border-t pt-4">
        {serveError && (
          <p role="alert" className="text-destructive">
            {serveError}
          </p>
        )}
        <Button
          permission="update"
          size="lg"
          disabled={serving || resource.isLoading || !!resource.error}
          onClick={() => {
            setServeError("");
            setConfirmVisit(visit);
          }}
        >
          {tr(serving ? "serving" : "served")}
        </Button>
      </div>
    ) : null;
  return (
    <div dir={i18n.dir()} className="space-y-5">
      <Button variant="outline" onClick={toggleTv}>
        {tvMode ? (
          <ArrowLeft className="size-4 rtl:rotate-180" />
        ) : (
          <Monitor className="size-4" />
        )}
        {t(tvMode ? "patientTv.back" : "patientTv.open")}
      </Button>
      <div className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-primary/10 bg-card p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary sm:size-14">
            <Stethoscope className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold leading-tight tracking-tight 2xl:text-3xl">
              {tr("title")}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground sm:text-sm">
              {resource.data && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  <time dateTime={resource.data.date}>
                    {new Date(
                      `${resource.data.date}T12:00:00Z`,
                    ).toLocaleDateString(i18n.language, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      timeZone: "UTC",
                    })}
                  </time>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="size-1.5 rounded-full bg-emerald-500"
                  aria-hidden="true"
                />
                {tr("autoRefresh")}
              </span>
              <span dir="ltr" className="text-xs">
                {resource.data?.timezone}
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          disabled={resource.isLoading}
          onClick={() => void resource.refresh()}
        >
          <RefreshCw
            className={`size-4 ${resource.isLoading ? "animate-spin motion-reduce:animate-none" : ""}`}
          />
          {tr("refresh")}
        </Button>
      </div>
      {resource.error && (
        <p role="alert" className="text-destructive">
          {resource.error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            key: "total",
            value: resource.data?.totals.total ?? 0,
            Icon: CalendarDays,
            tone: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
            accent: "bg-sky-500",
          },
          {
            key: "current",
            value: resource.data?.totals.current ?? 0,
            Icon: Clock3,
            tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
            accent: "bg-amber-500",
          },
          {
            key: "completed",
            value: resource.data?.totals.completed ?? 0,
            Icon: CircleCheck,
            tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            accent: "bg-emerald-500",
          },
        ].map(({ key, value, Icon, tone, accent }) => (
          <Card
            key={key}
            className="relative overflow-hidden rounded-2xl p-5 sm:p-6"
          >
            <span
              className={`absolute inset-y-6 inset-s-0 w-1 rounded-e-full ${accent}`}
              aria-hidden="true"
            />
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-3">
                <span className="text-sm font-medium text-muted-foreground 2xl:text-base">
                  {tr(key)}
                </span>
                <strong className="block text-4xl font-semibold leading-none tracking-tight tabular-nums 2xl:text-5xl">
                  {resource.error || (!resource.data && resource.isLoading)
                    ? "—"
                    : new Intl.NumberFormat(i18n.language).format(value)}
                </strong>
              </div>
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-xl ${tone}`}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
            </div>
          </Card>
        ))}
      </div>
      {active.length > 0 && (
        <Card className="space-y-3 border-primary/30 p-5">
          <h2 className="text-xl font-semibold">{tr("activeVisit")}</h2>
          <p className="text-sm text-muted-foreground">
            {tr("activeVisitHint")}
          </p>
          <div className="flex flex-wrap gap-3">
            {active.map((item) => (
              <Button
                key={item.id}
                variant={
                  shownProfileId === item.patientId ? "default" : "outline"
                }
                disabled={!canViewProfile}
                onClick={() => {
                  setVisitId(item.id);
                  setProfileId(item.patientId!);
                  setServeError("");
                }}
              >
                {item.patientName} · {doctorName(item)}
                {item.operatingRoom ? ` · ${item.operatingRoom}` : ""}
              </Button>
            ))}
          </div>
        </Card>
      )}
      {!tvMode && shownProfileId && canViewProfile && (
        <div className="space-y-4">
          <PermissionScope.Provider value="crm.patients">
            <PatientProfilePage
              compact
              key={shownProfileId}
              patientId={shownProfileId}
              onBack={() => setProfileId("")}
            />
          </PermissionScope.Provider>
          {servedButton}
        </div>
      )}
      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-wrap gap-3 p-4">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tr("search")}
            aria-label={tr("search")}
            className="max-w-sm"
          />
          <Select value={doctor} onValueChange={setDoctor}>
            <SelectTrigger aria-label={tr("doctor")} className="w-60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tr("allDoctors")}</SelectItem>
              {doctors.map(([id, name]) => (
                <SelectItem key={id} value={id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger aria-label={tr("status")} className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "current",
                "all",
                "pending",
                "confirmed",
                "scheduled",
                "in_progress",
                "completed",
                "cancelled",
                "no_show",
              ].map((value) => (
                <SelectItem key={value} value={value}>
                  {tr(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {[
                "time",
                "patient",
                "phone",
                "doctor",
                "department",
                "reason",
                "status",
              ].map((key) => (
                <TableHead key={key}>{tr(key)}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody {...table.tableProps}>
            {resource.isLoading && !resource.data ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {t("resourceState.loading")}
                </TableCell>
              </TableRow>
            ) : resource.error ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {tr("loadFailed")}
                </TableCell>
              </TableRow>
            ) : rows.length ? (
              rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(item.scheduledAt).toLocaleTimeString(
                      i18n.language,
                      {
                        timeZone: resource.data?.timezone,
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    <Button
                      variant="link"
                      className="h-auto p-0 text-start font-semibold"
                      onClick={() => {
                        setVisitId(item.id);
                        setServeError("");
                        if (item.patientId && canViewProfile)
                          setProfileId(item.patientId);
                        else if (!item.patientId) setSelectedId(item.id);
                      }}
                      aria-label={`${tr("viewProfile")}: ${item.patientName}`}
                    >
                      {item.patientName}
                    </Button>
                  </TableCell>
                  <TableCell dir="ltr">{item.patientPhone}</TableCell>
                  <TableCell>{doctorName(item)}</TableCell>
                  <TableCell>{item.department?.name ?? "—"}</TableCell>
                  <TableCell className="max-w-sm whitespace-normal">
                    {item.reason || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{tr(item.status)}</Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {tr("empty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      <Dialog
        open={selectedId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        <DialogContent
          dir={i18n.dir()}
          className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        >
          <DialogHeader>
            <DialogTitle>{tr("viewProfile")}</DialogTitle>
            <DialogDescription>{tr("profileDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 rounded-xl border p-4">
            <h2 className="font-semibold">{tr("fullProfile")}</h2>
            {!canViewProfile ? (
              <p className="text-sm text-muted-foreground">
                {tr("profilePermission")}
              </p>
            ) : profiles.isLoading ? (
              <p role="status">{t("resourceState.loading")}</p>
            ) : profiles.error ? (
              <p role="alert" className="text-destructive">
                {profiles.error}
              </p>
            ) : profiles.data?.length ? (
              <>
                <p className="text-sm text-muted-foreground">
                  {tr("confirmPatient")}
                </p>
                {profiles.data.map((patient) => (
                  <Button
                    key={patient.id}
                    variant="outline"
                    className="h-auto w-full justify-between gap-4 whitespace-normal p-4 text-start"
                    onClick={() => {
                      setSelectedId(null);
                      setProfileId(patient.id);
                    }}
                  >
                    <span>
                      <span className="block font-semibold">
                        {patient.firstName} {patient.lastName}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {patient.patientCode} · {patient.phone}
                      </span>
                    </span>
                    <span>{tr("openProfile")}</span>
                  </Button>
                ))}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{tr("noProfile")}</p>
            )}
          </div>
          {selected && !resource.error ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4 rounded-xl bg-primary/5 p-5">
                <div
                  aria-hidden="true"
                  className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary"
                >
                  {selected.patientName
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">
                    {selected.patientName}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground" dir="ltr">
                    {selected.patientPhone}
                  </p>
                  <Badge className="mt-2" variant="outline">
                    {tr(selected.status)}
                  </Badge>
                </div>
              </div>
              <dl className="grid gap-5 sm:grid-cols-2">
                {[
                  [
                    "time",
                    new Date(selected.scheduledAt).toLocaleString(
                      i18n.language,
                      {
                        timeZone: resource.data?.timezone,
                        dateStyle: "medium",
                        timeStyle: "short",
                      },
                    ),
                  ],
                  ["duration", `${selected.durationMinutes} ${tr("minutes")}`],
                  ["doctor", doctorName(selected)],
                  ["department", selected.department?.name || "—"],
                ].map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <dt className="text-sm text-muted-foreground">{tr(key)}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="space-y-2 border-t pt-4">
                <h3 className="font-semibold">{tr("reason")}</h3>
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                  {selected.reason || "—"}
                </p>
              </div>
            </div>
          ) : (
            <p role="status" className="py-8 text-center text-muted-foreground">
              {resource.error ? tr("loadFailed") : tr("unavailable")}
            </p>
          )}
          {servedButton}
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={confirmVisit !== null}
        onOpenChange={(open) => {
          if (!open && !serveLock.current) setConfirmVisit(null);
        }}
      >
        <AlertDialogContent dir={i18n.dir()}>
          <AlertDialogHeader>
            <AlertDialogTitle>{tr("confirmServed")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("todayPatients.confirmServedDescription", {
                name: confirmVisit?.patientName ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {serveError && (
            <p role="alert" className="text-sm text-destructive">
              {serveError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-red-600 bg-red-600 text-white hover:bg-red-700 hover:text-white"
              disabled={serving}
            >
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              permission="healthcare.appointments.update"
              className="bg-teal-700 text-white hover:bg-teal-800 hover:text-white"
              disabled={serving}
              onClick={(event) => {
                event.preventDefault();
                void serve();
              }}
            >
              {tr(serving ? "serving" : "served")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
