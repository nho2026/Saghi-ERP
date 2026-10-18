import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CalendarPlus,
  ContactRound,
  CreditCard,
  HeartPulse,
  Search,
  UsersRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { crmApi, type CrmRecord } from "../api/crm.api";
import { healthcareApi } from "@/features/healthcare/api/healthcare.api";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { hasPermission, storedUser } from "@/features/auth/access";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";

const personName = (person: CrmRecord) =>
  String(
    person.name ??
      `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim(),
  );

const pageTotal = (value: any) => Number(value?.pagination?.total ?? 0);

export default function CrmDashboardPage() {
  const { t, i18n } = useTranslation();
  const user = storedUser();
  const [search, setSearch] = useState("");
  const canViewLeads = hasPermission(user, "crm.leads.view");
  const canViewPatients = hasPermission(user, "crm.patients.view");
  const canViewAppointments = hasPermission(user, "healthcare.appointments.view");
  const canViewSurgeries = hasPermission(user, "crm.surgeries.view");

  const leads = useApiResource(
    useCallback(
      () =>
        canViewLeads
          ? crmApi.leads.list(1, 100)
          : Promise.resolve(null),
      [canViewLeads],
    ),
  );
  const patients = useApiResource(
    useCallback(
      () =>
        canViewPatients
          ? crmApi.patients.list(1, 1)
          : Promise.resolve(null),
      [canViewPatients],
    ),
  );
  const appointments = useApiResource(
    useCallback(
      () =>
        canViewAppointments
          ? healthcareApi.appointments.list()
          : Promise.resolve(null),
      [canViewAppointments],
    ),
  );
  const surgeries = useApiResource(
    useCallback(
      () =>
        canViewSurgeries
          ? crmApi.surgeries.list(1, 1)
          : Promise.resolve(null),
      [canViewSurgeries],
    ),
  );

  const recentLeads = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return (leads.data?.items ?? [])
      .filter((lead) =>
        `${personName(lead)} ${lead.phone ?? ""}`
          .toLocaleLowerCase()
          .includes(query),
      )
      .slice(0, 10);
  }, [leads.data, search]);

  const todayAppointments = (appointments.data ?? []).filter((item) => {
    const scheduledAt = new Date(String(item.scheduledAt ?? ""));
    return (
      !Number.isNaN(scheduledAt.getTime()) &&
      scheduledAt.toDateString() === new Date().toDateString() &&
      String(item.status ?? "").toLowerCase() !== "cancelled"
    );
  });
  const upcomingAppointments = (appointments.data ?? [])
    .filter((item) => {
      const scheduledAt = new Date(String(item.scheduledAt ?? ""));
      return (
        !Number.isNaN(scheduledAt.getTime()) &&
        scheduledAt.getTime() >= Date.now() &&
        String(item.status ?? "").toLowerCase() !== "cancelled"
      );
    })
    .sort(
      (a, b) =>
        new Date(String(a.scheduledAt)).getTime() -
        new Date(String(b.scheduledAt)).getTime(),
    )
    .slice(0, 10);

  const links = [
    {
      to: "/crm/leads",
      label: t("navigation.crmLeads"),
      permission: "crm.leads.view",
      icon: ContactRound,
    },
    {
      to: "/crm/patients",
      label: t("navigation.crmPatients"),
      permission: "crm.patients.view",
      icon: UsersRound,
    },
    {
      to: "/crm/appointments",
      label: t("navigation.doctorAppointments"),
      permission: "healthcare.appointments.view",
      icon: CalendarPlus,
    },
    {
      to: "/crm/payments",
      label: t("navigation.crmPayments"),
      permission: "crm.payments.view",
      icon: CreditCard,
    },
  ].filter((item) => hasPermission(user, item.permission));

  const stats = [
    {
      label: t("crmDashboard.leads"),
      note: t("crmDashboard.leadsNote"),
      count: canViewLeads
        ? leads.isLoading || leads.error
          ? "—"
          : pageTotal(leads.data)
        : "—",
      icon: ContactRound,
      color: "bg-teal-500/10 text-teal-700",
    },
    {
      label: t("crmDashboard.patients"),
      note: t("crmDashboard.patientsNote"),
      count: canViewPatients
        ? patients.isLoading || patients.error
          ? "—"
          : pageTotal(patients.data)
        : "—",
      icon: UsersRound,
      color: "bg-sky-500/10 text-sky-700",
    },
    {
      label: t("crmDashboard.appointmentsToday"),
      note: t("crmDashboard.appointmentsNote"),
      count: canViewAppointments
        ? appointments.isLoading || appointments.error
          ? "—"
          : todayAppointments.length
        : "—",
      icon: CalendarDays,
      color: "bg-amber-500/10 text-amber-700",
    },
    {
      label: t("crmDashboard.surgeries"),
      note: t("crmDashboard.surgeriesNote"),
      count: canViewSurgeries
        ? surgeries.isLoading || surgeries.error
          ? "—"
          : pageTotal(surgeries.data)
        : "—",
      icon: HeartPulse,
      color: "bg-rose-500/10 text-rose-700",
    },
  ];

  const formatDate = (value: unknown) => {
    const date = new Date(String(value ?? ""));
    return Number.isNaN(date.getTime())
      ? "—"
      : new Intl.DateTimeFormat(i18n.resolvedLanguage, {
          dateStyle: "medium",
        }).format(date);
  };
  const formatDateTime = (value: unknown) => {
    const date = new Date(String(value ?? ""));
    return Number.isNaN(date.getTime())
      ? "—"
      : new Intl.DateTimeFormat(i18n.resolvedLanguage, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(date);
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 rounded-2xl bg-muted/30 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute inset-s-3 top-3 size-4 text-muted-foreground" />
          <Input
            className="rounded-full border-0 bg-muted/40 ps-9"
            placeholder={t("crmDashboard.search")}
            aria-label={t("crmDashboard.search")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Badge variant="outline" className="rounded-full px-3 py-2">
          <span className="me-2 size-2 rounded-full bg-primary" />
          {t("crmDashboard.workspace")}
        </Badge>
      </div>

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("navigation.crmDashboard")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("crmDashboard.subtitle")}
          </p>
        </div>
        {hasPermission(user, "crm.leads.create") && (
          <Button asChild className="rounded-full">
            <Link to="/crm/leads">
              <ContactRound className="size-4" />
              {t("crmDashboard.openLeads")}
            </Link>
          </Button>
        )}
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, note, count, icon: Icon, color }, index) => (
          <Card
            key={label}
            className={`rounded-2xl border-0 p-5 shadow-none ${index === 0 ? "bg-linear-to-br from-[#003c30] to-[#008260] text-white" : ""}`}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium">{label}</h2>
              <span
                className={`grid size-10 place-items-center rounded-xl ${index === 0 ? "bg-white/15" : color}`}
              >
                <Icon className="size-5" />
              </span>
            </div>
            <p className="my-5 text-4xl font-medium">{count}</p>
            <p
              className={`text-xs ${index === 0 ? "text-emerald-100" : "text-muted-foreground"}`}
            >
              {note}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="rounded-2xl border-0 p-5 shadow-none xl:col-span-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">{t("crmDashboard.recentLeads")}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("crmDashboard.recentLeadsNote")}
              </p>
            </div>
            {canViewLeads && (
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link to="/crm/leads">
                  {t("crmDashboard.viewAll")}
                  <ArrowRight className="size-3" />
                </Link>
              </Button>
            )}
          </div>
          <div className="space-y-3">
            {recentLeads.map((lead) => (
              <Link
                key={lead.id}
                to={`/crm/leads/${lead.id}`}
                className="flex items-center gap-3 rounded-xl bg-muted/25 p-3 transition-colors hover:bg-muted/50"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {personName(lead).slice(0, 1) || "—"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {personName(lead) || t("crmDashboard.unnamedLead")}
                  </span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">
                    {[lead.phone, lead.source]
                      .filter(Boolean)
                      .map(String)
                      .join(" · ") || formatDate(lead.createdAt)}
                  </span>
                </span>
                <Badge variant="outline">
                  {t(`patientProgress.${String(lead.status ?? "new")}`, {
                    defaultValue: String(lead.status ?? "new"),
                  })}
                </Badge>
              </Link>
            ))}
            {!recentLeads.length && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {leads.isLoading
                  ? t("crmDashboard.loadingLeads")
                  : leads.error
                    ? leads.error
                    : t("crmDashboard.noLeads")}
              </p>
            )}
          </div>
        </Card>

        <div className="flex flex-col gap-4 xl:col-span-4">
          <Card className="rounded-2xl border-0 p-5 shadow-none">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">
                  {t("crmDashboard.upcomingAppointments")}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("crmDashboard.upcomingAppointmentsNote")}
                </p>
              </div>
              <CalendarDays className="size-5 text-primary" />
            </div>
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-muted/25 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {String(
                        appointment.patientName ??
                          (appointment.patient as any)?.name ??
                          "—",
                      )}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDateTime(appointment.scheduledAt)}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {[
                        (appointment.doctor as any)?.employee?.firstName &&
                          `${(appointment.doctor as any).employee.firstName} ${(appointment.doctor as any).employee.lastName ?? ""}`.trim(),
                        (appointment.department as any)?.name,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {t(`patientProgress.${String(appointment.status ?? "scheduled")}`, {
                      defaultValue: String(appointment.status ?? "scheduled"),
                    })}
                  </Badge>
                </div>
              ))}
              {!upcomingAppointments.length && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {appointments.isLoading
                    ? t("crmDashboard.loadingAppointments")
                    : t("crmDashboard.noAppointments")}
                </p>
              )}
            </div>
          </Card>

          <Card className="rounded-2xl border-0 p-5 shadow-none">
            <h2 className="mb-3 font-semibold">{t("crmDashboard.quickAccess")}</h2>
            <div className="space-y-1">
              {links.map(({ to, label, icon: Icon }) => (
                <Button
                  key={to}
                  asChild
                  variant="ghost"
                  className="w-full justify-between"
                >
                  <Link to={to}>
                    <span className="flex items-center gap-2">
                      <Icon className="size-4 text-primary" />
                      {label}
                    </span>
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              ))}
              {!links.length && (
                <p className="py-4 text-sm text-muted-foreground">
                  {t("crmDashboard.noQuickAccess")}
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
