import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  FlaskConical,
  RefreshCw,
  Users,
  ClipboardList,
  Activity,
  CalendarDays,
  CreditCard,
  TestTube2,
  Microscope,
  ClipboardCheck,
  FileCheck2,
  PhoneCall,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/shared/components/ui/table";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { hasPermission, storedUser } from "@/features/auth/access";
import { labApi } from "../api";
import { progressStages, stageStyles } from "../workflow";

const summaryIcons = [
  CreditCard,
  FlaskConical,
  TestTube2,
  Microscope,
  ClipboardCheck,
  FileCheck2,
  PhoneCall,
  CheckCheck,
];

export default function LaboratoryDashboardPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = storedUser();
  const resource = useApiResource(useCallback(() => labApi.dashboard(), []));
  const d = resource.data;
  const number = (value: number) =>
    new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 2 }).format(
      value,
    );
  const metrics = [
    {
      key: "totalRequests",
      value: Object.values(d?.stages ?? {}).reduce(
        (sum, value) => sum + value,
        0,
      ),
      icon: ClipboardList,
    },
    { key: "todayRequests", value: d?.todayRequests ?? 0, icon: CalendarDays },
    { key: "patientsTotal", value: d?.patients ?? 0, icon: Users },
    {
      key: "activeExaminations",
      value: d?.activeTests ?? 0,
      icon: FlaskConical,
    },
  ];

  const empty = (
    <p className="py-8 text-center text-sm text-muted-foreground">
      {t("laboratory.noDashboardData")}
    </p>
  );
  return (
    <div className="w-full space-y-6 pb-6">
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-teal-950 via-teal-900 to-teal-700 p-6 text-white shadow-lg sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -end-14 -top-24 size-80 rounded-full border-[45px] border-white/5"
        />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-teal-200">
              <FlaskConical className="size-4" />
              {t("laboratory.title")}
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("laboratory.dashboard")}
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-teal-100">
              {t("laboratory.dashboardHint")}
            </p>
            <p className="mt-3 text-xs text-teal-200">
              {t("laboratory.allTimeSummary")} · {d?.today}
            </p>
          </div>
          <Button
            variant="outline"
            className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            disabled={resource.isLoading}
            onClick={() => void resource.refresh()}
          >
            <RefreshCw className="size-4" />
            {t("laboratory.refreshDashboard")}
          </Button>
        </div>
        <div className="relative mt-6 flex flex-wrap gap-3">
          {hasPermission(user, "laboratory.pages.reception.view") &&
            hasPermission(user, "laboratory.orders.create") && (
              <Button
                className="bg-white text-teal-950 hover:bg-teal-50"
                onClick={() => navigate("/laboratory/reception")}
              >
                {t("laboratory.newRequest")}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Button>
            )}
          <Button
            variant="outline"
            className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
            permission="laboratory.pages.room.view"
            onClick={() => navigate("/laboratory/room")}
          >
            {t("laboratory.room")}
          </Button>
        </div>
      </section>
      {resource.error && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {resource.error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ key, value, icon: Icon }) => (
          <Card
            key={key}
            className="flex items-center justify-between rounded-2xl p-5"
          >
            <div>
              <p className="text-sm text-muted-foreground">
                {t(`laboratory.${key}`)}
              </p>
              <p className="mt-2 text-3xl font-bold">
                {resource.isLoading ? "…" : number(value)}
              </p>
            </div>
            <span className="rounded-xl bg-primary/10 p-3 text-primary">
              <Icon className="size-6" />
            </span>
          </Card>
        ))}
      </div>
      {hasPermission(user, "laboratory.payments.view") && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">
            {t("laboratory.paymentSummary")}
          </h2>
          {d?.currencies.map((row) => (
            <div key={row.currency} className="grid gap-4 md:grid-cols-3">
              {[
                {
                  key: "invoicedTotal",
                  value: row.invoiced,
                  style: stageStyles.waiting.badge,
                },
                {
                  key: "collectedTotal",
                  value: row.paid,
                  style: stageStyles.completed.badge,
                },
                {
                  key: "outstandingTotal",
                  value: row.balance,
                  style: stageStyles.awaiting_payment.badge,
                },
              ].map((metric) => (
                <Card
                  key={metric.key}
                  className={`rounded-2xl p-5 ${metric.style}`}
                >
                  <p className="text-sm font-medium">
                    {t(`laboratory.${metric.key}`)}
                  </p>
                  <p className="mt-3 text-2xl font-bold">
                    {number(metric.value)}{" "}
                    <span className="text-sm">{row.currency}</span>
                  </p>
                </Card>
              ))}
            </div>
          ))}
          {!resource.isLoading && !d?.currencies.length && empty}
        </section>
      )}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-2xl p-5">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <Activity className="size-5 text-primary" />
            {t("laboratory.progressOverview")}
          </h2>
          <div className="space-y-3">
            {progressStages.map((stage, index) => {
              const Icon = summaryIcons[index];
              return (
                <div
                  key={stage}
                  className="flex items-center justify-between gap-3"
                >
                  <Badge
                    className={`gap-2 px-2.5 py-1 ${stageStyles[stage].badge}`}
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    {t(`laboratory.${stage}`)}
                  </Badge>
                  <span className="font-bold tabular-nums">
                    {resource.isLoading ? "…" : number(d?.stages[stage] ?? 0)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
        <Card className="rounded-2xl p-5 xl:col-span-2">
          <h2 className="font-semibold">{t("laboratory.examinationTypes")}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("laboratory.examinationTypesHint")}
          </p>
          <div className="mt-5 space-y-4">
            {d?.examinations.map((exam, index) => (
              <div key={`${exam.name}-${exam.specimen}`}>
                <div className="mb-2 flex justify-between gap-3 text-sm">
                  <div>
                    <span className="font-medium">{exam.name}</span>
                    <span className="ms-2 text-xs text-muted-foreground">
                      {exam.specimen}
                    </span>
                  </div>
                  <span className="font-semibold">{number(exam.count)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(exam.count / Math.max(1, d.examinations[0]?.count ?? 1)) * 100}%`,
                      backgroundColor:
                        stageStyles[
                          progressStages[index % progressStages.length]
                        ].color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          {!resource.isLoading && !d?.examinations.length && empty}
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden rounded-2xl">
          <h2 className="p-5 font-semibold">
            {t("laboratory.recentRequests")}
          </h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {["patient", "queueNumber", "status"].map((key) => (
                    <TableHead key={key}>{t(`laboratory.${key}`)}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody autoPaginate={false}>
                {d?.recent.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <p className="font-medium">
                        {order.patient.firstName} {order.patient.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.patient.patientCode}
                      </p>
                    </TableCell>
                    <TableCell>
                      {order.queueNumber}
                      <p className="text-xs text-muted-foreground">
                        {order.queueDay}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge className={stageStyles[order.status]?.badge}>
                        {t(`laboratory.${order.status}`)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {!resource.isLoading && !d?.recent.length && empty}
        </Card>
        {hasPermission(user, "laboratory.payments.view") && (
          <Card className="overflow-hidden rounded-2xl">
            <h2 className="p-5 font-semibold">
              {t("laboratory.paymentsByMethod")}
            </h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {["paymentMethod", "paymentCount", "paymentAmount"].map(
                      (key) => (
                        <TableHead key={key}>
                          {t(`laboratory.${key}`)}
                        </TableHead>
                      ),
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody autoPaginate={false}>
                  {d?.methods.map((row) => (
                    <TableRow key={`${row.currency}-${row.method}`}>
                      <TableCell>{t(`laboratory.${row.method}`)}</TableCell>
                      <TableCell>{number(row.total)}</TableCell>
                      <TableCell>
                        {number(row.amount)} {row.currency}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {!resource.isLoading && !d?.methods.length && empty}
          </Card>
        )}
      </div>
    </div>
  );
}
