import type { LabOrder } from "@/features/laboratory/api";
import { hasPermission } from "@/features/auth/access";
import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Droplets,
  FileText,
  HeartPulse,
  MapPin,
  Pencil,
  Stethoscope,
  UserRound,
  ClipboardPlus,
  Download,
  Activity,
  Bell,
  CalendarClock,
  FlaskConical,
  History,
  Pill,
} from "lucide-react";
import { apiClient, apiErrorMessage } from "@/shared/api/client";
import { toast } from "sonner";
import {
  crmApi,
  crmFormsApi,
  type CrmRecord,
  type FormTemplate,
} from "../api/crm.api";
import { storedUser } from "@/features/auth/access";
import { settingsSnapshot } from "@/features/settings/settings";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { FormDatePicker } from "@/shared/components/ui/form-date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import nhoLogo from "@/assets/icons/nho-logo-rounded.png";

const text = (value: unknown, fallback = "Not recorded") =>
  value == null || value === "" ? fallback : String(value);
const fullName = (patient: CrmRecord) =>
  `${text(patient.firstName, "")} ${text(patient.lastName, "")}`.trim();
const doctorName = (visit: CrmRecord) => {
  const employee = (visit.doctor as CrmRecord | undefined)?.employee as
    CrmRecord | undefined;
  return employee
    ? `${text(employee.firstName, "")} ${text(employee.lastName, "")}`.trim()
    : "Doctor not assigned";
};

export default function PatientProfilePage({
  patientId,
  onBack,
  compact = false,
}: { patientId?: string; onBack?: () => void; compact?: boolean } = {}) {
  const { t } = useTranslation();
  const { id: routeId = "" } = useParams();
  const id = patientId ?? routeId;
  const navigate = useNavigate();
  const location = useLocation();
  const backPath =
    location.state?.from === "/crm/today-patients"
      ? "/crm/today-patients"
      : location.state?.from === "/crm/follow-up"
        ? "/crm/follow-up"
        : "/crm/patients";
  const canManage = hasPermission(storedUser(), "crm.patients.update");
  const canViewLaboratory = hasPermission(
    storedUser(),
    "laboratory.orders.view",
  );
  const laboratoryResults = useApiResource(
    useCallback(async () => {
      if (!canViewLaboratory) return null;
      return (
        (
          await apiClient.get<{ items: LabOrder[] }>("/laboratory/orders", {
            params: {
              patientId: id,
              resultsReady: "true",
              page: 1,
              pageSize: 1,
            },
          })
        ).data.items[0] ?? null
      );
    }, [id, canViewLaboratory]),
  );
  const profile = useApiResource(
    useCallback(() => crmApi.patients.get(id), [id]),
  );
  const templates = useApiResource(
    useCallback(() => crmFormsApi.activeTemplates(), []),
  );
  const submissions = useApiResource(
    useCallback(() => crmFormsApi.submissions(id), [id]),
  );
  const [showDetails, setShowDetails] = useState(false);
  const [editing, setEditing] = useState(false);
  const [sendingFollowUp, setSendingFollowUp] = useState(false);
  const [sendingToIcu, setSendingToIcu] = useState(false);
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const followUpLock = useRef(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const profileSaveLock = useRef(false);
  const [isMarried, setIsMarried] = useState(false);
  const [hasDiabetes, setHasDiabetes] = useState(false);
  const [hasHypertension, setHasHypertension] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(
    null,
  );
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const patient = profile.data;
  useEffect(() => {
    if (
      !patient ||
      !canManage ||
      new URLSearchParams(location.search).get("edit") !== "1"
    )
      return;
    setIsMarried(Boolean(patient.isMarried));
    setHasDiabetes(Boolean(patient.hasDiabetes));
    setHasHypertension(Boolean(patient.hasHypertension));
    setEditing(true);
    const query = new URLSearchParams(location.search);
    query.delete("edit");
    navigate(
      { pathname: location.pathname, search: query.toString() },
      { replace: true, state: location.state },
    );
  }, [patient, canManage, location, navigate]);
  const lead = patient?.lead as CrmRecord | null | undefined;
  const appointments = (patient?.appointments ?? []) as CrmRecord[];
  const surgeries = (patient?.surgeryAppointments ?? []) as CrmRecord[];
  const payments = (patient?.payments ?? []) as CrmRecord[];
  const referrals = (patient?.referrals ?? []) as CrmRecord[];
  const age = useMemo(() => {
    if (patient?.dateOfBirth) {
      const birth = new Date(String(patient.dateOfBirth));
      const now = new Date();
      return (
        now.getFullYear() -
        birth.getFullYear() -
        (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())
          ? 1
          : 0)
      );
    }
    return lead?.age ?? null;
  }, [patient?.dateOfBirth, lead?.age]);
  const visits = useMemo<Array<CrmRecord & { kind: string }>>(
    () =>
      [
        ...appointments.map((visit) => ({ ...visit, kind: "Consultation" })),
        ...surgeries.map((visit) => ({ ...visit, kind: "Surgery" })),
      ]
        .sort(
          (a, b) =>
            new Date(String((b as CrmRecord).scheduledAt)).getTime() -
            new Date(String((a as CrmRecord).scheduledAt)).getTime(),
        )
        .slice(0, 6),
    [appointments, surgeries],
  );
  const upcomingAppointments = appointments.filter(
    (appointment) =>
      new Date(String(appointment.scheduledAt)).getTime() >= Date.now() &&
      !["completed", "cancelled"].includes(String(appointment.status)),
  );
  const latestSurgery = surgeries[0];
  const latestVisit = visits[0];
  const medicalStatus = submissions.data?.length
    ? "Medical assessment done"
    : "Assessment pending";

  if (profile.isLoading || !patient)
    return (
      <div className="p-10 text-center text-muted-foreground">
        Loading patient profile…
      </div>
    );

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManage || profileSaveLock.current) return;
    const form = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(
      [
        "dateOfBirth",
        "firstName",
        "lastName",
        "phone",
        "email",
        "gender",
        "bloodType",
        "address",
        "allergies",
        "medicalNotes",
        "weightKg",
        "heightCm",
      ].map((key) => [key, String(form.get(key) ?? "") || null]),
    );
    payload.weightKg = payload.weightKg ? Number(payload.weightKg) : null;
    payload.heightCm = payload.heightCm ? Number(payload.heightCm) : null;
    payload.isMarried = isMarried;
    payload.childrenCount = payload.isMarried
      ? Number(form.get("childrenCount") ?? 0)
      : 0;
    payload.hasDiabetes = hasDiabetes;
    payload.hasHypertension = hasHypertension;
    profileSaveLock.current = true;
    setSavingProfile(true);
    try {
      await crmApi.patients.update(id, payload);
      setEditing(false);
      await profile.refresh();
      toast.success("Patient profile updated.");
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      profileSaveLock.current = false;
      setSavingProfile(false);
    }
  };
  const submitClinicalForm = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!selectedTemplate) return;
    try {
      await crmFormsApi.submit(id, {
        formTemplateId: selectedTemplate.id,
        data: formValues,
      });
      setFormOpen(false);
      setSelectedTemplate(null);
      setFormValues({});
      await submissions.refresh();
      toast.success("Patient form submitted.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to submit form.",
      );
    }
  };

  const exportPatientReport = () => {
    const reportWindow = window.open("", "_blank");
    if (!reportWindow)
      return toast.error("Allow pop-ups to export the PDF report.");
    const escape = (value: unknown) =>
      text(value, "—")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
    const row = (label: string, value: unknown) =>
      `<div class="detail"><span>${label}</span><strong>${escape(value)}</strong></div>`;
    const table = (headers: string[], body: string) =>
      `<table><thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead><tbody>${body || `<tr><td colspan="${headers.length}">No records</td></tr>`}</tbody></table>`;
    const allVisits = [...appointments, ...surgeries];
    const statusCounts = allVisits.reduce<Record<string, number>>(
      (result, item) => {
        const key = String(item.status ?? "Unknown");
        result[key] = (result[key] ?? 0) + 1;
        return result;
      },
      {},
    );
    const colors = ["#1C9B49", "#14b8a6", "#8b5cf6", "#f59e0b", "#ef4444"];
    const maxStatus = Math.max(1, ...Object.values(statusCounts));
    const statusChart = Object.entries(statusCounts)
      .map(
        ([label, count], index) =>
          `<div class="bar-row"><div><span>${escape(label)}</span><strong>${count}</strong></div><i><b style="width:${(count / maxStatus) * 100}%;background:${colors[index % colors.length]}"></b></i></div>`,
      )
      .join("");
    const totalPaid = payments.reduce(
      (sum, payment) => sum + Number(payment.amount ?? 0),
      0,
    );
    const logoUrl = new URL(nhoLogo, window.location.href).href;
    const organizationName = settingsSnapshot()?.organization.name || "";
    const clinicalForms = (submissions.data ?? []) as CrmRecord[];
    reportWindow.document.write(
      `<!doctype html><html><head><title>${escape(fullName(patient))} — Patient Report</title><style>@page{size:A4;margin:14mm}*{box-sizing:border-box}body{margin:0;font:11px Arial;color:#172033;-webkit-print-color-adjust:exact;print-color-adjust:exact}.cover{height:267mm;display:flex;flex-direction:column;justify-content:center;padding:58px;background:linear-gradient(145deg,#f8fbff,#e2edff);page-break-after:always;position:relative;overflow:hidden}.cover:after{content:"";position:absolute;width:360px;height:360px;border-radius:50%;background:#1C9B49;right:-170px;top:-130px}.logo{width:110px;margin-bottom:38px}.eyebrow{color:#1C9B49;font-weight:bold;letter-spacing:3px}.cover h1{font-size:40px;color:#102a56;margin:14px 0}.cover h2{font-size:22px;color:#526783}.cover-meta{margin-top:40px;border-top:1px solid #bdcee4;padding-top:18px;font-size:15px}.header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #1C9B49;padding-bottom:12px}.brand{display:flex;align-items:center;gap:10px}.brand img{width:42px}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:18px 0}.kpi,.panel{border:1px solid #dce5f0;border-radius:12px;padding:14px}.kpi span{color:#667085}.kpi strong{display:block;font-size:22px;color:#126A31;margin-top:5px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.details{display:grid;grid-template-columns:1fr 1fr;gap:10px}.detail{border-bottom:1px solid #edf1f7;padding:7px 0}.detail span{display:block;color:#667085;font-size:9px;text-transform:uppercase}.detail strong{display:block;margin-top:3px}.panel h2,.section h2{font-size:15px;margin:0 0 12px}.bar-row{margin:10px 0}.bar-row div{display:flex;justify-content:space-between;text-transform:capitalize}.bar-row i{display:block;height:9px;background:#edf1f7;border-radius:10px;margin-top:5px;overflow:hidden}.bar-row b{display:block;height:100%;border-radius:10px}.section{margin-top:18px;break-inside:avoid}table{width:100%;border-collapse:collapse;font-size:9px}thead{display:table-header-group}th{background:#126A31;color:#fff;padding:7px;text-align:left}td{padding:7px;border-bottom:1px solid #dde5ef;vertical-align:top}tr{break-inside:avoid}tbody tr:nth-child(even){background:#f7f9fc}.page-break{page-break-before:always}</style></head><body><section class="cover"><img class="logo" src="${logoUrl}"><div class="eyebrow">${escape(organizationName)} · PATIENT CARE</div><h1>Complete Patient Report</h1><h2>${escape(fullName(patient))}</h2><div class="cover-meta">Patient code: <strong>${escape(patient.patientCode)}</strong><br>Generated: ${escape(new Date().toLocaleString())}<br>Confidential medical record</div></section><main><header class="header"><div class="brand"><img src="${logoUrl}"><div><h1>${escape(fullName(patient))}</h1><span>${escape(patient.patientCode)}</span></div></div><strong>Complete Patient Profile</strong></header><section class="kpis"><div class="kpi"><span>Total visits</span><strong>${allVisits.length}</strong></div><div class="kpi"><span>Surgeries</span><strong>${surgeries.length}</strong></div><div class="kpi"><span>Clinical forms</span><strong>${clinicalForms.length}</strong></div><div class="kpi"><span>Total payments</span><strong>${totalPaid.toLocaleString()}</strong></div></section><section class="grid"><div class="panel"><h2>Personal information</h2><div class="details">${row("Full name", fullName(patient))}${row("Date of birth", patient.dateOfBirth ? new Date(String(patient.dateOfBirth)).toLocaleDateString() : null)}${row("Age", age)}${row("Gender", patient.gender)}${row("Phone", patient.phone)}${row("Email", patient.email)}${row("Address", patient.address)}${row("Status", patient.status)}${row("Marital status", patient.isMarried ? "Married" : "Not married")}${row("Children", patient.childrenCount)}</div></div><div class="panel"><h2>Medical information</h2><div class="details">${row("Blood type", patient.bloodType)}${row("Weight", patient.weightKg ? `${patient.weightKg} kg` : null)}${row("Height", patient.heightCm ? `${patient.heightCm} cm` : null)}${row("Diabetes", patient.hasDiabetes ? "Yes" : "No")}${row("Hypertension", patient.hasHypertension ? "Yes" : "No")}${row("Allergies", patient.allergies)}${row("Medical notes", patient.medicalNotes)}</div></div></section><section class="grid" style="margin-top:12px"><div class="panel"><h2>Visit status chart</h2>${statusChart || "No visit data"}</div><div class="panel"><h2>Care activity</h2><div class="bar-row"><div><span>Consultations</span><strong>${appointments.length}</strong></div><i><b style="width:${allVisits.length ? (appointments.length / allVisits.length) * 100 : 0}%;background:#1C9B49"></b></i></div><div class="bar-row"><div><span>Surgeries</span><strong>${surgeries.length}</strong></div><i><b style="width:${allVisits.length ? (surgeries.length / allVisits.length) * 100 : 0}%;background:#14b8a6"></b></i></div><div class="details">${row("Lead source", lead?.source)}${row("Lead code", lead?.code)}${row("Interest", lead?.interest)}${row("Referrals", referrals.length)}</div></div></section><section class="section"><h2>Doctor appointments</h2>${table(["Date", "Doctor", "Department", "Reason", "Status"], appointments.map((item) => `<tr><td>${escape(new Date(String(item.scheduledAt)).toLocaleString())}</td><td>${escape(doctorName(item))}</td><td>${escape((item.department as CrmRecord)?.name)}</td><td>${escape(item.reason)}</td><td>${escape(item.status)}</td></tr>`).join(""))}</section><section class="section"><h2>Surgery history</h2>${table(["Date", "Procedure", "Doctor", "Room", "Status"], surgeries.map((item) => `<tr><td>${escape(new Date(String(item.scheduledAt)).toLocaleString())}</td><td>${escape((item.surgery as CrmRecord)?.name)}</td><td>${escape(doctorName(item))}</td><td>${escape(item.operatingRoom)}</td><td>${escape(item.status)}</td></tr>`).join(""))}</section><section class="section"><h2>Referral history</h2>${table(["Date", "Referrer", "Phone", "Type", "Status", "Notes"], referrals.map((item) => `<tr><td>${escape(new Date(String(item.referredAt)).toLocaleDateString())}</td><td>${escape(item.referrerName)}</td><td>${escape(item.referrerPhone)}</td><td>${escape(item.referralType)}</td><td>${escape(item.status)}</td><td>${escape(item.notes)}</td></tr>`).join(""))}</section><section class="section"><h2>Payment history</h2>${table(["Date", "Amount", "Method", "Reference", "Status"], payments.map((item) => `<tr><td>${escape(new Date(String(item.paidAt)).toLocaleString())}</td><td>${escape(Number(item.amount ?? 0).toLocaleString())}</td><td>${escape(item.paymentMethod)}</td><td>${escape(item.reference)}</td><td>${escape(item.status)}</td></tr>`).join(""))}</section><section class="section page-break"><h2>Clinical forms and examinations</h2>${
        clinicalForms
          .map((submission) => {
            const template = submission.formTemplate as FormTemplate;
            const values = submission.data as Record<string, unknown>;
            return `<div class="panel" style="margin-bottom:12px"><h2>${escape(template.name)} · ${escape(new Date(String(submission.createdAt)).toLocaleString())}</h2><div class="details">${template.fields.map((field) => row(field.label, field.type === "checkbox" ? (values[field.id] ? "Yes" : "No") : values[field.id])).join("")}</div></div>`;
          })
          .join("") || "No clinical forms recorded."
      }</section></main><script>window.onload=()=>setTimeout(()=>window.print(),250)</script></body></html>`,
    );
    reportWindow.document.close();
  };

  return (
    <div className="mx-auto max-w-350 space-y-5">
      <section className="overflow-hidden rounded-3xl bg-linear-to-br from-slate-950 via-teal-950 to-teal-800 text-white shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-6 p-6 md:p-8">
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/10 hover:text-white"
              onClick={() => (onBack ? onBack() : navigate(backPath))}
            >
              <ArrowLeft className="rtl:rotate-180" />
            </Button>
            <div className="grid size-16 place-items-center rounded-2xl border border-white/20 bg-white/10 text-xl font-bold backdrop-blur">
              {text(patient.firstName, "P").charAt(0)}
              {text(patient.lastName, "").charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">{fullName(patient)}</h1>
                <Badge className="border-emerald-300/30 bg-emerald-400/20 text-emerald-100">
                  {String(patient.status).startsWith("post_discharge_follow_up")
                    ? t(
                        patient.status === "post_discharge_follow_up"
                          ? "postDischargeFollowUp.active"
                          : "postDischargeFollowUp.completed",
                      )
                    : text(patient.status, "active")}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-teal-100">
                {text(patient.patientCode)}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-white/10 px-3 py-1.5">
                  Age: {text(age)}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1.5 capitalize">
                  Gender: {text(patient.gender)}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1.5">
                  Blood: {text(patient.bloodType)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              permission="laboratory.orders.view"
              variant="secondary"
              onClick={() => navigate(`/laboratory/reception?patientId=${id}`)}
            >
              <FlaskConical />
              {t("laboratory.title")}
            </Button>

            {canManage && patient.status !== "post_discharge_follow_up" && (
              <Button
                permission="crm.patients.update"
                variant="secondary"
                disabled={sendingFollowUp}
                onClick={() => {
                  setFollowUpDate(
                    patient.followUpDate
                      ? String(patient.followUpDate).slice(0, 10)
                      : "",
                  );
                  setFollowUpDialogOpen(true);
                }}
              >
                {t("postDischargeFollowUp.send")}
              </Button>
            )}
            {canManage &&
              hasPermission(storedUser(), "inventory.icu.create") &&
              patient.status !== "icu" && (
                <Button
                  permission="crm.patients.update"
                  variant="secondary"
                  disabled={sendingToIcu}
                  onClick={async () => {
                    if (sendingToIcu) return;
                    setSendingToIcu(true);
                    try {
                      await apiClient.post("/inventory/icu-cases", {
                        patientId: id,
                        entry: new Date().toISOString(),
                        exit: null,
                        items: [],
                      });
                      await crmApi.patients.update(id, { status: "icu" });
                      await profile.refresh();
                      toast.success(t("icu.ui.patientSentToUnit"));
                    } catch (error) {
                      toast.error(apiErrorMessage(error));
                    } finally {
                      setSendingToIcu(false);
                    }
                  }}
                >
                  <HeartPulse /> {t("icu.ui.sendToUnit")}
                </Button>
              )}
            {patient.status === "post_discharge_follow_up" && (
              <Button
                variant="secondary"
                permission="crm.patients.view"
                onClick={() => navigate("/crm/follow-up")}
              >
                {t("postDischargeFollowUp.title")}
              </Button>
            )}
            <Button
              permission="crm.forms.view"
              variant="secondary"
              onClick={() => setFormOpen(true)}
            >
              <ClipboardPlus /> Forms
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate("/crm/surgery-appointments")}
            >
              <Stethoscope /> Surgical examination
            </Button>
            <Button
              permission="export"
              variant="secondary"
              onClick={exportPatientReport}
            >
              <Download /> PDF report with charts
            </Button>
            {canManage && (
              <Button
                data-action="edit"
                variant="secondary"
                onClick={() => {
                  setIsMarried(Boolean(patient.isMarried));
                  setHasDiabetes(Boolean(patient.hasDiabetes));
                  setHasHypertension(Boolean(patient.hasHypertension));
                  setEditing(true);
                }}
              >
                <Pencil /> {t("patientActions.editProfile")}
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          {
            label: "Comorbidities",
            value:
              [
                patient.hasDiabetes && "Diabetes",
                patient.hasHypertension && "Hypertension",
              ]
                .filter(Boolean)
                .join(", ") || "None recorded",
            icon: HeartPulse,
            color: "text-rose-600 bg-rose-100 dark:bg-rose-950",
          },
          {
            label: "Location",
            value: text(patient.address),
            icon: MapPin,
            color: "text-teal-600 bg-teal-100 dark:bg-teal-950",
          },
          {
            label: "Surgery type",
            value: text(
              (latestSurgery?.surgery as CrmRecord | undefined)?.name,
            ),
            icon: HeartPulse,
            color: "text-violet-600 bg-violet-100 dark:bg-violet-950",
          },
          {
            label: "Admission",
            value: latestSurgery
              ? new Date(String(latestSurgery.scheduledAt)).toLocaleDateString()
              : "Not recorded",
            icon: CalendarDays,
            color: "text-orange-600 bg-orange-100 dark:bg-orange-950",
          },
          {
            label: "Status",
            value: medicalStatus,
            icon: Activity,
            color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950",
          },
          {
            label: "Consultant",
            value: latestVisit ? doctorName(latestVisit) : "Not assigned",
            icon: Stethoscope,
            color: "text-teal-600 bg-teal-100 dark:bg-teal-950",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-5">
              <span
                className={`grid size-11 place-items-center rounded-xl ${color}`}
              >
                <Icon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="truncate font-semibold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Button
        permission="crm.prescriptions.view"
        onClick={() => navigate(`/crm/patients/${id}/medications`)}
      >
        <Pill className="size-4" />
        {t("prescription.viewMedications")}
      </Button>
      {compact && (
        <Button
          variant="outline"
          onClick={() => setShowDetails((value) => !value)}
        >
          {t(
            showDetails
              ? "todayPatients.hideDetails"
              : "todayPatients.showDetails",
          )}
        </Button>
      )}
      {(!compact || showDetails) && (
        <>
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {[
              [Activity, "Current vital signs", "No vital signs recorded."],
              [
                Bell,
                "Alerts",
                patient.allergies
                  ? `Allergies: ${patient.allergies}`
                  : "No active alerts.",
              ],
              [
                History,
                "Updates",
                latestVisit
                  ? `Latest visit: ${new Date(String(latestVisit.scheduledAt)).toLocaleDateString()}`
                  : "No updates recorded.",
              ],
              [
                FlaskConical,
                t("laboratory.results"),
                laboratoryResults.error ??
                  (laboratoryResults.isLoading && canViewLaboratory
                    ? t("common.loading")
                    : laboratoryResults.data
                      ? laboratoryResults.data.items
                          .map(
                            (item) =>
                              `${item.testName}: ${item.result ?? ""} ${item.unit ?? ""}`,
                          )
                          .join("; ")
                      : "—"),
              ],
              [
                FileText,
                "Recent documents",
                submissions.data?.length
                  ? `${submissions.data.length} clinical form(s) submitted.`
                  : "No recent documents.",
              ],
            ].map(([Icon, title, description]) => (
              <Card key={String(title)} className="min-h-40">
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 border-b p-4">
                    <Icon className="size-4 text-primary" />
                    <h2 className="text-sm font-bold">{String(title)}</h2>
                  </div>
                  <p className="p-4 text-xs leading-5 text-muted-foreground">
                    {String(description)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Card className="min-h-52">
              <CardContent className="p-0">
                <div className="flex items-center gap-2 border-b p-4">
                  <History className="size-4 text-primary" />
                  <h2 className="text-sm font-bold">Patient timeline</h2>
                </div>
                <div className="grid gap-2 p-4">
                  {visits.slice(0, 3).map((visit) => (
                    <div
                      key={String(visit.id)}
                      className="rounded-lg border p-2 text-xs"
                    >
                      <strong>
                        {text(
                          (visit.surgery as CrmRecord | undefined)?.name ??
                            visit.reason,
                          visit.kind,
                        )}
                      </strong>
                      <p className="mt-1 text-muted-foreground">
                        {new Date(String(visit.scheduledAt)).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  {!visits.length && (
                    <p className="text-xs text-muted-foreground">
                      No timeline records yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="min-h-52">
              <CardContent className="p-0">
                <div className="flex items-center gap-2 border-b p-4">
                  <CalendarClock className="size-4 text-primary" />
                  <h2 className="text-sm font-bold">Upcoming / pending</h2>
                </div>
                <div className="grid gap-2 p-4">
                  {upcomingAppointments.slice(0, 3).map((appointment) => (
                    <div
                      key={String(appointment.id)}
                      className="rounded-lg border bg-orange-50 p-2 text-xs dark:bg-orange-950/20"
                    >
                      <strong>{text(appointment.reason, "Appointment")}</strong>
                      <p className="mt-1 text-muted-foreground">
                        {new Date(
                          String(appointment.scheduledAt),
                        ).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  {!upcomingAppointments.length && (
                    <p className="text-xs text-muted-foreground">
                      No upcoming appointments.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="min-h-52">
              <CardContent className="p-0">
                <div className="flex items-center gap-2 border-b p-4">
                  <Pill className="size-4 text-emerald-600" />
                  <h2 className="text-sm font-bold">
                    {t("prescription.medications")}
                  </h2>
                </div>
                <div className="p-4">
                  <Button
                    permission="crm.prescriptions.view"
                    variant="outline"
                    onClick={() => navigate(`/crm/patients/${id}/medications`)}
                  >
                    {t("prescription.viewMedications")}
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="min-h-52">
              <CardContent className="p-0">
                <div className="flex items-center gap-2 border-b p-4">
                  <Activity className="size-4 text-teal-600" />
                  <h2 className="text-sm font-bold">Outputs</h2>
                </div>
                <p className="p-4 text-xs text-muted-foreground">
                  No output records for this patient.
                </p>
              </CardContent>
            </Card>
          </section>

          <Card>
            <CardContent className="p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <FileText />
                  </span>
                  <div>
                    <h2 className="font-bold">Clinical forms & examinations</h2>
                    <p className="text-xs text-muted-foreground">
                      Submitted assessments remain part of this patient profile.
                    </p>
                  </div>
                </div>
                {canManage && (
                  <Button
                    permission="crm.forms.create"
                    onClick={() => setFormOpen(true)}
                    disabled={!templates.data?.length}
                  >
                    <ClipboardPlus />
                    Submit form
                  </Button>
                )}
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {submissions.data?.length ? (
                  submissions.data.map((submission) => {
                    const template = submission.formTemplate as FormTemplate;
                    const values = submission.data as Record<string, unknown>;
                    return (
                      <details
                        key={submission.id}
                        className="group rounded-xl border bg-muted/15 p-4"
                      >
                        <summary className="cursor-pointer list-none">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold">{template.name}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {new Date(
                                  String(submission.createdAt),
                                ).toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {template.category}
                            </Badge>
                          </div>
                        </summary>
                        <dl className="mt-4 grid gap-2 border-t pt-3 text-sm">
                          {template.fields.map((field) => (
                            <div
                              key={field.id}
                              className="grid grid-cols-[1fr_1.2fr] gap-3"
                            >
                              <dt className="text-muted-foreground">
                                {field.label}
                              </dt>
                              <dd className="font-medium">
                                {field.type === "checkbox"
                                  ? values[field.id]
                                    ? "Yes"
                                    : "No"
                                  : text(values[field.id], "—")}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </details>
                    );
                  })
                ) : (
                  <p className="col-span-full rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No clinical forms submitted for this patient.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardContent className="p-6">
                <div className="mb-5 flex items-center gap-2">
                  <Stethoscope className="size-5 text-primary" />
                  <h2 className="font-bold">Recent visits</h2>
                </div>
                <div className="space-y-3">
                  {visits.length ? (
                    visits.map((visit) => (
                      <div
                        key={String(visit.id)}
                        className="flex items-center justify-between gap-4 rounded-xl border p-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                            {visit.kind === "Surgery" ? (
                              <HeartPulse />
                            ) : (
                              <UserRound />
                            )}
                          </span>
                          <div>
                            <p className="font-semibold">
                              {text(
                                (visit.surgery as CrmRecord | undefined)
                                  ?.name ?? visit.reason,
                                String(visit.kind),
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {doctorName(visit)}
                            </p>
                          </div>
                        </div>
                        <div className="text-end">
                          <Badge variant="outline" className="capitalize">
                            {text(visit.status)}
                          </Badge>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(
                              String(visit.scheduledAt),
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                      No visits recorded yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            <div className="space-y-5">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Droplets className="size-5 text-red-500" />
                    <h2 className="font-bold">Medical information</h2>
                  </div>
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Blood type</dt>
                      <dd className="font-semibold">
                        {text(patient.bloodType)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Weight / height</dt>
                      <dd className="font-semibold">
                        {patient.weightKg ? `${patient.weightKg} kg` : "—"} /{" "}
                        {patient.heightCm ? `${patient.heightCm} cm` : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Diabetes</dt>
                      <dd className="font-semibold">
                        {patient.hasDiabetes ? "Yes" : "No"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">
                        High blood pressure
                      </dt>
                      <dd className="font-semibold">
                        {patient.hasHypertension ? "Yes" : "No"}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-muted-foreground">Family</dt>
                      <dd className="font-semibold">
                        {patient.isMarried
                          ? `Married · ${text(patient.childrenCount, "0")} children`
                          : "Not married"}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-muted-foreground">Allergies</dt>
                      <dd className="whitespace-pre-wrap font-medium">
                        {text(patient.allergies, "No known allergies")}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-muted-foreground">Medical notes</dt>
                      <dd className="whitespace-pre-wrap font-medium">
                        {text(patient.medicalNotes, "No medical notes")}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-4 font-bold">Original lead information</h2>
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Lead code</dt>
                      <dd className="font-semibold">{text(lead?.code)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Source</dt>
                      <dd className="font-semibold">{text(lead?.source)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Interest</dt>
                      <dd className="font-semibold">{text(lead?.interest)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Lead age</dt>
                      <dd className="font-semibold">{text(lead?.age)}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </section>
        </>
      )}
      <Dialog open={followUpDialogOpen} onOpenChange={setFollowUpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("postDischargeFollowUp.send")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="profile-follow-up-date">
              {t("postDischargeFollowUp.followUpDate")}
            </Label>
            <Input
              id="profile-follow-up-date"
              type="date"
              required
              value={followUpDate}
              onChange={(event) => setFollowUpDate(event.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setFollowUpDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              permission="crm.patients.update"
              disabled={!followUpDate || sendingFollowUp}
              onClick={async () => {
                if (followUpLock.current) return;
                followUpLock.current = true;
                setSendingFollowUp(true);
                try {
                  await crmApi.patients.update(id, {
                    status: "post_discharge_follow_up",
                    followUpDate,
                  });
                  await profile.refresh();
                  setFollowUpDialogOpen(false);
                  toast.success(t("postDischargeFollowUp.sent"));
                } catch (cause) {
                  toast.error(apiErrorMessage(cause));
                } finally {
                  followUpLock.current = false;
                  setSendingFollowUp(false);
                }
              }}
            >
              {t("postDischargeFollowUp.confirm")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editing && canManage}
        onOpenChange={(value) => {
          if (!profileSaveLock.current) setEditing(value);
        }}
      >
        <DialogContent className="flex max-h-[min(90vh,760px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="shrink-0 border-b px-6 py-5">
            <DialogTitle>{t("patientActions.editProfile")}</DialogTitle>
          </DialogHeader>
          <form
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            onSubmit={save}
          >
            <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar]:w-1.5">
              {[
                ["firstName", "First name"],
                ["lastName", "Last name"],
                ["phone", "Phone"],
                ["email", "Email"],
                ["address", "Address"],
              ].map(([name, label]) => (
                <label key={name} className="grid gap-1.5 text-sm font-medium">
                  {label}
                  <Input
                    name={name}
                    defaultValue={text(patient[name], "")}
                    required={["firstName", "lastName", "phone"].includes(name)}
                  />
                </label>
              ))}
              <Label className="grid gap-1.5 text-sm font-medium">
                {t("crm.fields.dateOfBirth")}
                <FormDatePicker
                  name="dateOfBirth"
                  initialValue={
                    patient.dateOfBirth
                      ? String(patient.dateOfBirth).slice(0, 10)
                      : ""
                  }
                />
              </Label>
              <label className="grid gap-1.5 text-sm font-medium">
                Gender
                <Select name="gender" defaultValue={text(patient.gender, "")}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("crm.placeholders.selectGender")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Blood type
                <Select
                  name="bloodType"
                  defaultValue={text(patient.bloodType, "")}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("crm.placeholders.selectBloodType")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                      (value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Weight (kg)
                <Input
                  name="weightKg"
                  type="number"
                  min="1"
                  max="500"
                  step="0.1"
                  defaultValue={text(patient.weightKg, "")}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Height (cm)
                <Input
                  name="heightCm"
                  type="number"
                  min="1"
                  max="300"
                  step="0.1"
                  defaultValue={text(patient.heightCm, "")}
                />
              </label>
              <Label
                htmlFor="isMarried"
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-3"
              >
                <Checkbox
                  id="isMarried"
                  checked={isMarried}
                  onCheckedChange={(checked) => setIsMarried(checked === true)}
                />
                Married
              </Label>
              <label className="grid gap-1.5 text-sm font-medium">
                Number of children
                <Input
                  name="childrenCount"
                  type="number"
                  min="0"
                  step="1"
                  disabled={!isMarried}
                  defaultValue={text(patient.childrenCount, "0")}
                />
              </label>
              <Label
                htmlFor="hasDiabetes"
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-3"
              >
                <Checkbox
                  id="hasDiabetes"
                  checked={hasDiabetes}
                  onCheckedChange={(checked) =>
                    setHasDiabetes(checked === true)
                  }
                />
                Has diabetes
              </Label>
              <Label
                htmlFor="hasHypertension"
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-3"
              >
                <Checkbox
                  id="hasHypertension"
                  checked={hasHypertension}
                  onCheckedChange={(checked) =>
                    setHasHypertension(checked === true)
                  }
                />
                Has high blood pressure
              </Label>
              {["allergies", "medicalNotes"].map((name) => (
                <label
                  key={name}
                  className="grid gap-1.5 text-sm font-medium sm:col-span-2"
                >
                  {name === "allergies" ? "Allergies" : "Medical notes"}
                  <Textarea
                    name={name}
                    defaultValue={text(patient[name], "")}
                    className="min-h-24 resize-y"
                  />
                </label>
              ))}
            </div>
            <div className="flex shrink-0 justify-end border-t bg-background px-6 py-4">
              <Button
                type="button"
                variant="outline"
                className="me-2"
                disabled={savingProfile}
                onClick={() => setEditing(false)}
              >
                {t("patientBooking.cancel")}
              </Button>
              <Button
                permission="crm.patients.update"
                type="submit"
                disabled={savingProfile}
              >
                {savingProfile
                  ? t("patientBooking.saving")
                  : t("patientActions.saveProfile")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="flex h-[min(90vh,800px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="border-b px-6 py-5">
            <DialogTitle>Submit patient form</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={submitClinicalForm}
            className="flex min-h-0 flex-1 flex-col"
          >
            <ScrollArea className="h-0 min-h-0 flex-1">
              <div className="grid gap-4 p-6 sm:grid-cols-2">
                <Label className="grid gap-2 sm:col-span-2">
                  Form or examination
                  <Select
                    value={selectedTemplate?.id ?? ""}
                    onValueChange={(templateId) => {
                      setSelectedTemplate(
                        templates.data?.find(
                          (template) => template.id === templateId,
                        ) ?? null,
                      );
                      setFormValues({});
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("crm.placeholders.chooseForm")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.data?.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} · {template.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Label>
                {selectedTemplate?.fields.map((field) => {
                  const setValue = (value: unknown) =>
                    setFormValues((current) => ({
                      ...current,
                      [field.id]: value,
                    }));
                  return field.type === "checkbox" ? (
                    <Label
                      key={field.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border p-3"
                    >
                      <Checkbox
                        checked={Boolean(formValues[field.id])}
                        onCheckedChange={(checked) =>
                          setValue(checked === true)
                        }
                      />
                      {field.label}
                    </Label>
                  ) : (
                    <Label
                      key={field.id}
                      className={`grid gap-2 ${field.type === "textarea" ? "sm:col-span-2" : ""}`}
                    >
                      {field.label}
                      {field.type === "select" ? (
                        <Select
                          value={String(formValues[field.id] ?? "")}
                          onValueChange={setValue}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("crm.placeholders.selectField", {
                                field: field.label,
                              })}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : field.type === "date" ? (
                        <FormDatePicker
                          value={String(formValues[field.id] ?? "")}
                          onValueChange={setValue}
                          required={field.required}
                        />
                      ) : field.type === "textarea" ? (
                        <Textarea
                          required={field.required}
                          value={String(formValues[field.id] ?? "")}
                          onChange={(event) => setValue(event.target.value)}
                        />
                      ) : (
                        <Input
                          type={field.type}
                          required={field.required}
                          value={String(formValues[field.id] ?? "")}
                          onChange={(event) =>
                            setValue(
                              field.type === "number" && event.target.value
                                ? Number(event.target.value)
                                : event.target.value,
                            )
                          }
                        />
                      )}
                    </Label>
                  );
                })}
              </div>
            </ScrollArea>
            <div className="flex justify-end border-t p-4">
              <Button
                permission="crm.forms.create"
                type="submit"
                disabled={!selectedTemplate}
              >
                Submit form
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
