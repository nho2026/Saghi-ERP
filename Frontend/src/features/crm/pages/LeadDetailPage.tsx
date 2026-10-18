import { hasPagePermission } from "@/features/auth/access";
import { useCallback } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarPlus,
  CalendarDays,
  Check,
  CircleX,
  Clock3,
  FileText,
  Globe2,
  Languages,
  Mail,
  MapPin,
  Paperclip,
  Phone,
  Sparkles,
  TrendingUp,
  UserRound,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { crmApi, leadAttachmentApi, type CrmRecord } from "../api/crm.api";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { storedUser } from "@/features/auth/access";
import { toast } from "sonner";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

const stages = [
  "new",
  "contacted",
  "qualified",
  "appointment_requested",
  "surgery_appointment",
  "converted",
  "direct_surgery_converted",
];
const colors: Record<string, string> = {
  new: "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-300",
  contacted:
    "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-300",
  qualified:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300",
  appointment_requested:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  converted:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  lost: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
};

export default function LeadDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const canManage = hasPagePermission(
    storedUser(),
    "create",
    "update",
    "delete",
  );
  const lead = useApiResource(useCallback(() => crmApi.leads.get(id), [id]));
  if (!lead.data)
    return (
      <div className="p-10 text-center text-muted-foreground">
        {t("crm.progress.detail.loading", {
          defaultValue: "Loading lead profile…",
        })}
      </div>
    );

  const item = lead.data;
  const history = (item.statusHistory ?? []) as CrmRecord[];
  const attachments = (item.attachments ?? []) as CrmRecord[];
  const status = String(item.status ?? "new");
  const current = stages.indexOf(status);
  const tr = (value: unknown) =>
    t(`crm.values.${String(value)}`, {
      defaultValue: String(value ?? "—").replaceAll("_", " "),
    });
  const text = (value: unknown) =>
    String(
      value ||
        t("crm.progress.detail.notRecorded", { defaultValue: "Not recorded" }),
    );
  const initials = String(item.name ?? "L")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const date = (value: unknown) =>
    new Intl.DateTimeFormat(i18n.resolvedLanguage, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(String(value)));
  const details = [
    [Phone, t("crm.fields.phone"), text(item.phone)],
    [Phone, t("crm.fields.secondaryPhone"), text(item.secondaryPhone)],
    [Mail, t("crm.fields.email"), text(item.email)],
    [MapPin, t("crm.fields.address"), text(item.address)],
    [UserRound, t("crm.fields.gender"), tr(item.gender)],
    [
      CalendarDays,
      t("crm.fields.dateOfBirth"),
      item.dateOfBirth
        ? new Date(String(item.dateOfBirth)).toLocaleDateString(
            i18n.resolvedLanguage,
          )
        : text(null),
    ],
    [
      Languages,
      t("crm.fields.preferredLanguage"),
      text(item.preferredLanguage),
    ],
    [BriefcaseBusiness, t("crm.fields.interest"), text(item.interest)],
    [Globe2, t("crm.fields.country"), text(item.country)],
    [MapPin, t("crm.fields.city"), text(item.city)],
  ] as const;

  const markAsLost = async () => {
    try {
      await crmApi.leads.update(id, { status: "lost" });
      await lead.refresh();
      toast.success(t("crm.progress.detail.markedLost"));
    } catch {
      toast.error(t("crm.errors.markLost"));
    }
  };
  const removeAttachment = async (attachmentId: string) => {
    try {
      await leadAttachmentApi.remove(id, attachmentId);
      await lead.refresh();
    } catch {
      toast.error(t("crm.errors.attachmentDelete"));
    }
  };

  return (
    <div className="mx-auto max-w-[1320px] space-y-6 pb-10">
      <header className="flex flex-wrap items-center gap-3">
        <Button
          size="icon"
          variant="outline"
          className="rounded-xl"
          onClick={() => navigate("/crm/leads/progress")}
        >
          <ArrowLeft className="rtl:rotate-180" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">
            {t("crm.progress.detail.eyebrow", { defaultValue: "Lead profile" })}
          </p>
          <h1 className="text-2xl font-bold">{String(item.name)}</h1>
        </div>
        <Button
          permission="laboratory.orders.create"
          variant="outline"
          onClick={() => navigate(`/laboratory/reception?leadId=${id}`)}
        >
          {t("laboratory.title")}
        </Button>
        {canManage && status !== "lost" && (
          <Button
            permission="update"
            className="ms-auto"
            variant="destructive"
            onClick={() => void markAsLost()}
          >
            <CircleX /> {t("crm.progress.detail.markLost")}
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => navigate("/crm/leads/progress")}
        >
          <TrendingUp /> {t("crm.progress.detail.viewProgress")}
        </Button>
        {canManage && (
          <Button
            permission="update"
            variant="outline"
            onClick={() => navigate(`/crm/leads?edit=${id}`)}
          >
            {t("common.edit", { defaultValue: "Edit" })}
          </Button>
        )}
        <Button
          permission="healthcare.appointments.create"
          onClick={() =>
            navigate(
              `/crm/appointments?patientName=${encodeURIComponent(String(item.name))}&patientPhone=${encodeURIComponent(String(item.phone))}`,
            )
          }
        >
          <CalendarPlus /> {t("crm.progress.detail.bookAppointment")}
        </Button>
      </header>

      <Card className="relative overflow-hidden border-primary/20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-r from-primary/15 via-primary/5 to-transparent" />
        <CardContent className="relative p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid size-20 shrink-0 place-items-center rounded-3xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
                {initials}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold">{String(item.name)}</h2>
                  <Badge variant="outline" className={colors[status]}>
                    <span className="me-1.5 size-1.5 rounded-full bg-current" />
                    {tr(status)}
                  </Badge>
                </div>
                <p className="mt-1 font-mono text-sm font-medium text-muted-foreground">
                  {String(item.code ?? "—")}
                </p>
                <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="size-4 text-primary" />
                  {t("crm.progress.detail.profileHint", {
                    defaultValue:
                      "Complete lead profile and conversion journey",
                  })}
                </p>
              </div>
            </div>
            <div className="grid min-w-56 grid-cols-2 gap-3">
              <div className="rounded-2xl border bg-card/80 p-3">
                <p className="text-xs text-muted-foreground">
                  {t("crm.fields.source")}
                </p>
                <p className="mt-1 font-semibold">{text(item.source)}</p>
              </div>
              <div className="rounded-2xl border bg-card/80 p-3">
                <p className="text-xs text-muted-foreground">
                  {t("crm.progress.detail.currentStage", {
                    defaultValue: "Current stage",
                  })}
                </p>
                <p className="mt-1 font-semibold">{tr(status)}</p>
              </div>
            </div>
          </div>
          {status !== "lost" && (
            <div className="mt-8 overflow-x-auto pb-2">
              <div className="relative grid min-w-[760px] grid-cols-7">
                <span className="absolute inset-x-[10%] top-5 h-0.5 bg-border" />
                {current > 0 && (
                  <span
                    className="absolute inset-s-[10%] top-5 h-0.5 bg-primary"
                    style={{
                      width: `${(current / (stages.length - 1)) * 80}%`,
                    }}
                  />
                )}
                {stages.map((stage, index) => (
                  <div
                    key={stage}
                    className="relative z-10 flex flex-col items-center"
                  >
                    <span
                      className={`grid size-10 place-items-center rounded-full border-2 ${index <= current ? "border-primary bg-primary text-primary-foreground shadow-[0_0_0_5px_hsl(var(--primary)/.1)]" : "border-border bg-card text-muted-foreground"}`}
                    >
                      {index < current ? (
                        <Check className="size-4" />
                      ) : (
                        <span className="text-xs font-bold">{index + 1}</span>
                      )}
                    </span>
                    <span
                      className={`mt-3 text-xs font-semibold ${index <= current ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {tr(stage)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,.8fr)]">
        <div className="order-2 min-w-0 space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserRound className="size-5 text-primary" />
                {t("crm.progress.detail.contactDetails", {
                  defaultValue: "Contact details",
                })}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 p-6 sm:grid-cols-2">
              {details.map(([Icon, title, value]) => (
                <div
                  key={title}
                  className="flex items-center gap-3 rounded-2xl border bg-muted/15 p-4"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{title}</p>
                    <p className="truncate text-sm font-semibold">{value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="size-5 text-primary" />
                {t("crm.fields.notes")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                {text(item.notes)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-base">
                <Paperclip className="size-5 text-primary" />
                {t("crm.leadForm.attachments")}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 p-6">
              {attachments.length ? (
                attachments.map((attachment) => (
                  <div
                    key={String(attachment.id)}
                    className="flex items-center gap-3 rounded-xl border p-3"
                  >
                    {String(attachment.mimeType ?? "").startsWith("image/") ? (
                      <img
                        src={String(attachment.fileUrl)}
                        alt=""
                        className="size-12 rounded-lg border object-cover"
                      />
                    ) : (
                      <Paperclip className="size-4 shrink-0 text-primary" />
                    )}
                    <a
                      className="min-w-0 flex-1 truncate text-sm font-medium text-primary hover:underline"
                      href={String(attachment.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {String(attachment.fileName)}
                    </a>
                    {canManage && (
                      <Button
                        data-action="delete"
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          void removeAttachment(String(attachment.id))
                        }
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="py-5 text-center text-sm text-muted-foreground">
                  {t("crm.leadForm.noAttachments")}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">
                {t("crm.progress.detail.insights")}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 p-6 text-sm sm:grid-cols-3">
              <div className="flex justify-between gap-3 sm:block">
                <span className="text-muted-foreground">
                  {t("crm.fields.age")}
                </span>
                <strong className="sm:mt-1 sm:block">
                  {String(item.age ?? "—")}
                </strong>
              </div>
              <div className="flex justify-between gap-3 sm:block">
                <span className="text-muted-foreground">
                  {t("crm.progress.detail.historyEvents")}
                </span>
                <strong className="sm:mt-1 sm:block">{history.length}</strong>
              </div>
              <div className="flex justify-between gap-3 sm:block">
                <span className="text-muted-foreground">
                  {t("crm.progress.detail.currentStage")}
                </span>
                <strong className="sm:mt-1 sm:block">{tr(status)}</strong>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="contents">
          <Card
            id="timeline"
            className="order-1 scroll-mt-6 overflow-hidden lg:col-span-2"
          >
            <CardHeader className="border-b bg-muted/20 py-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock3 className="size-5 text-primary" />
                {t("crm.progress.detail.history", {
                  defaultValue: "Progress history",
                })}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t("crm.progress.detail.historyHint", {
                  defaultValue: "Every recorded stage in this lead journey.",
                })}
              </p>
            </CardHeader>
            <CardContent className="p-4">
              {history.length ? (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {history.map((entry) => (
                    <div
                      key={String(entry.id)}
                      className="flex min-w-[210px] flex-1 items-start gap-3 rounded-xl border bg-muted/10 p-3"
                    >
                      <span
                        className={`grid size-8 shrink-0 place-items-center rounded-full border ${colors[String(entry.toStatus)] ?? "bg-primary/10 text-primary"}`}
                      >
                        <Check className="size-3.5" />
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p className="truncate text-sm font-semibold">
                          {tr(entry.toStatus)}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarDays className="size-3.5" />
                          {date(entry.createdAt)}
                        </p>
                        {Boolean(entry.fromStatus) && (
                          <p className="mt-2 rounded-lg bg-muted/40 px-2.5 py-1.5 text-xs">
                            {t("crm.progress.detail.changedFrom", {
                              status: tr(entry.fromStatus),
                              defaultValue: `From ${tr(entry.fromStatus)}`,
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <Clock3 className="mx-auto mb-3 size-9 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    {t("crm.progress.detail.noHistory", {
                      defaultValue: "No status changes recorded yet.",
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="order-3 min-w-0 space-y-6">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-base">
                  {t("crm.progress.detail.leadDetails")}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-1">
                {[
                  [t("crm.fields.knowledgeRating"), text(item.knowledgeRating)],
                  [t("crm.fields.budgetRange"), text(item.budgetRange)],
                  [t("crm.fields.maritalStatus"), tr(item.maritalStatus)],
                  [t("crm.fields.source"), text(item.source)],
                  [
                    t("crm.fields.leadSourceChannel"),
                    tr(item.leadSourceChannel),
                  ],
                  [t("crm.fields.contactMethod"), tr(item.contactMethod)],
                  [t("crm.fields.patientType"), tr(item.patientType)],
                  [
                    t("crm.fields.satisfactionScore"),
                    `${Number(item.satisfactionScore ?? 0)}%`,
                  ],
                  [
                    t("crm.fields.decisionInfluencers"),
                    text(item.decisionInfluencers),
                  ],
                  [t("crm.fields.painPoints"), text(item.painPoints)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 font-semibold">{value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-base">
                  {t("crm.progress.detail.referralInformation")}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 p-6">
                {[
                  [t("crm.fields.referralPersona"), tr(item.referralPersona)],
                  [t("crm.fields.referralName"), text(item.referralName)],
                  [t("crm.fields.referralPhone"), text(item.referralPhone)],
                  [t("crm.fields.referralAddress"), text(item.referralAddress)],
                  [t("crm.fields.referralNote"), text(item.referralNote)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 font-semibold">{value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
