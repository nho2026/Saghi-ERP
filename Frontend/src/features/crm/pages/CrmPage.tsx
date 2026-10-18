import { apiErrorMessage } from "@/shared/api/client";
import { hasPagePermission } from "@/features/auth/access";
import PatientAppointmentDialog from "../components/PatientAppointmentDialog";
const patientStages = [
  "new",
  "contacted",
  "qualified",
  "appointment_requested",
  "surgery_appointment",
  "converted",
  "direct_surgery_converted",
  "post_discharge_follow_up",
  "post_discharge_follow_up_completed",
];
import { useSettings } from "@/features/settings/settings";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  LayoutGrid,
  List,
  ListFilter,
  MapPin,
  Pencil,
  Plus,
  Phone,
  Search,
  Trash2,
  Download,
  FileSpreadsheet,
  FileUp,
  Eye,
  Mars,
  Venus,
  VenusAndMars,
  CalendarPlus,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  crmApi,
  leadAttachmentApi,
  type CrmRecord,
  type CrmResource,
} from "../api/crm.api";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { storedUser } from "@/features/auth/access";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { PaginationControls } from "@/shared/components/ui/pagination-controls";
import { SurgeryAppointmentCalendar } from "../components/SurgeryAppointmentCalendar";
import { SearchableSelect } from "@/shared/components/ui/searchable-select";
import { DeleteConfirmationDialog } from "@/shared/components/ui/confirmation-dialog";
import { FormDatePicker } from "@/shared/components/ui/form-date-picker";
import nhoLogo from "@/assets/icons/nho-logo-rounded.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

type Field = {
  name: string;
  label: string;
  type?:
    | "select"
    | "date"
    | "datetime"
    | "number"
    | "textarea"
    | "patient"
    | "doctor"
    | "surgery"
    | "surgeryAppointment";
  options?: string[];
  required?: boolean;
};
type LeadFilters = {
  source: string;
  gender: string;
  status: string;
  minAge: string;
  maxAge: string;
};
const emptyLeadFilters: LeadFilters = {
  source: "",
  gender: "",
  status: "",
  minAge: "",
  maxAge: "",
};
type PatientFilters = {
  gender: string;
  bloodType: string;
  status: string;
  isMarried: string;
  hasDiabetes: string;
  hasHypertension: string;
};
const emptyPatientFilters: PatientFilters = {
  gender: "",
  bloodType: "",
  status: "",
  isMarried: "",
  hasDiabetes: "",
  hasHypertension: "",
};
type ReferralFilters = {
  referralType: string;
  status: string;
  from: string;
  to: string;
};
const emptyReferralFilters: ReferralFilters = {
  referralType: "",
  status: "",
  from: "",
  to: "",
};
function PatientFilterSelect({
  label,
  value,
  options,
  onChange,
  allLabel,
}: {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
  allLabel: string;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-medium">
      {label}
      <Select
        value={value || "all"}
        onValueChange={(next) => onChange(next === "all" ? "" : next)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{allLabel}</SelectItem>
          {options.map(([optionValue, optionLabel]) => (
            <SelectItem key={optionValue} value={optionValue}>
              {optionLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
const configs: Record<
  CrmResource,
  { title: string; description: string; fields: Field[]; columns: string[] }
> = {
  leads: {
    title: "Leads",
    description: "Track prospective patients from first contact to conversion.",
    fields: [
      { name: "name", label: "Full name", required: true },
      { name: "phone", label: "Phone", required: true },
      { name: "secondaryPhone", label: "Secondary phone" },
      { name: "age", label: "Age", type: "number" },
      { name: "dateOfBirth", label: "Date of birth", type: "date" },
      {
        name: "gender",
        label: "Gender",
        type: "select",
        options: ["male", "female", "other"],
      },
      {
        name: "maritalStatus",
        label: "Marital status",
        type: "select",
        options: ["single", "married", "divorced", "widowed"],
      },
      { name: "preferredLanguage", label: "Preferred language" },
      { name: "country", label: "Country" },
      { name: "city", label: "City" },
      { name: "address", label: "Location" },
      { name: "email", label: "Email" },
      { name: "interest", label: "Occupation" },
      {
        name: "leadSourceChannel",
        label: "Lead source channel",
        type: "select",
        options: ["digital", "traditional"],
      },
      {
        name: "source",
        label: "Lead source",
        type: "select",
        options: [
          "whatsapp_message",
          "facebook",
          "tiktok",
          "tv",
          "youtube",
          "instagram",
          "doctor_referral",
          "patient_referral",
          "people_referral",
        ],
        required: true,
      },
      {
        name: "contactMethod",
        label: "First contact method",
        type: "select",
        options: ["phone", "whatsapp", "social_media", "walk_in", "email"],
      },
      {
        name: "patientType",
        label: "Patient type",
        type: "select",
        options: ["medical", "non_cardiac", "surgical"],
      },
      {
        name: "referralPersona",
        label: "Referral persona",
        type: "select",
        options: ["doctor", "our_patient", "people"],
      },
      { name: "referralName", label: "Referral name" },
      { name: "referralPhone", label: "Referral phone" },
      { name: "referralAddress", label: "Referral address" },
      { name: "referralNote", label: "Referral note", type: "textarea" },
      { name: "competitorsNote", label: "Competitors note", type: "textarea" },
      { name: "notes", label: "Additional note", type: "textarea" },
      {
        name: "satisfactionScore",
        label: "Satisfaction score",
        type: "number",
      },
      {
        name: "knowledgeRating",
        label: "Knowledge rating (1-5)",
        type: "number",
      },
      { name: "budgetRange", label: "Budget range" },
      {
        name: "decisionInfluencers",
        label: "Decision influencers",
        type: "textarea",
      },
      { name: "painPoints", label: "Pain points", type: "textarea" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          "new",
          "contacted",
          "qualified",
          "appointment_requested",
          "surgery_appointment",
          "converted",
          "direct_surgery_converted",
          "lost",
        ],
        required: true,
      },
    ],
    columns: [
      "code",
      "name",
      "phone",
      "address",
      "interest",
      "age",
      "gender",
      "notes",
      "status",
    ],
  },
  patients: {
    title: "Patients",
    description: "Central patient records and medical contact information.",
    fields: [
      { name: "firstName", label: "First name", required: true },
      { name: "lastName", label: "Last name", required: true },
      { name: "phone", label: "Phone", required: true },
      { name: "email", label: "Email" },
      { name: "dateOfBirth", label: "Date of birth", type: "date" },
      {
        name: "gender",
        label: "Gender",
        type: "select",
        options: ["male", "female", "other"],
      },
      {
        name: "bloodType",
        label: "Blood type",
        type: "select",
        options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      },
      { name: "address", label: "Address" },
      { name: "allergies", label: "Allergies", type: "textarea" },
      { name: "medicalNotes", label: "Medical notes", type: "textarea" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: patientStages,
        required: true,
      },
    ],
    columns: ["patientCode", "name", "phone", "bloodType", "status"],
  },
  referrals: {
    title: "Referrals",
    description: "Track who referred each patient to the organization.",
    fields: [
      { name: "patientId", label: "Patient", type: "patient", required: true },
      { name: "referrerName", label: "Referrer name", required: true },
      { name: "referrerPhone", label: "Referrer phone" },
      { name: "referrerProfession", label: "Profession" },
      { name: "referrerAddress", label: "Address" },
      {
        name: "direction",
        label: "Type",
        type: "select",
        options: ["inbound", "outbound"],
        required: true,
      },
      {
        name: "referralPersona",
        label: "Referral persona",
        type: "select",
        options: ["doctor", "our_patient", "people"],
      },
      { name: "referringPatientName", label: "Referring patient" },
      {
        name: "referralType",
        label: "Referral type",
        type: "select",
        options: ["patient", "doctor", "employee", "organization", "other"],
        required: true,
      },
      {
        name: "referredAt",
        label: "Referral date",
        type: "date",
        required: true,
      },
      { name: "notes", label: "Notes", type: "textarea" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["active", "completed", "cancelled"],
        required: true,
      },
    ],
    columns: [
      "referrerName",
      "referrerPhone",
      "direction",
      "referralPersona",
      "broughtPatients",
      "refereeName",
      "leadCode",
      "status",
      "createdAt",
    ],
  },
  surgeries: {
    title: "Surgeries",
    description: "Maintain the surgery and procedure catalog.",
    fields: [
      { name: "name", label: "Surgery name", required: true },
      { name: "description", label: "Description", type: "textarea" },
      {
        name: "durationMinutes",
        label: "Duration (minutes)",
        type: "number",
        required: true,
      },
      {
        name: "basePrice",
        label: "Base price",
        type: "number",
        required: true,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["active", "inactive"],
        required: true,
      },
    ],
    columns: ["code", "name", "durationMinutes", "basePrice", "status"],
  },
  "surgery-appointments": {
    title: "Surgery appointments",
    description:
      "Schedule procedures with patients, surgeons, and operating rooms.",
    fields: [
      { name: "patientId", label: "Patient", type: "patient", required: true },
      { name: "doctorId", label: "Doctor", type: "doctor", required: true },
      { name: "surgeryId", label: "Surgery", type: "surgery", required: true },
      {
        name: "scheduledAt",
        label: "Date and time",
        type: "datetime",
        required: true,
      },
      { name: "operatingRoom", label: "Operating room" },
      { name: "preOpNotes", label: "Pre-operation notes", type: "textarea" },
      { name: "postOpNotes", label: "Post-operation notes", type: "textarea" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          "scheduled",
          "confirmed",
          "in_progress",
          "completed",
          "cancelled",
        ],
        required: true,
      },
    ],
    columns: [
      "patient",
      "surgery",
      "doctor",
      "scheduledAt",
      "operatingRoom",
      "status",
    ],
  },
  payments: {
    title: "Payments",
    description: "Record patient payments for appointments and surgeries.",
    fields: [
      { name: "patientId", label: "Patient", type: "patient", required: true },
      {
        name: "surgeryAppointmentId",
        label: "Surgery appointment",
        type: "surgeryAppointment",
      },
      { name: "amount", label: "Amount", type: "number", required: true },
      {
        name: "paymentMethod",
        label: "Payment method",
        type: "select",
        options: ["cash", "card", "bank_transfer", "insurance"],
        required: true,
      },
      { name: "reference", label: "Reference" },
      {
        name: "paidAt",
        label: "Payment date and time",
        type: "datetime",
        required: true,
      },
      { name: "notes", label: "Notes", type: "textarea" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["paid", "pending", "refunded", "cancelled"],
        required: true,
      },
    ],
    columns: ["patient", "amount", "paymentMethod", "paidAt", "status"],
  },
};
const labelOf = (
  x: CrmRecord | null | undefined,
  type?: Field["type"],
): string => {
  if (!x) return "—";
  if (type === "doctor")
    return (
      `${(x.employee as CrmRecord)?.firstName ?? ""} ${(x.employee as CrmRecord)?.lastName ?? ""}`.trim() ||
      "—"
    );
  if (type === "surgeryAppointment")
    return `${labelOf(x.patient as CrmRecord)} — ${String((x.surgery as CrmRecord)?.name ?? "")}`;
  return String(
    x.name ??
      (`${x.firstName ?? ""} ${x.lastName ?? ""}`.trim() || x.code || "—"),
  );
};
const statusStyles: Record<string, string> = {
  new: "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300",
  contacted:
    "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300",
  qualified:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-300",
  converted:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  direct_surgery_converted:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  surgery_appointment:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/60 dark:text-orange-300",
  active:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  completed:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  scheduled:
    "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300",
  confirmed:
    "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300",
  pending:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  in_progress:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  refunded:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-300",
  inactive:
    "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300",
  lost: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300",
  cancelled:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300",
};
const statusClass = (status: unknown) =>
  statusStyles[String(status)] ??
  "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300";
const patientAge = (dateOfBirth: unknown) => {
  if (!dateOfBirth) return "—";
  const birth = new Date(String(dateOfBirth));
  if (Number.isNaN(birth.getTime())) return "—";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  )
    age -= 1;
  return String(age);
};
export default function CrmPage({ resource }: { resource: CrmResource }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [patientBooking, setPatientBooking] = useState<{
    patient: CrmRecord;
    surgery: boolean;
  } | null>(null);
  const [appointmentPatientId, setAppointmentPatientId] = useState("");
  const [selectedSurgery, setSelectedSurgery] = useState<CrmRecord | null>(
    null,
  );
  const { t } = useTranslation();
  const systemSettings = useSettings();
  const config = {
      ...configs[resource],
      fields: configs[resource].fields.map((field) =>
        field.name === "operatingRoom"
          ? {
              ...field,
              type: "select" as const,
              options: systemSettings?.healthcare.operatingRooms ?? [],
            }
          : field,
      ),
    },
    user = storedUser(),
    canManage = hasPagePermission(user, "create", "update", "delete");
  const [page, setPage] = useState(1);
  const [leadFilters, setLeadFilters] = useState<LeadFilters>(emptyLeadFilters);
  const [draftFilters, setDraftFilters] =
    useState<LeadFilters>(emptyLeadFilters);
  const [patientFilters, setPatientFilters] =
    useState<PatientFilters>(emptyPatientFilters);
  const [draftPatientFilters, setDraftPatientFilters] =
    useState<PatientFilters>(emptyPatientFilters);
  const [referralFilters, setReferralFilters] =
    useState<ReferralFilters>(emptyReferralFilters);
  const [draftReferralFilters, setDraftReferralFilters] =
    useState<ReferralFilters>(emptyReferralFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [patientView, setPatientView] = useState<"grid" | "table">("grid");
  const [surgeryView, setSurgeryView] = useState<"calendar" | "table">(
    "calendar",
  );
  const [surgeryDraftAt, setSurgeryDraftAt] = useState("");
  const [leadChannel, setLeadChannel] = useState("");
  const [leadFiles, setLeadFiles] = useState<File[]>([]);
  const addLeadFiles = (incoming: File[]) => {
    const valid = incoming.filter((file) => file.size <= 10 * 1024 * 1024);
    if (valid.length !== incoming.length)
      toast.error(t("crm.errors.attachmentSize"));
    setLeadFiles((current) => {
      const combined = [...current, ...valid].filter(
        (file, index, files) =>
          files.findIndex(
            (candidate) =>
              candidate.name === file.name &&
              candidate.size === file.size &&
              candidate.lastModified === file.lastModified,
          ) === index,
      );
      if (combined.length > 10) toast.error(t("crm.errors.attachmentLimit"));
      return combined.slice(0, 10);
    });
  };
  const data = useApiResource(
    useCallback(
      () =>
        crmApi[resource].list(
          page,
          50,
          resource === "leads"
            ? Object.fromEntries(
                Object.entries(leadFilters).filter(([, value]) => value),
              )
            : resource === "patients"
              ? Object.fromEntries(
                  Object.entries(patientFilters).filter(([, value]) => value),
                )
              : resource === "referrals"
                ? Object.fromEntries(
                    Object.entries(referralFilters).filter(
                      ([, value]) => value,
                    ),
                  )
                : {},
        ),
      [resource, page, leadFilters, patientFilters, referralFilters],
    ),
  );
  const lookups = useApiResource(useCallback(() => crmApi.lookups(), []));
  const [open, setOpen] = useState(false),
    [editingRecord, setEditingRecord] = useState<CrmRecord | null>(null),
    [selectedReferral, setSelectedReferral] = useState<CrmRecord | null>(null),
    [search, setSearch] = useState("");
  useEffect(() => {
    const editId = searchParams.get("edit");
    const record = data.data?.items.find((item) => item.id === editId);
    if (resource === "leads" && record) {
      setEditingRecord(record);
      setLeadChannel(String(record.leadSourceChannel ?? ""));
      setOpen(true);
    }
  }, [data.data?.items, resource, searchParams]);
  useEffect(() => {
    const patientId = searchParams.get("patientId");
    if (resource !== "surgery-appointments" || !patientId) return;
    setAppointmentPatientId(patientId);
    setEditingRecord(null);
    setOpen(true);
    setSearchParams({}, { replace: true });
  }, [resource, searchParams, setSearchParams]);
  const patientProgressLabel = (status: unknown) =>
    t(`patientProgress.${status === "active" ? "new" : String(status)}`, {
      defaultValue: String(status),
    });
  const openPatientAppointment = (patient: CrmRecord, status: string) => {
    if (status === "appointment_requested" || status === "surgery_appointment")
      setPatientBooking({ patient, surgery: status === "surgery_appointment" });
  };
  const rows = useMemo(
    () =>
      (data.data?.items ?? []).filter((x) =>
        JSON.stringify(x).toLowerCase().includes(search.toLowerCase()),
      ),
    [data.data?.items, search],
  );
  const choices = (field: Field): CrmRecord[] =>
    field.type === "patient"
      ? (lookups.data?.patients ?? [])
      : field.type === "doctor"
        ? (lookups.data?.doctors ?? [])
        : field.type === "surgery"
          ? (lookups.data?.surgeries ?? [])
          : field.type === "surgeryAppointment"
            ? (lookups.data?.surgeryAppointments ?? [])
            : [];
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget),
      payload: Record<string, unknown> = {};
    for (const field of config.fields) {
      const raw = String(form.get(field.name) ?? "");
      payload[field.name] = raw || null;
      if (field.type === "number" && raw) payload[field.name] = Number(raw);
    }
    const requestedStatus = payload.status;
    if (
      resource === "patients" &&
      ["appointment_requested", "surgery_appointment"].includes(
        String(requestedStatus),
      )
    )
      payload.status = editingRecord?.status ?? "new";
    try {
      const saved = editingRecord
        ? await crmApi[resource].update(editingRecord.id, payload)
        : await crmApi[resource].create(payload);
      if (resource === "leads" && leadFiles.length)
        await leadAttachmentApi.upload(saved.id, leadFiles);
      if (resource === "patients")
        openPatientAppointment(saved, String(requestedStatus));
      setOpen(false);
      setAppointmentPatientId("");
      setEditingRecord(null);
      setLeadFiles([]);
      await Promise.all([data.refresh(), lookups.refresh()]);
      toast.success(
        editingRecord ? "Record updated successfully." : "Saved successfully.",
      );
    } catch (error) {
      toast.error(
        resource === "leads"
          ? t("crm.errors.leadSave")
          : resource === "referrals"
            ? editingRecord
              ? t("crm.errors.referralUpdate")
              : t("crm.errors.referralCreate")
            : error instanceof Error
              ? error.message
              : "Unable to save record.",
      );
    }
  };
  const show = (row: CrmRecord, key: string) => {
    if (key === "name" && resource === "patients")
      return `${row.firstName} ${row.lastName}`;
    if (["patient", "doctor", "surgery"].includes(key))
      return labelOf(row[key] as CrmRecord, key as Field["type"]);
    const value = row[key];
    if (key.endsWith("At") && value)
      return new Date(String(value)).toLocaleString();
    const display = String(value ?? "—").replaceAll("_", " ");
    return typeof value === "string"
      ? t(`crm.values.${value}`, { defaultValue: display })
      : display;
  };
  const leadAppointmentUrl = (lead: CrmRecord) => {
    const query = new URLSearchParams({
      patientName: String(lead.name ?? ""),
      patientPhone: String(lead.phone ?? ""),
      patientEmail: String(lead.email ?? ""),
      reason: String(lead.interest ?? ""),
    });
    return `/crm/appointments?${query.toString()}`;
  };
  const genderIcon = (value: unknown) => {
    const gender = String(value ?? "other").toLowerCase();
    const Icon =
      gender === "male" ? Mars : gender === "female" ? Venus : VenusAndMars;
    return (
      <span className="inline-flex items-center gap-1.5 capitalize">
        <Icon
          className={`size-4 ${gender === "male" ? "text-teal-600" : gender === "female" ? "text-pink-600" : "text-violet-600"}`}
        />
        {gender}
      </span>
    );
  };
  const [patientStatusBusy, setPatientStatusBusy] = useState<string | null>(
    null,
  );
  const patientStatusControl = (patient: CrmRecord) => (
    <Select
      permission="update"
      value={String(patient.status === "active" ? "new" : patient.status)}
      disabled={patientStatusBusy !== null}
      onValueChange={async (status) => {
        if (patientStatusBusy !== null || status === patient.status) return;
        if (["appointment_requested", "surgery_appointment"].includes(status)) {
          openPatientAppointment(patient, status);
          return;
        }
        setPatientStatusBusy(patient.id);
        try {
          await crmApi.patients.update(patient.id, { status });
          await Promise.all([data.refresh(), lookups.refresh()]);
        } catch {
          toast.error(t("patientActions.updateError"));
        } finally {
          setPatientStatusBusy(null);
        }
      }}
    >
      <SelectTrigger
        className="h-9 w-full min-w-0 [&>span]:truncate"
        aria-label={`${t("crm.fields.status")} ${patient.firstName} ${patient.lastName}`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {[
          ...patientStages,
          ...(patient.status === "inactive" ? ["inactive"] : []),
        ].map((status) => (
          <SelectItem key={status} value={status}>
            {patientProgressLabel(status)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
  const patientEditAction = (patient: CrmRecord) => (
    <Button
      asChild
      variant="outline"
      size="icon"
      className="size-9 shrink-0 border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
      data-action="edit"
      title={t("patientActions.editProfile")}
      aria-label={t("patientActions.editProfile")}
    >
      <Link to={`/crm/patients/${patient.id}?edit=1`}>
        <Pencil className="size-4" />
      </Link>
    </Button>
  );
  const patientAppointmentAction = (patient: CrmRecord) => (
    <Button
      permission="healthcare.appointments.create"
      type="button"
      variant="outline"
      size="icon"
      className="size-9 shrink-0 border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
      title={t("patientActions.appointment")}
      aria-label={t("patientActions.appointment")}
      onClick={() => openPatientAppointment(patient, "appointment_requested")}
    >
      <CalendarPlus className="size-4" />
    </Button>
  );
  const updateLeadStatus = async (row: CrmRecord, status: string) => {
    try {
      await crmApi.leads.update(row.id, { status });
      await Promise.all([data.refresh(), lookups.refresh()]);
      toast.success(
        status === "converted"
          ? "Lead converted and patient profile created."
          : "Lead status updated.",
      );
    } catch (error) {
      toast.error(t("crm.errors.leadUpdate"));
    }
  };
  const activeFilterCount = Object.values(leadFilters).filter(Boolean).length;
  const applyLeadFilters = () => {
    if (
      draftFilters.minAge &&
      draftFilters.maxAge &&
      Number(draftFilters.minAge) > Number(draftFilters.maxAge)
    ) {
      toast.error(t("crm.errors.ageRange"));
      return;
    }
    setPage(1);
    setLeadFilters(draftFilters);
    setFilterOpen(false);
  };
  const clearLeadFilters = () => {
    setPage(1);
    setDraftFilters(emptyLeadFilters);
    setLeadFilters(emptyLeadFilters);
    setFilterOpen(false);
  };
  const activePatientFilterCount =
    Object.values(patientFilters).filter(Boolean).length;
  const applyPatientFilters = () => {
    setPage(1);
    setPatientFilters(draftPatientFilters);
    setFilterOpen(false);
  };
  const clearPatientFilters = () => {
    setPage(1);
    setDraftPatientFilters(emptyPatientFilters);
    setPatientFilters(emptyPatientFilters);
    setFilterOpen(false);
  };
  const activeReferralFilterCount =
    Object.values(referralFilters).filter(Boolean).length;
  const applyReferralFilters = () => {
    if (
      draftReferralFilters.from &&
      draftReferralFilters.to &&
      draftReferralFilters.from > draftReferralFilters.to
    ) {
      toast.error(t("crm.errors.referralDateRange"));
      return;
    }
    setPage(1);
    setReferralFilters(draftReferralFilters);
    setFilterOpen(false);
  };
  const clearReferralFilters = () => {
    setPage(1);
    setDraftReferralFilters(emptyReferralFilters);
    setReferralFilters(emptyReferralFilters);
    setFilterOpen(false);
  };
  const referralReportRows = async () =>
    (
      await crmApi.referrals.list(
        1,
        100,
        Object.fromEntries(
          Object.entries(referralFilters).filter(([, value]) => value),
        ),
      )
    ).items;
  const escapeReportValue = (value: unknown) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  const referralReportTable = (items: CrmRecord[]) =>
    items
      .map((item) => {
        const patient = item.patient as CrmRecord;
        return `<tr><td>${escapeReportValue(labelOf(patient))}</td><td>${escapeReportValue(item.referrerName)}</td><td>${escapeReportValue(item.referrerPhone)}</td><td>${escapeReportValue(item.referralType)}</td><td>${escapeReportValue(new Date(String(item.referredAt)).toLocaleDateString())}</td><td>${escapeReportValue(item.status)}</td></tr>`;
      })
      .join("");
  const exportReferralsExcel = async () => {
    const items = await referralReportRows();
    const workbook = `<html><head><meta charset="UTF-8"></head><body><table><thead><tr><th>Patient</th><th>Referrer</th><th>Phone</th><th>Type</th><th>Date</th><th>Status</th></tr></thead><tbody>${referralReportTable(items)}</tbody></table></body></html>`;
    const url = URL.createObjectURL(
      new Blob([workbook], { type: "application/vnd.ms-excel" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `referrals-${new Date().toISOString().slice(0, 10)}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const collectionReportRows = async (kind: "leads" | "patients") => {
    const sourceFilters = kind === "leads" ? leadFilters : patientFilters;
    const filters = Object.fromEntries(
      Object.entries(sourceFilters).filter(([, value]) => value),
    );
    return (await crmApi[kind].list(1, 100, filters)).items;
  };
  const collectionColumns = (kind: "leads" | "patients") =>
    kind === "leads"
      ? ["code", "name", "phone", "source", "age", "gender", "status"]
      : [
          "patientCode",
          "name",
          "phone",
          "gender",
          "bloodType",
          "address",
          "status",
        ];
  const collectionCell = (item: CrmRecord, key: string) =>
    key === "name" && item.firstName
      ? `${item.firstName} ${item.lastName}`
      : item[key];
  const exportCollectionExcel = async (kind: "leads" | "patients") => {
    const items = await collectionReportRows(kind);
    const columns = collectionColumns(kind);
    const table = `<table><thead><tr>${columns.map((key) => `<th>${escapeReportValue(key)}</th>`).join("")}</tr></thead><tbody>${items.map((item) => `<tr>${columns.map((key) => `<td>${escapeReportValue(collectionCell(item, key))}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    const url = URL.createObjectURL(
      new Blob(
        [
          `<html><head><meta charset="UTF-8"></head><body>${table}</body></html>`,
        ],
        {
          type: "application/vnd.ms-excel",
        },
      ),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${kind}-${new Date().toISOString().slice(0, 10)}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const exportCollectionPdf = async (kind: "leads" | "patients") => {
    const reportWindow = window.open("", "_blank");
    if (!reportWindow) {
      toast.error(t("crm.errors.popupBlocked"));
      return;
    }
    const items = await collectionReportRows(kind);
    const columns = collectionColumns(kind);
    const groupField = kind === "leads" ? "source" : "gender";
    const groups = items.reduce<Record<string, number>>((result, item) => {
      const key = String(item[groupField] ?? "Unknown");
      result[key] = (result[key] ?? 0) + 1;
      return result;
    }, {});
    const statuses = items.reduce<Record<string, number>>((result, item) => {
      const key = String(item.status ?? "Unknown");
      result[key] = (result[key] ?? 0) + 1;
      return result;
    }, {});
    const colors = ["#1C9B49", "#14b8a6", "#8b5cf6", "#f59e0b", "#ef4444"];
    const bars = (values: Record<string, number>) => {
      const max = Math.max(1, ...Object.values(values));
      return Object.entries(values)
        .map(
          ([label, count], index) =>
            `<div class="bar-row"><div><span>${escapeReportValue(label)}</span><strong>${count}</strong></div><i><b style="width:${(count / max) * 100}%;background:${colors[index % colors.length]}"></b></i></div>`,
        )
        .join("");
    };
    const table = `<table><thead><tr>${columns.map((key) => `<th>${escapeReportValue(key)}</th>`).join("")}</tr></thead><tbody>${items.map((item) => `<tr>${columns.map((key) => `<td>${escapeReportValue(collectionCell(item, key))}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    const title =
      kind === "leads" ? "Lead Performance Report" : "Patient Registry Report";
    const logoUrl = new URL(nhoLogo, window.location.href).href;
    reportWindow.document.write(
      `<!doctype html><html><head><title>${title}</title><style>@page{size:A4;margin:14mm}*{box-sizing:border-box}body{margin:0;font:12px Arial;color:#172033;-webkit-print-color-adjust:exact;print-color-adjust:exact}.cover{height:267mm;display:flex;flex-direction:column;justify-content:center;padding:58px;background:linear-linear(145deg,#f8fbff,#e2edff);page-break-after:always;position:relative;overflow:hidden}.cover:after{content:"";position:absolute;width:360px;height:360px;border-radius:50%;background:#1C9B49;right:-170px;top:-130px}.logo{width:110px;margin-bottom:40px}.eyebrow{color:#1C9B49;font-weight:bold;letter-spacing:3px}.cover h1{font-size:42px;color:#102a56;margin:15px 0}.meta{font-size:16px;color:#60728a}.report-header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #1C9B49;padding-bottom:12px}.brand{display:flex;align-items:center;gap:10px}.brand img{width:42px}.kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0}.kpi,.chart{border:1px solid #dce5f0;border-radius:12px;padding:16px}.kpi strong{display:block;font-size:26px;color:#126A31;margin-top:4px}.charts{display:grid;grid-template-columns:1fr 1fr;gap:15px;break-inside:avoid}.chart h2{font-size:15px}.bar-row{margin:12px 0}.bar-row div{display:flex;justify-content:space-between;text-transform:capitalize}.bar-row i{display:block;height:10px;background:#edf1f7;border-radius:10px;margin-top:5px;overflow:hidden}.bar-row b{display:block;height:100%;border-radius:10px}table{width:100%;border-collapse:collapse;margin-top:22px;font-size:9px}thead{display:table-header-group}th{background:#126A31;color:white;text-align:left;padding:8px;text-transform:capitalize}td{padding:7px;border-bottom:1px solid #dde5ef}tr{break-inside:avoid}tbody tr:nth-child(even){background:#f7f9fc}</style></head><body><section class="cover"><img class="logo" src="${logoUrl}"><div class="eyebrow">${escapeReportValue(systemSettings?.organization.name || "")} · CRM ANALYTICS</div><h1>${title}</h1><p class="meta">Comprehensive overview and detailed records</p><p class="meta">Generated ${escapeReportValue(new Date().toLocaleString())} · ${items.length} records</p></section><main><header class="report-header"><div class="brand"><img src="${logoUrl}"><h1>${title}</h1></div><span>${items.length} records</span></header><section class="kpis"><div class="kpi">Total records<strong>${items.length}</strong></div><div class="kpi">Active / new<strong>${(statuses.active ?? 0) + (statuses.new ?? 0)}</strong></div><div class="kpi">Categories<strong>${Object.keys(groups).length}</strong></div></section><section class="charts"><div class="chart"><h2>By ${groupField}</h2>${bars(groups)}</div><div class="chart"><h2>By status</h2>${bars(statuses)}</div></section>${table}</main><script>window.onload=()=>setTimeout(()=>window.print(),250)</script></body></html>`,
    );
    reportWindow.document.close();
  };
  const exportReferralsPdf = async () => {
    const reportWindow = window.open("", "_blank");
    if (!reportWindow) {
      toast.error(t("crm.errors.popupBlocked"));
      return;
    }
    const items = await referralReportRows();
    const countsFor = (field: "referralType" | "status") =>
      items.reduce<Record<string, number>>((result, item) => {
        const key = String(item[field] ?? "Unknown");
        result[key] = (result[key] ?? 0) + 1;
        return result;
      }, {});
    const typeCounts = countsFor("referralType");
    const statusCounts = countsFor("status");
    const colors = ["#1C9B49", "#14b8a6", "#8b5cf6", "#f59e0b", "#ef4444"];
    const barChart = () => {
      const maximum = Math.max(1, ...Object.values(typeCounts));
      return Object.entries(typeCounts)
        .map(
          ([label, count], index) =>
            `<div class="bar-row"><div class="bar-label"><span>${escapeReportValue(label)}</span><strong>${count}</strong></div><div class="track"><div class="bar" style="width:${(count / maximum) * 100}%;background:${colors[index % colors.length]}"></div></div></div>`,
        )
        .join("");
    };
    const statusEntries = Object.entries(statusCounts);
    let angle = 0;
    const donutStops = statusEntries.map(([, count], index) => {
      const start = angle;
      angle += items.length ? (count / items.length) * 360 : 0;
      return `${colors[index % colors.length]} ${start}deg ${angle}deg`;
    });
    const reportingPeriod =
      referralFilters.from || referralFilters.to
        ? `${referralFilters.from || "Beginning"} — ${referralFilters.to || "Present"}`
        : "All dates";
    const logoUrl = new URL(nhoLogo, window.location.href).href;
    const completed = statusCounts.completed ?? 0;
    const active = statusCounts.active ?? 0;
    const completionRate = items.length
      ? Math.round((completed / items.length) * 100)
      : 0;
    const statusLegend = statusEntries
      .map(
        ([label, count], index) =>
          `<div class="legend-row"><i style="background:${colors[index % colors.length]}"></i><span>${escapeReportValue(label)}</span><strong>${count}</strong></div>`,
      )
      .join("");
    reportWindow.document.write(
      `<!doctype html><html><head><title>${escapeReportValue(systemSettings?.organization.name || "")} Referral Report</title><style>@page{size:A4;margin:14mm}*{box-sizing:border-box}body{margin:0;font:12px Arial,sans-serif;color:#172033;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}.cover{height:267mm;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:58px;background:linear-linear(145deg,#f8fbff 0%,#eef6ff 58%,#e2edff 100%);page-break-after:always}.cover:before{content:"";position:absolute;width:360px;height:360px;border-radius:50%;background:#1C9B49;right:-170px;top:-130px}.cover:after{content:"";position:absolute;width:220px;height:220px;border:42px solid #14b8a6;border-radius:50%;left:-130px;bottom:-100px}.logo{width:112px;height:112px;object-fit:contain;margin-bottom:44px;filter:drop-shadow(0 12px 20px #1e3a5f33)}.eyebrow{color:#1C9B49;font-weight:700;letter-spacing:3px;text-transform:uppercase}.cover h1{font-size:42px;line-height:1.05;margin:14px 0;color:#102a56}.cover .subtitle{font-size:18px;color:#526783;margin-bottom:54px}.cover-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;max-width:520px}.cover-meta{padding:16px 0;border-top:1px solid #bdcee4}.cover-meta span{display:block;color:#70829a;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin-bottom:7px}.cover-meta strong{font-size:14px}.report{padding:4px}.report-header{display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #1C9B49;padding-bottom:12px}.report-brand{display:flex;align-items:center;gap:10px}.report-brand img{width:42px;height:42px}.report-header h1{font-size:22px;margin:0}.muted{color:#667085}.kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0}.kpi{border:1px solid #dce5f0;border-radius:12px;padding:15px;background:linear-linear(145deg,#fff,#f7faff)}.kpi span{color:#667085}.kpi strong{display:block;font-size:25px;margin-top:5px;color:#126A31}.charts{display:grid;grid-template-columns:1.15fr .85fr;gap:15px;margin:16px 0 24px;break-inside:avoid}.chart{border:1px solid #dce5f0;border-radius:12px;padding:16px}.chart h2{font-size:15px;margin:0 0 15px}.bar-row{margin:12px 0}.bar-label{display:flex;justify-content:space-between;text-transform:capitalize}.track{height:10px;background:#edf1f7;border-radius:10px;margin-top:6px;overflow:hidden}.bar{height:100%;border-radius:10px}.donut-wrap{display:flex;align-items:center;justify-content:center;gap:20px}.donut{width:120px;height:120px;border-radius:50%;background:conic-linear(${donutStops.join(",") || "#e5e7eb 0deg 360deg"});position:relative}.donut:after{content:"${items.length}";position:absolute;inset:25px;border-radius:50%;background:#fff;display:grid;place-items:center;font-size:24px;font-weight:700;color:#126A31}.legend{min-width:110px}.legend-row{display:grid;grid-template-columns:10px 1fr auto;gap:7px;align-items:center;margin:9px 0;text-transform:capitalize}.legend-row i{width:8px;height:8px;border-radius:50%}table{width:100%;border-collapse:collapse;margin-top:10px;font-size:10px}thead{display:table-header-group}th{background:#126A31;color:#fff;text-align:left;padding:9px 7px}td{border-bottom:1px solid #dde5ef;padding:8px 7px}tbody tr:nth-child(even){background:#f7f9fc}tr{break-inside:avoid}.section-title{font-size:17px;margin:22px 0 8px}@media print{.cover{height:267mm}.report{padding:0}}</style></head><body><section class="cover"><img class="logo" src="${logoUrl}" alt="${escapeReportValue(systemSettings?.organization.name || "")}"><div class="eyebrow">ERP Workspace · CRM Analytics</div><h1>Referral<br>Performance Report</h1><p class="subtitle">Patient acquisition sources, referral outcomes, and detailed activity.</p><div class="cover-grid"><div class="cover-meta"><span>Reporting period</span><strong>${escapeReportValue(reportingPeriod)}</strong></div><div class="cover-meta"><span>Total referrals</span><strong>${items.length}</strong></div><div class="cover-meta"><span>Prepared on</span><strong>${escapeReportValue(new Date().toLocaleDateString())}</strong></div><div class="cover-meta"><span>Report status</span><strong>Confidential</strong></div></div></section><main class="report"><header class="report-header"><div class="report-brand"><img src="${logoUrl}" alt="${escapeReportValue(systemSettings?.organization.name || "")}"><div><h1>Referral Overview</h1><div class="muted">${escapeReportValue(reportingPeriod)}</div></div></div><div class="muted">Generated ${escapeReportValue(new Date().toLocaleString())}</div></header><section class="kpis"><div class="kpi"><span>Total referrals</span><strong>${items.length}</strong></div><div class="kpi"><span>Active referrals</span><strong>${active}</strong></div><div class="kpi"><span>Completion rate</span><strong>${completionRate}%</strong></div></section><section class="charts"><div class="chart"><h2>Referrals by source type</h2>${barChart()}</div><div class="chart"><h2>Referral status</h2><div class="donut-wrap"><div class="donut"></div><div class="legend">${statusLegend}</div></div></div></section><h2 class="section-title">Referral Details</h2><table><thead><tr><th>Patient</th><th>Referrer</th><th>Phone</th><th>Type</th><th>Date</th><th>Status</th></tr></thead><tbody>${referralReportTable(items)}</tbody></table></main><script>window.onload=()=>setTimeout(()=>window.print(),250)</script></body></html>`,
    );
    reportWindow.document.close();
  };
  const runReportExport = async (
    exporter: () => Promise<void>,
    errorKey = "crm.errors.reportExport",
  ) => {
    try {
      await exporter();
    } catch {
      toast.error(t(errorKey));
    }
  };
  return (
    <div className="mx-auto max-w-375 space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">
            {t("crm.eyebrow")}
          </p>
          <h1 className="mt-1 text-2xl font-bold">
            {t(`crm.resources.${resource}.title`, {
              defaultValue: config.title,
            })}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(`crm.resources.${resource}.description`, {
              defaultValue: config.description,
            })}
          </p>
        </div>
        {canManage && patientBooking && (
          <PatientAppointmentDialog
            patient={patientBooking.patient}
            surgery={patientBooking.surgery}
            onClose={() => setPatientBooking(null)}
            onSaved={() => {
              void data.refresh();
              void lookups.refresh();
            }}
          />
        )}
        {canManage && (
          <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
              setOpen(nextOpen);
              if (!nextOpen) {
                setEditingRecord(null);
                setAppointmentPatientId("");
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                permission="create"
                onClick={() => {
                  setEditingRecord(null);
                  setSurgeryDraftAt("");
                  setLeadChannel("");
                }}
              >
                <Plus />
                {t("crm.actions.addRecord")}
              </Button>
            </DialogTrigger>
            <DialogContent
              className={`flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 ${resource === "leads" ? "h-[88dvh] sm:max-w-5xl" : "sm:max-w-2xl"}`}
            >
              <DialogHeader className="shrink-0 border-b px-6 py-4">
                <DialogTitle>
                  {editingRecord
                    ? t("crm.actions.editRecord")
                    : t("crm.actions.addRecord")}
                </DialogTitle>
              </DialogHeader>
              <form
                key={editingRecord?.id ?? surgeryDraftAt ?? "create"}
                className="flex min-h-0 flex-1 flex-col overflow-hidden"
                onSubmit={submit}
              >
                <div
                  className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6 pt-4 scrollbar-gutter-stable grid gap-4 ${resource === "leads" ? "md:grid-cols-3" : "sm:grid-cols-2"}`}
                >
                  {config.fields
                    .filter(
                      (field) =>
                        resource !== "leads" ||
                        !field.name.startsWith("referral") ||
                        leadChannel === "traditional",
                    )
                    .map((field) => (
                      <Fragment key={field.name}>
                        {resource === "leads" && field.name === "name" && (
                          <div className="border-s-2 border-emerald-500 ps-3 font-bold text-emerald-800 md:col-span-3 dark:text-emerald-300">
                            {t("crm.leadForm.requiredFields")}
                          </div>
                        )}
                        {resource === "leads" && field.name === "age" && (
                          <div className="mt-2 border-s-2 border-emerald-500 ps-3 font-bold text-emerald-800 md:col-span-3 dark:text-emerald-300">
                            {t("crm.leadForm.personalInformation")}
                          </div>
                        )}
                        {resource === "leads" &&
                          field.name === "competitorsNote" && (
                            <div className="mt-2 border-s-2 border-emerald-500 ps-3 font-bold text-emerald-800 md:col-span-3 dark:text-emerald-300">
                              {t("crm.leadForm.notes")}
                            </div>
                          )}
                        {resource === "leads" &&
                          field.name === "leadSourceChannel" && (
                            <div className="mt-2 rounded-t-xl border border-emerald-200 bg-emerald-50/70 p-4 md:col-span-3 dark:border-emerald-900 dark:bg-emerald-950/20">
                              <p className="border-s-2 border-emerald-500 ps-3 font-bold text-emerald-800 dark:text-emerald-300">
                                {t("crm.leadForm.acquisitionDetails")}
                              </p>
                              <p className="mt-1 ps-3 text-xs text-muted-foreground">
                                {t("crm.leadForm.acquisitionHint")}
                              </p>
                            </div>
                          )}
                        <label
                          className={`grid gap-1.5 text-sm font-medium ${field.type === "textarea" ? (resource === "leads" ? "md:col-span-3" : "sm:col-span-2") : ""} ${resource === "leads" && ["leadSourceChannel", "source", "contactMethod", "patientType", "referralPersona", "referralName", "referralPhone", "referralAddress", "referralNote"].includes(field.name) ? "rounded-lg border-emerald-100 bg-emerald-50/30 p-3 dark:border-emerald-950 dark:bg-emerald-950/10" : ""}`}
                        >
                          {t(`crm.fields.${field.name}`, {
                            defaultValue: field.label,
                          })}
                          {field.type === "select" ? (
                            <Select
                              name={field.name}
                              required={field.required}
                              value={
                                field.name === "leadSourceChannel"
                                  ? leadChannel
                                  : undefined
                              }
                              onValueChange={
                                field.name === "leadSourceChannel"
                                  ? setLeadChannel
                                  : undefined
                              }
                              defaultValue={String(
                                editingRecord?.[field.name] ?? "",
                              )}
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t(
                                    "crm.placeholders.selectField",
                                    {
                                      field: t(`crm.fields.${field.name}`, {
                                        defaultValue: field.label,
                                      }),
                                    },
                                  )}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options
                                  ?.filter(
                                    (option) =>
                                      field.name !== "source" ||
                                      leadChannel !== "traditional" ||
                                      option.endsWith("_referral"),
                                  )
                                  .filter(
                                    (option) =>
                                      field.name !== "source" ||
                                      leadChannel !== "digital" ||
                                      !option.endsWith("_referral"),
                                  )
                                  .map((x) => (
                                    <SelectItem key={x} value={x}>
                                      {resource === "patients" &&
                                      field.name === "status"
                                        ? patientProgressLabel(x)
                                        : t(`crm.values.${x}`, {
                                            defaultValue: x.replaceAll(
                                              "_",
                                              " ",
                                            ),
                                          })}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          ) : field.type === "date" ||
                            field.type === "datetime" ? (
                            <FormDatePicker
                              name={field.name}
                              initialValue={String(
                                editingRecord?.[field.name] ??
                                  (field.name === "scheduledAt"
                                    ? surgeryDraftAt
                                    : ""),
                              )}
                              includeTime={field.type === "datetime"}
                              required={field.required}
                            />
                          ) : field.type === "patient" ? (
                            <SearchableSelect
                              name={field.name}
                              required={field.required}
                              defaultValue={String(
                                editingRecord?.[field.name] ??
                                  appointmentPatientId,
                              )}
                              placeholder={t("crm.actions.selectPatient")}
                              searchPlaceholder={t(
                                "crm.actions.searchPatients",
                              )}
                              pageSize={20}
                              options={choices(field).map((patient) => ({
                                value: patient.id,
                                label: labelOf(patient, field.type),
                                searchText: String(patient.patientCode ?? ""),
                              }))}
                            />
                          ) : field.type &&
                            [
                              "patient",
                              "doctor",
                              "surgery",
                              "surgeryAppointment",
                            ].includes(field.type) ? (
                            <Select
                              name={field.name}
                              required={field.required}
                              defaultValue={String(
                                editingRecord?.[field.name] ?? "",
                              )}
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t(
                                    "crm.placeholders.selectField",
                                    {
                                      field: t(`crm.fields.${field.name}`, {
                                        defaultValue: field.label,
                                      }),
                                    },
                                  )}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {choices(field).map((x) => (
                                  <SelectItem key={x.id} value={x.id}>
                                    {labelOf(x, field.type)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : field.type === "textarea" ? (
                            <textarea
                              name={field.name}
                              defaultValue={String(
                                editingRecord?.[field.name] ?? "",
                              )}
                              className="min-h-24 rounded-md border bg-background p-3"
                            />
                          ) : (
                            <Input
                              name={field.name}
                              type={field.type === "number" ? "number" : "text"}
                              step={field.type === "number" ? "any" : undefined}
                              defaultValue={String(
                                editingRecord?.[field.name] ?? "",
                              )}
                              required={field.required}
                            />
                          )}
                        </label>
                      </Fragment>
                    ))}
                  {resource === "leads" && (
                    <div className="grid gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors hover:border-emerald-400 hover:bg-emerald-50/40 md:col-span-3 dark:hover:bg-emerald-950/20">
                      <FileUp className="mx-auto size-8 text-emerald-600" />
                      <span className="font-semibold">
                        {t("crm.leadForm.attachments")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t("crm.leadForm.attachmentsHint")}
                      </span>
                      <Input
                        className="mx-auto max-w-md"
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                        onChange={(event) => {
                          addLeadFiles(Array.from(event.target.files ?? []));
                          event.target.value = "";
                        }}
                      />
                      {leadFiles.length > 0 && (
                        <span className="text-xs font-medium text-emerald-700">
                          {t("crm.leadForm.filesSelected", {
                            count: leadFiles.length,
                          })}
                        </span>
                      )}
                      {leadFiles.length > 0 && (
                        <div className="mx-auto grid w-full max-w-2xl gap-2 text-start">
                          {leadFiles.map((file, index) => (
                            <div
                              key={`${file.name}-${file.size}-${file.lastModified}`}
                              className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2"
                            >
                              <FileUp className="size-4 shrink-0 text-emerald-600" />
                              <span className="min-w-0 flex-1 truncate text-xs font-medium">
                                {file.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(1)} MB
                              </span>
                              <Button
                                permission="view"
                                data-action="delete"
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                  setLeadFiles((files) =>
                                    files.filter(
                                      (_, fileIndex) => fileIndex !== index,
                                    ),
                                  )
                                }
                              >
                                <Trash2 className="size-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="shrink-0 border-t bg-background px-6 py-4">
                  <Button
                    permission={editingRecord ? "update" : "create"}
                    className="w-full"
                    type="submit"
                  >
                    {editingRecord ? "Save changes" : "Save"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </header>
      <div className="flex max-w-2xl flex-wrap items-center gap-2">
        <div className="relative min-w-64 flex-1">
          <Search className="absolute inset-s-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            className="ps-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("crm.actions.searchRecords")}
          />
        </div>
        {(resource === "leads" || resource === "patients") && (
          <>
            <Button
              permission="export"
              variant="outline"
              onClick={() =>
                void runReportExport(() => exportCollectionExcel(resource))
              }
            >
              <FileSpreadsheet /> Excel
            </Button>
            <Button
              permission="export"
              variant="outline"
              onClick={() =>
                void runReportExport(() => exportCollectionPdf(resource))
              }
            >
              <Download /> PDF with charts
            </Button>
          </>
        )}
        {resource === "leads" && (
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <ListFilter />
                {t("crm.actions.filterLeads")}
                {activeFilterCount > 0 && (
                  <Badge className="ms-1 h-5 min-w-5 justify-center rounded-full px-1.5">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-4">
              <div className="mb-4">
                <p className="font-semibold">{t("crm.actions.filterLeads")}</p>
                <p className="text-xs text-muted-foreground">
                  Narrow results across every page.
                </p>
              </div>
              <div className="grid gap-3">
                <label className="grid gap-1.5 text-xs font-medium">
                  Source
                  <Input
                    value={draftFilters.source}
                    onChange={(event) =>
                      setDraftFilters((current) => ({
                        ...current,
                        source: event.target.value,
                      }))
                    }
                    placeholder={t("crm.placeholders.leadSource")}
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="grid gap-1.5 text-xs font-medium">
                    Gender
                    <Select
                      value={draftFilters.gender || "all"}
                      onValueChange={(gender) =>
                        setDraftFilters((current) => ({
                          ...current,
                          gender: gender === "all" ? "" : gender,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </label>
                  <label className="grid gap-1.5 text-xs font-medium">
                    Status
                    <Select
                      value={draftFilters.status || "all"}
                      onValueChange={(status) =>
                        setDraftFilters((current) => ({
                          ...current,
                          status: status === "all" ? "" : status,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {[
                          "new",
                          "contacted",
                          "qualified",
                          "converted",
                          "lost",
                        ].map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replaceAll("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="grid gap-1.5 text-xs font-medium">
                    Minimum age
                    <Input
                      type="number"
                      min={0}
                      max={150}
                      value={draftFilters.minAge}
                      onChange={(event) =>
                        setDraftFilters((current) => ({
                          ...current,
                          minAge: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="grid gap-1.5 text-xs font-medium">
                    Maximum age
                    <Input
                      type="number"
                      min={0}
                      max={150}
                      value={draftFilters.maxAge}
                      onChange={(event) =>
                        setDraftFilters((current) => ({
                          ...current,
                          maxAge: event.target.value,
                        }))
                      }
                    />
                  </label>
                </div>
                <div className="mt-1 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={clearLeadFilters}
                  >
                    {t("crm.actions.clear")}
                  </Button>
                  <Button type="button" onClick={applyLeadFilters}>
                    {t("crm.actions.applyFilters")}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
        {resource === "referrals" && (
          <>
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="relative">
                  <ListFilter /> {t("crm.actions.filterReferrals")}
                  {activeReferralFilterCount > 0 && (
                    <Badge className="ms-1 h-5 min-w-5 justify-center rounded-full px-1.5">
                      {activeReferralFilterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-96 p-4">
                <div className="mb-4">
                  <p className="font-semibold">
                    {t("crm.actions.filterReferrals")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("crm.referrals.filterDescription")}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <PatientFilterSelect
                    allLabel={t("crm.referrals.allTypes")}
                    label={t("crm.fields.referralType")}
                    value={draftReferralFilters.referralType}
                    options={[
                      ["patient", "Patient"],
                      ["doctor", "Doctor"],
                      ["employee", "Employee"],
                      ["organization", "Organization"],
                      ["other", "Other"],
                    ]}
                    onChange={(referralType) =>
                      setDraftReferralFilters((current) => ({
                        ...current,
                        referralType,
                      }))
                    }
                  />
                  <PatientFilterSelect
                    allLabel={t("crm.referrals.allStatuses")}
                    label={t("crm.fields.status")}
                    value={draftReferralFilters.status}
                    options={[
                      ["active", "Active"],
                      ["completed", "Completed"],
                      ["cancelled", "Cancelled"],
                    ]}
                    onChange={(status) =>
                      setDraftReferralFilters((current) => ({
                        ...current,
                        status,
                      }))
                    }
                  />
                  {(["from", "to"] as const).map((field) => (
                    <label
                      key={field}
                      className="grid gap-1.5 text-xs font-medium"
                    >
                      {t(`crm.referrals.${field}Date`)}
                      <FormDatePicker
                        value={draftReferralFilters[field]}
                        onValueChange={(value) =>
                          setDraftReferralFilters((current) => ({
                            ...current,
                            [field]: value,
                          }))
                        }
                      />
                    </label>
                  ))}
                </div>
                <div className="mt-4 flex justify-end gap-2 border-t pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={clearReferralFilters}
                  >
                    {t("crm.actions.clear")}
                  </Button>
                  <Button type="button" onClick={applyReferralFilters}>
                    {t("crm.actions.applyFilters")}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              permission="export"
              variant="outline"
              onClick={() =>
                void runReportExport(
                  exportReferralsExcel,
                  "crm.errors.referralExport",
                )
              }
            >
              <FileSpreadsheet /> {t("crm.actions.excel")}
            </Button>
            <Button
              permission="export"
              variant="outline"
              onClick={() =>
                void runReportExport(
                  exportReferralsPdf,
                  "crm.errors.referralExport",
                )
              }
            >
              <Download /> {t("crm.actions.pdfWithCharts")}
            </Button>
          </>
        )}
        {resource === "patients" && (
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <ListFilter /> {t("crm.actions.filterPatients")}
                {activePatientFilterCount > 0 && (
                  <Badge className="ms-1 h-5 min-w-5 justify-center rounded-full px-1.5">
                    {activePatientFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-96 p-4">
              <div className="mb-4">
                <p className="font-semibold">
                  {t("crm.actions.filterPatients")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("crm.filterPatientsDescription")}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <PatientFilterSelect
                  allLabel={t("crm.values.all")}
                  label="Gender"
                  value={draftPatientFilters.gender}
                  options={[
                    ["male", "Male"],
                    ["female", "Female"],
                    ["other", "Other"],
                  ]}
                  onChange={(gender) =>
                    setDraftPatientFilters((current) => ({
                      ...current,
                      gender,
                    }))
                  }
                />
                <PatientFilterSelect
                  allLabel={t("crm.values.all")}
                  label="Blood type"
                  value={draftPatientFilters.bloodType}
                  options={[
                    "A+",
                    "A-",
                    "B+",
                    "B-",
                    "AB+",
                    "AB-",
                    "O+",
                    "O-",
                  ].map((value) => [value, value])}
                  onChange={(bloodType) =>
                    setDraftPatientFilters((current) => ({
                      ...current,
                      bloodType,
                    }))
                  }
                />
                <PatientFilterSelect
                  allLabel={t("crm.values.all")}
                  label="Status"
                  value={draftPatientFilters.status}
                  options={[...patientStages, "active", "inactive"].map(
                    (status) => [status, patientProgressLabel(status)],
                  )}
                  onChange={(status) =>
                    setDraftPatientFilters((current) => ({
                      ...current,
                      status,
                    }))
                  }
                />
                <PatientFilterSelect
                  allLabel={t("crm.values.all")}
                  label="Marital status"
                  value={draftPatientFilters.isMarried}
                  options={[
                    ["true", "Married"],
                    ["false", "Not married"],
                  ]}
                  onChange={(isMarried) =>
                    setDraftPatientFilters((current) => ({
                      ...current,
                      isMarried,
                    }))
                  }
                />
                <PatientFilterSelect
                  allLabel={t("crm.values.all")}
                  label="Diabetes"
                  value={draftPatientFilters.hasDiabetes}
                  options={[
                    ["true", "Has diabetes"],
                    ["false", "No diabetes"],
                  ]}
                  onChange={(hasDiabetes) =>
                    setDraftPatientFilters((current) => ({
                      ...current,
                      hasDiabetes,
                    }))
                  }
                />
                <PatientFilterSelect
                  allLabel={t("crm.values.all")}
                  label="Blood pressure"
                  value={draftPatientFilters.hasHypertension}
                  options={[
                    ["true", "Has high pressure"],
                    ["false", "No high pressure"],
                  ]}
                  onChange={(hasHypertension) =>
                    setDraftPatientFilters((current) => ({
                      ...current,
                      hasHypertension,
                    }))
                  }
                />
              </div>
              <div className="mt-4 flex justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={clearPatientFilters}
                >
                  {t("crm.actions.clear")}
                </Button>
                <Button type="button" onClick={applyPatientFilters}>
                  {t("crm.actions.applyFilters")}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
        {resource === "patients" && (
          <div className="flex rounded-lg border p-1">
            <Button
              type="button"
              size="sm"
              variant={patientView === "grid" ? "default" : "ghost"}
              onClick={() => setPatientView("grid")}
            >
              <LayoutGrid /> {t("crm.actions.grid")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={patientView === "table" ? "default" : "ghost"}
              onClick={() => setPatientView("table")}
            >
              <List /> {t("crm.actions.table")}
            </Button>
          </div>
        )}
        {resource === "surgery-appointments" && (
          <div className="flex rounded-lg border p-1">
            <Button
              type="button"
              size="sm"
              variant={surgeryView === "calendar" ? "default" : "ghost"}
              onClick={() => setSurgeryView("calendar")}
            >
              <CalendarDays /> {t("crm.actions.calendar")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={surgeryView === "table" ? "default" : "ghost"}
              onClick={() => setSurgeryView("table")}
            >
              <List /> {t("crm.actions.table")}
            </Button>
          </div>
        )}
      </div>
      {resource === "referrals" && activeReferralFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-muted/20 px-4 py-2 text-xs">
          <span className="font-semibold text-muted-foreground">
            {t("crm.referrals.activeFilters")}
          </span>
          {referralFilters.referralType && (
            <Badge variant="outline" className="gap-2 bg-background">
              {t("crm.fields.referralType")}:{" "}
              {t(`crm.values.${referralFilters.referralType}`)}{" "}
              <button
                type="button"
                onClick={() =>
                  setReferralFilters((current) => ({
                    ...current,
                    referralType: "",
                  }))
                }
              >
                ×
              </button>
            </Badge>
          )}
          {referralFilters.status && (
            <Badge variant="outline" className="gap-2 bg-background">
              {t("crm.fields.status")}:{" "}
              {t(`crm.values.${referralFilters.status}`)}{" "}
              <button
                type="button"
                onClick={() =>
                  setReferralFilters((current) => ({ ...current, status: "" }))
                }
              >
                ×
              </button>
            </Badge>
          )}
          {(referralFilters.from || referralFilters.to) && (
            <Badge variant="outline" className="gap-2 bg-background">
              {t("crm.referrals.dateFilter")}: {referralFilters.from || "…"} —{" "}
              {referralFilters.to || "…"}{" "}
              <button
                type="button"
                onClick={() =>
                  setReferralFilters((current) => ({
                    ...current,
                    from: "",
                    to: "",
                  }))
                }
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}
      {resource === "surgery-appointments" && surgeryView === "calendar" ? (
        <SurgeryAppointmentCalendar
          appointments={rows}
          onCreate={(day) => {
            const year = day.getFullYear();
            const month = String(day.getMonth() + 1).padStart(2, "0");
            const date = String(day.getDate()).padStart(2, "0");
            setEditingRecord(null);
            setSurgeryDraftAt(`${year}-${month}-${date}T09:00`);
            setOpen(true);
          }}
          onEdit={(appointment) => {
            setSurgeryDraftAt("");
            setEditingRecord(appointment);
            setOpen(true);
          }}
        />
      ) : resource === "patients" && patientView === "grid" ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {rows.map((patient) => (
              <Card
                key={patient.id}
                className="group overflow-hidden transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
              >
                <Link to={`/crm/patients/${patient.id}`} className="block">
                  <div className="bg-linear-to-br from-primary/10 via-teal-500/5 to-transparent p-4 pb-3">
                    <div className="flex items-start gap-3">
                      <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-primary/15 bg-background text-sm font-bold text-primary shadow-sm transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        {String(patient.firstName ?? "P").charAt(0)}
                        {String(patient.lastName ?? "").charAt(0)}
                      </span>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <h2 className="truncate font-bold group-hover:text-primary">
                          {String(patient.firstName)} {String(patient.lastName)}
                        </h2>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {String(patient.patientCode)}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`shrink-0 capitalize ${statusClass(patient.status)}`}
                      >
                        {patientProgressLabel(patient.status)}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4 pt-3">
                    <div className="grid grid-cols-3 divide-x rounded-xl border bg-muted/20 py-2.5 rtl:divide-x-reverse">
                      <div className="text-center">
                        <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
                          Age
                        </p>
                        <p className="mt-0.5 text-sm font-bold">
                          {patientAge(patient.dateOfBirth)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
                          Blood
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-red-600">
                          {String(patient.bloodType ?? "—")}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
                          Visits
                        </p>
                        <p className="mt-0.5 text-sm font-bold">
                          {String(
                            (
                              patient._count as
                                Record<string, unknown> | undefined
                            )?.surgeryAppointments ?? 0,
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs">
                      <span className="flex items-center gap-2 truncate">
                        <Phone className="size-3.5 shrink-0 text-primary" />
                        {String(patient.phone)}
                      </span>
                      <span className="flex items-center gap-2 truncate">
                        <MapPin className="size-3.5 shrink-0 text-primary" />
                        {String(patient.address ?? "Address not recorded")}
                      </span>
                    </div>
                    <div className="mt-3 flex min-h-6 flex-wrap gap-1.5">
                      <Badge
                        variant="secondary"
                        className="h-5 capitalize text-[10px]"
                      >
                        {String(patient.gender ?? "Unknown")}
                      </Badge>
                      {Boolean(patient.hasDiabetes) && (
                        <Badge className="h-5 bg-amber-100 text-[10px] text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300">
                          Diabetes
                        </Badge>
                      )}
                      {Boolean(patient.hasHypertension) && (
                        <Badge className="h-5 bg-red-100 text-[10px] text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300">
                          High pressure
                        </Badge>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t pt-3 text-[11px]">
                      <span className="text-muted-foreground">
                        {String(
                          (
                            patient._count as
                              Record<string, unknown> | undefined
                          )?.formSubmissions ?? 0,
                        )}{" "}
                        clinical forms
                      </span>
                      <span className="font-semibold text-primary">
                        View profile →
                      </span>
                    </div>
                  </CardContent>
                </Link>
                {canManage && (
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 border-t p-3">
                    {patientStatusControl(patient)}
                    {patientEditAction(patient)}
                    {patientAppointmentAction(patient)}
                  </div>
                )}
              </Card>
            ))}
          </div>
          {data.data && (
            <div className="overflow-hidden rounded-xl border bg-card">
              <PaginationControls
                page={data.data.pagination.page}
                totalPages={data.data.pagination.totalPages}
                total={data.data.pagination.total}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                {config.columns.map((x) => (
                  <TableHead key={x}>
                    {t(`crm.fields.${x}`, {
                      defaultValue:
                        resource === "leads"
                          ? ({
                              address: "Location",
                              interest: "Occupation",
                              notes: "Additional note",
                            }[x] ??
                            x
                              .replaceAll(/([A-Z])/g, " $1")
                              .replace(/^./, (c) => c.toUpperCase()))
                          : x
                              .replaceAll(/([A-Z])/g, " $1")
                              .replace(/^./, (c) => c.toUpperCase()),
                    })}
                  </TableHead>
                ))}
                {(canManage ||
                  resource === "referrals" ||
                  resource === "surgeries") && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody
              autoPaginate={false}
              pagination={
                data.data
                  ? {
                      ...data.data.pagination,
                      onPageChange: setPage,
                      disabled: data.isLoading,
                    }
                  : undefined
              }
            >
              {rows.map((row) => (
                <TableRow key={row.id}>
                  {config.columns.map((key) => (
                    <TableCell key={key}>
                      {key === "code" && resource === "leads" ? (
                        <div>
                          <p className="font-semibold">{show(row, key)}</p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            Created{" "}
                            {new Date(
                              String(row.createdAt),
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      ) : key === "gender" && resource === "leads" ? (
                        genderIcon(row.gender)
                      ) : key === "status" &&
                        resource === "leads" &&
                        canManage ? (
                        <div className="flex min-w-60 items-center gap-2">
                          <Select
                            value={String(row.status)}
                            onValueChange={(status) =>
                              void updateLeadStatus(row, status)
                            }
                          >
                            <SelectTrigger
                              className={`h-8 capitalize font-semibold ${statusClass(row.status)}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                "new",
                                "contacted",
                                "qualified",
                                "appointment_requested",
                                "surgery_appointment",
                                "converted",
                                "direct_surgery_converted",
                                "lost",
                              ].map((status) => (
                                <SelectItem key={status} value={status}>
                                  {t(`crm.values.${status}`, {
                                    defaultValue: status.replaceAll("_", " "),
                                  })}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {Boolean(row.convertedPatient) && (
                            <span
                              className="size-2 shrink-0 rounded-full bg-emerald-500"
                              title="Patient created"
                            />
                          )}
                        </div>
                      ) : key === "name" && resource === "patients" ? (
                        <Link
                          to={`/crm/patients/${row.id}`}
                          className="font-semibold text-primary hover:underline"
                        >
                          {show(row, key)}
                        </Link>
                      ) : key === "status" &&
                        resource === "patients" &&
                        canManage ? (
                        patientStatusControl(row)
                      ) : key === "status" ? (
                        <Badge
                          variant="outline"
                          className={`capitalize ${statusClass(row.status)}`}
                        >
                          {resource === "patients"
                            ? patientProgressLabel(row.status)
                            : show(row, key)}
                        </Badge>
                      ) : (
                        show(row, key)
                      )}
                    </TableCell>
                  ))}
                  {(canManage ||
                    resource === "referrals" ||
                    resource === "surgeries") && (
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {resource === "referrals" && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              title={t("crm.actions.viewReferralDetails")}
                              onClick={() => setSelectedReferral(row)}
                            >
                              <Eye className="size-4 text-teal-600" />
                            </Button>
                            {canManage && (
                              <Button
                                data-action="edit"
                                size="icon"
                                variant="ghost"
                                title={t("crm.actions.editReferral")}
                                onClick={() => {
                                  setEditingRecord(row);
                                  setOpen(true);
                                }}
                              >
                                <Pencil className="size-4 text-primary" />
                              </Button>
                            )}
                          </>
                        )}
                        {resource === "surgeries" && (
                          <Button
                            permission="view"
                            size="icon"
                            variant="ghost"
                            title={t("crmDialogs.viewSurgery")}
                            aria-label={t("crmDialogs.viewSurgery")}
                            onClick={() => setSelectedSurgery(row)}
                          >
                            <Eye className="size-4 text-teal-600" />
                          </Button>
                        )}
                        {(resource === "surgeries" ||
                          resource === "payments") &&
                          canManage && (
                            <Button
                              data-action="edit"
                              size="icon"
                              variant="ghost"
                              title={t("crm.actions.editRecord")}
                              aria-label={t("crm.actions.editRecord")}
                              onClick={() => {
                                setEditingRecord(row);
                                setOpen(true);
                              }}
                            >
                              <Pencil className="size-4 text-primary" />
                            </Button>
                          )}
                        {resource === "patients" && canManage && (
                          <>
                            {patientEditAction(row)}
                            {patientAppointmentAction(row)}
                          </>
                        )}
                        {resource === "leads" && (
                          <>
                            <Button
                              asChild
                              size="icon"
                              variant="ghost"
                              title={t("crm.actions.viewDetails")}
                            >
                              <Link to={`/crm/leads/${row.id}`}>
                                <Eye className="size-4 text-teal-600" />
                              </Link>
                            </Button>
                            <Button
                              permission="healthcare.appointments.create"
                              asChild
                              size="icon"
                              variant="ghost"
                              title="Quick appointment"
                            >
                              <Link to={leadAppointmentUrl(row)}>
                                <CalendarPlus className="size-4 text-primary" />
                              </Link>
                            </Button>
                            <Button
                              data-action="edit"
                              size="icon"
                              variant="ghost"
                              title="Edit lead"
                              onClick={() => {
                                setEditingRecord(row);
                                setLeadChannel(
                                  String(row.leadSourceChannel ?? ""),
                                );
                                setOpen(true);
                              }}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          </>
                        )}
                        {canManage && (
                          <DeleteConfirmationDialog
                            description={t(
                              resource === "surgeries"
                                ? "crmDialogs.surgeryDeleteDescription"
                                : "crmDialogs.deleteDescription",
                            )}
                            onConfirm={async () => {
                              try {
                                await crmApi[resource].remove(row.id);
                                await Promise.all([
                                  data.refresh(),
                                  lookups.refresh(),
                                ]);
                              } catch (error) {
                                toast.error(
                                  resource === "leads"
                                    ? t("crm.errors.leadDelete")
                                    : resource === "referrals"
                                      ? t("crm.errors.referralDelete")
                                      : apiErrorMessage(error),
                                );
                              }
                            }}
                          >
                            <Button
                              data-action="delete"
                              size="icon"
                              variant="ghost"
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </DeleteConfirmationDialog>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Dialog
        open={Boolean(selectedSurgery)}
        onOpenChange={(isOpen) => !isOpen && setSelectedSurgery(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {String(selectedSurgery?.name ?? t("crmDialogs.surgeryDetails"))}
            </DialogTitle>
          </DialogHeader>
          {selectedSurgery && (
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                { name: "code", label: "Code" },
                ...configs.surgeries.fields,
              ].map((field) => (
                <div key={field.name}>
                  <dt className="text-sm text-muted-foreground">
                    {t(`crm.fields.${field.name}`, {
                      defaultValue: field.label,
                    })}
                  </dt>
                  <dd className="whitespace-pre-wrap warp-break-words">
                    {show(selectedSurgery, field.name)}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(selectedReferral)}
        onOpenChange={(isOpen) => !isOpen && setSelectedReferral(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("crm.referrals.detailsTitle")}</DialogTitle>
          </DialogHeader>
          {selectedReferral && (
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["referrerName", selectedReferral.referrerName],
                ["referrerProfession", selectedReferral.referrerProfession],
                ["referrerPhone", selectedReferral.referrerPhone],
                ["referrerAddress", selectedReferral.referrerAddress],
                ["direction", selectedReferral.direction],
                ["referralPersona", selectedReferral.referralPersona],
                ["referringPatientName", selectedReferral.referringPatientName],
                ["broughtPatients", selectedReferral.broughtPatients],
                ["refereeName", selectedReferral.refereeName],
                ["leadCode", selectedReferral.leadCode],
                ["referralType", selectedReferral.referralType],
                ["status", selectedReferral.status],
                [
                  "referredAt",
                  selectedReferral.referredAt
                    ? new Date(
                        String(selectedReferral.referredAt),
                      ).toLocaleDateString()
                    : null,
                ],
                [
                  "createdAt",
                  selectedReferral.createdAt
                    ? new Date(
                        String(selectedReferral.createdAt),
                      ).toLocaleString()
                    : null,
                ],
              ].map(([key, value]) => (
                <div
                  key={String(key)}
                  className="rounded-xl border bg-muted/15 p-4"
                >
                  <p className="text-xs text-muted-foreground">
                    {t(`crm.fields.${key}`)}
                  </p>
                  <p className="mt-1 font-semibold capitalize">
                    {String(value ?? "—").replaceAll("_", " ")}
                  </p>
                </div>
              ))}
              <div className="rounded-xl border bg-muted/15 p-4 sm:col-span-2">
                <p className="text-xs text-muted-foreground">
                  {t("crm.fields.notes")}
                </p>
                <p className="mt-1 whitespace-pre-wrap font-medium">
                  {String(selectedReferral.notes ?? "—")}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
