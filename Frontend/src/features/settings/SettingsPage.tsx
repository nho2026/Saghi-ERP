import { hasPermission } from "@/features/auth/access";
import { SearchableFilter } from "@/shared/components/ui/searchable-filter";
import { NavigationPreference } from "./NavigationPreference";
import { useSettingsTranslation } from "./useSettingsTranslation";
import { Card } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Video,
  Building2,
  Users,
  Stethoscope,
  Wallet,
  Bell,
  Shield,
  Settings2,
  Save,
  RefreshCw,
} from "lucide-react";
import { apiClient, apiErrorMessage } from "@/shared/api/client";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { storedUser } from "@/features/auth/access";
import { loadSettings, useSettings } from "./settings";
import HealthcarePage from "@/features/healthcare/pages/HealthcarePage";
import { UpdatesPanel } from "./UpdatesPanel";
const categories = [
  ["meetings", "Live Meetings", Video, "Video, audio and participation"],
  [
    "organization",
    "Organization",
    Building2,
    "Identity, branches and contact details",
  ],
  ["hr", "HR & Attendance", Users, "Working hours and leave policies"],
  ["healthcare", "Healthcare", Stethoscope, "Specializations and booking"],
  ["finance", "Finance & Billing", Wallet, "Currency, payments and invoices"],
  ["notifications", "Notifications", Bell, "Reminders and desktop alerts"],
  ["security", "Security & Access", Shield, "Sessions and access management"],
  [
    "system",
    "System & Maintenance",
    Settings2,
    "Regional preferences, backups and updates",
  ],
] as const;
const labels: Record<string, string> = {
  videoQuality: "Default video quality",
  maxVideoQuality: "Maximum video quality",
  audioQuality: "Audio quality",
  echoCancellation: "Echo cancellation",
  noiseSuppression: "Noise suppression",
  screenSharing: "Allow screen sharing",
  screenQuality: "Screen sharing quality",
  participantLimit: "Maximum participants",
  cameraDefault: "Start camera when joining",
  microphoneDefault: "Start microphone when joining",
  name: "Organization name",
  loadingText: "Loading screen text",
  logo: "Logo URL",
  branches: "Branches",
  email: "Contact email",
  phone: "Contact phone",
  address: "Address",
  startTime: "Default work start",
  endTime: "Default work end",
  weekends: "Weekend days",
  graceMinutes: "Late arrival grace (minutes)",
  penaltyMultiplier: "Attendance deduction multiplier",
  targetMinutes: "Default target work minutes",
  appointmentMinutes: "Default appointment duration (minutes)",
  bookingStart: "Public booking opens",
  bookingEnd: "Public booking closes",
  bookingDays: "Public booking days",
  operatingRooms: "Operating rooms",
  currency: "Default currency",
  paymentMethods: "Accepted payment methods",
  invoicePrefix: "Invoice prefix",
  invoiceNextNumber: "Next invoice number",
  meetingReminders: "Meeting reminders",
  appointmentReminders: "Appointment reminders",
  reminderMinutes: "Appointment reminder lead time (minutes)",
  taskAlerts: "Task alerts",
  desktopAlerts: "Desktop notifications",
  sessionHours: "Session lifetime (hours)",
  rememberDays: "Remember-me lifetime (days)",
  passwordForDeletion: "Require password for protected deletions",
  language: "Default language",
  timezone: "Timezone",
  dateFormat: "Date format",
  backupEnabled: "Scheduled database backups",
  backupIntervalHours: "Backup interval (hours)",
  backupRetentionDays: "Backup retention (days)",
};
const choices: Record<string, string[]> = {
  videoQuality: ["auto", "360p", "720p", "1080p", "audio_only"],
  maxVideoQuality: ["360p", "720p", "1080p"],
  audioQuality: ["low", "standard", "high"],
  screenQuality: ["documents", "video"],
  language: ["en", "ar", "ku"],
  dateFormat: ["yyyy-MM-dd", "dd/MM/yyyy", "MM/dd/yyyy"],
};
const hints: Record<string, string> = {
  loadingText:
    "Leave empty to use the translated loading message. The logo and organization name also appear on startup.",
  videoQuality:
    "Auto uses adaptive WebRTC video up to the maximum quality. Changes apply when joining or restarting media.",
  participantLimit:
    "Meetings use peer-to-peer connections. Higher limits require more bandwidth on every device.",
  sessionHours: "Applies to new logins. Existing sessions keep their expiry.",
  startTime:
    "Default for new employees; existing employee schedules remain editable.",
  passwordForDeletion:
    "Attendance permission deletion always requires a superadmin password. This preference controls other protected attendance deletions.",
  backupEnabled:
    "Database only. Uploaded files need a separate filesystem backup.",
  language:
    "Default for new users; personal language selections take precedence.",
  timezone:
    "Used for public booking hours, reminders and configured date displays.",
  invoiceNextNumber:
    "Used with the prefix for new invoices. Choose an unused sequence.",
};
const timezoneOptions = (() => {
  const fallback = [
    "Asia/Baghdad",
    "Asia/Dubai",
    "Asia/Riyadh",
    "Asia/Tehran",
    "Asia/Kolkata",
    "Asia/Tokyo",
    "Europe/London",
    "Europe/Paris",
    "Europe/Istanbul",
    "America/New_York",
    "America/Chicago",
    "America/Los_Angeles",
    "Australia/Sydney",
  ];
  try {
    return [...new Set(["UTC", ...Intl.supportedValuesOf("timeZone")])].sort();
  } catch {
    return ["UTC", ...fallback].sort();
  }
})();

export default function SettingsPage() {
  const { tr } = useSettingsTranslation();
  const settings = useSettings();
  const [params, setParams] = useSearchParams();
  const selected =
    categories.find((c) => c[0] === params.get("category")) ?? categories[0];
  const category = selected[0];
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const admin = hasPermission(storedUser(), "settings.update");
  useEffect(() => {
    void loadSettings().catch((e) => setError(apiErrorMessage(e)));
  }, []);
  useEffect(() => {
    if (settings) setDraft({ ...settings[category] });
    setError("");
    setSaved(false);
  }, [settings, category]);
  const change = (key: string, value: unknown) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setSaved(false);
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = Object.fromEntries(
        Object.entries(draft).map(([key, value]) => [
          key,
          Array.isArray(value) && !["weekends", "bookingDays"].includes(key)
            ? value.map((item) => String(item).trim()).filter(Boolean)
            : value,
        ]),
      );
      await apiClient.put(`/settings/${category}`, payload);
      await loadSettings();
      setSaved(true);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{tr("System settings")}</h1>
        <p className="text-sm text-muted-foreground">
          {tr("Manage organization policies and application preferences.")}
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[250px_1fr]">
        <nav
          aria-label={tr("Settings categories")}
          className="sticky top-0 z-10 flex self-start gap-2 overflow-x-auto bg-background pb-2 lg:top-4 lg:block lg:space-y-1 lg:overflow-visible lg:bg-transparent lg:pb-0"
        >
          {categories.map(([key, title, Icon, description]) => (
            <Button
              type="button"
              variant={category === key ? "default" : "ghost"}
              aria-current={category === key ? "page" : undefined}
              key={key}
              onClick={() => setParams({ category: key })}
              className={`flex h-auto min-w-48 w-full justify-start items-start whitespace-normal gap-3 rounded-xl p-3 text-start ${category === key ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              <Icon className="mt-0.5 size-5 shrink-0" />
              <span>
                <span className="block text-sm font-semibold">{tr(title)}</span>
                <span className="block text-xs opacity-75">
                  {tr(description)}
                </span>
              </span>
            </Button>
          ))}
        </nav>
        <div className="min-w-0 space-y-5">
          <Card className="p-5">
            <form onSubmit={save} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">{tr(selected[1])}</h2>
                {!admin && (
                  <p className="text-sm text-muted-foreground">
                    {tr("Permission is required to change system policies.")}
                  </p>
                )}
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {tr(error)}
                </p>
              )}
              {!settings ? (
                <Button
                  type="button"
                  onClick={() =>
                    void loadSettings().catch((e) =>
                      setError(apiErrorMessage(e)),
                    )
                  }
                >
                  {tr("Retry loading settings")}
                </Button>
              ) : (
                <fieldset
                  disabled={!admin || busy}
                  className="grid gap-5 sm:grid-cols-2"
                >
                  {Object.entries(draft).map(([key, value]) => (
                    <div
                      key={key}
                      className={
                        Array.isArray(value) || key === "logo"
                          ? "sm:col-span-2"
                          : ""
                      }
                    >
                      <Label
                        htmlFor={`setting-${key}`}
                        className="mb-1.5 block text-sm font-medium"
                      >
                        {tr(labels[key] ?? key)}
                      </Label>
                      {typeof value === "boolean" ? (
                        <Checkbox
                          id={`setting-${key}`}
                          disabled={!admin || busy}
                          checked={value}
                          onCheckedChange={(checked) =>
                            change(key, checked === true)
                          }
                          className="size-5"
                        />
                      ) : key === "timezone" ? (
                        <SearchableFilter
                          value={String(value)}
                          onValueChange={(next) => {
                            if (admin && !busy) change(key, next);
                          }}
                          options={[
                            ...new Set([...timezoneOptions, String(value)]),
                          ]
                            .filter(Boolean)
                            .sort()
                            .map((zone) => ({ value: zone, label: zone }))}
                          label={tr(labels[key] ?? key)}
                          className="w-full"
                          searchable
                        />
                      ) : choices[key] ? (
                        <Select
                          disabled={!admin || busy}
                          value={String(value)}
                          onValueChange={(next) => change(key, next)}
                        >
                          <SelectTrigger
                            id={`setting-${key}`}
                            className="w-full"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {choices[key].map((option) => (
                              <SelectItem key={option} value={option}>
                                {tr(
                                  (
                                    {
                                      auto: "Auto",
                                      audio_only: "Audio only",
                                      low: "Low",
                                      standard: "Standard",
                                      high: "High",
                                      documents: "Documents",
                                      video: "Video",
                                      en: "English",
                                      ar: "Arabic",
                                      ku: "Kurdish",
                                    } as Record<string, string>
                                  )[option] ?? option,
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : key === "weekends" || key === "bookingDays" ? (
                        <div className="flex flex-wrap gap-3">
                          {[
                            "Sunday",
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                          ].map((day, index) => (
                            <Label
                              key={tr(day)}
                              className="flex items-center gap-1 text-sm"
                            >
                              <Checkbox
                                disabled={!admin || busy}
                                checked={(value as number[]).includes(index)}
                                onCheckedChange={(checked) =>
                                  change(
                                    key,
                                    checked === true
                                      ? [...(value as number[]), index]
                                      : (value as number[]).filter(
                                          (d) => d !== index,
                                        ),
                                  )
                                }
                              />
                              {tr(day)}
                            </Label>
                          ))}
                        </div>
                      ) : key === "paymentMethods" ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {Object.entries({
                            cash: "Cash",
                            card: "Card",
                            bank_transfer: "Bank transfer",
                            cheque: "Cheque",
                            other: "Other",
                          }).map(([method, label]) => (
                            <Label
                              key={method}
                              className="flex items-center gap-2 rounded-lg border p-3"
                            >
                              <Checkbox
                                disabled={!admin || busy}
                                checked={(value as string[]).includes(method)}
                                onCheckedChange={(checked) =>
                                  change(
                                    key,
                                    checked === true
                                      ? [...(value as string[]), method]
                                      : (value as string[]).filter(
                                          (item) => item !== method,
                                        ),
                                  )
                                }
                              />
                              {tr(label)}
                            </Label>
                          ))}
                        </div>
                      ) : Array.isArray(value) ? (
                        <div className="space-y-2">
                          {(value as string[]).map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <Input
                                id={index === 0 ? `setting-${key}` : undefined}
                                aria-label={`${tr(labels[key] ?? key)} ${index + 1}`}
                                value={item}
                                onChange={(event) =>
                                  change(
                                    key,
                                    value.map((entry, position) =>
                                      position === index
                                        ? event.target.value
                                        : entry,
                                    ),
                                  )
                                }
                              />
                              <Button
                                type="button"
                                variant="outline"
                                disabled={!admin || busy}
                                aria-label={`${tr("Remove item")} ${index + 1}`}
                                onClick={() =>
                                  change(
                                    key,
                                    value.filter(
                                      (_, position) => position !== index,
                                    ),
                                  )
                                }
                              >
                                {tr("Remove item")}
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            disabled={!admin || busy}
                            onClick={() => change(key, [...value, ""])}
                          >
                            {tr("Add item")}
                          </Button>
                        </div>
                      ) : (
                        <Input
                          id={`setting-${key}`}
                          type={
                            typeof value === "number"
                              ? "number"
                              : key.endsWith("Time") ||
                                  key === "bookingStart" ||
                                  key === "bookingEnd"
                                ? "time"
                                : "text"
                          }
                          readOnly={key === "currency"}
                          value={String(value ?? "")}
                          onChange={(e) =>
                            change(
                              key,
                              typeof value === "number"
                                ? Number(e.target.value)
                                : e.target.value,
                            )
                          }
                        />
                      )}
                      {key === "logo" && (
                        <>
                          <Input
                            aria-label={tr("Upload organization logo")}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="mt-2 text-sm"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (file.size > 1_400_000) {
                                setError("Choose a logo smaller than 1.4 MB.");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = () =>
                                change("logo", reader.result);
                              reader.readAsDataURL(file);
                            }}
                          />
                          {value ? (
                            <img
                              src={String(value)}
                              alt={tr("Organization logo preview")}
                              className="mt-3 h-16 max-w-48 object-contain"
                            />
                          ) : null}
                        </>
                      )}
                      {hints[key] && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {tr(hints[key])}
                        </p>
                      )}
                    </div>
                  ))}
                </fieldset>
              )}
              {admin && settings && (
                <div className="flex items-center gap-3">
                  <Button permission="update" disabled={busy} type="submit">
                    <Save className="size-4" />
                    {tr(busy ? "Saving…" : "Save changes")}
                  </Button>
                  {saved && (
                    <span role="status" className="text-sm text-green-600">
                      {tr("Settings saved")}
                    </span>
                  )}
                </div>
              )}
            </form>
          </Card>
          {category === "healthcare" && (
            <HealthcarePage resource="specializations" />
          )}
          {category === "security" && (
            <div className="flex flex-wrap gap-3">
              <Button permission="roles.view" asChild variant="outline">
                <Link to="/roles">{tr("Manage roles & permissions")}</Link>
              </Button>
              <Button permission="users.view" asChild variant="outline">
                <Link to="/users">{tr("Manage users")}</Link>
              </Button>
            </div>
          )}
          {category === "system" && (
            <>
              <NavigationPreference />
              <UpdatesPanel />
              <Card className="p-5">
                <h2 className="font-semibold mb-3">{tr("Integrations")}</h2>
                <Button
                  permission="attendance.devices.view"
                  asChild
                  variant="outline"
                >
                  <Link to="/attendance/devices">
                    {tr("Manage attendance devices")}
                  </Link>
                </Button>
              </Card>
              {admin && <BackupsPanel />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
function BackupsPanel() {
  const { tr } = useSettingsTranslation();
  const [files, setFiles] = useState<
    { name: string; bytes: number; createdAt: string }[]
  >([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = () =>
    apiClient
      .get("/settings/backups")
      .then((r) => setFiles(r.data))
      .catch((e) => setError(apiErrorMessage(e)));
  useEffect(() => {
    void refresh();
  }, []);
  return (
    <Card className="p-5 space-y-3">
      <h2 className="font-semibold">{tr("Database backups")}</h2>
      <p className="text-sm text-muted-foreground">
        {tr(
          "Stored securely on the backend server. Uploaded files are separate.",
        )}
      </p>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {tr(error)}
        </p>
      )}
      <Button
        permission="settings.backups.create"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            await apiClient.post("/settings/backups", {}, { timeout: 300000 });
            await refresh();
          } catch (e) {
            setError(apiErrorMessage(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        <RefreshCw className={busy ? "size-4 animate-spin" : "size-4"} />
        {tr(busy ? "Creating backup…" : "Back up database now")}
      </Button>
      {files.length === 0 ? (
        <p className="text-sm text-muted-foreground">{tr("No backups yet.")}</p>
      ) : (
        files.map((f) => (
          <div key={f.name} className="flex justify-between gap-3 text-xs">
            <span className="break-all">{f.name}</span>
            <span>
              {(f.bytes / 1024 / 1024).toFixed(2)} {tr("MB")}
            </span>
          </div>
        ))
      )}
    </Card>
  );
}
