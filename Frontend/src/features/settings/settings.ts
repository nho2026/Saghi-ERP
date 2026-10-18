import { apiClient } from "@/shared/api/client";
import i18n from "@/i18n";
import defaultLogo from "@/assets/icons/logo.png";
import { store } from "@/app/store";
import { useAppSelector } from "@/app/store/hooks";
import { settingsLoaded } from "./store/settings.slice";
export type Settings = {
  meetings: {
    videoQuality: string;
    maxVideoQuality: string;
    audioQuality: string;
    echoCancellation: boolean;
    noiseSuppression: boolean;
    screenSharing: boolean;
    screenQuality: string;
    participantLimit: number;
    cameraDefault: boolean;
    microphoneDefault: boolean;
  };
  organization: {
    name: string;
    loadingText: string;
    logo: string;
    branches: string[];
    email: string;
    phone: string;
    address: string;
  };
  hr: {
    startTime: string;
    endTime: string;
    weekends: number[];
    graceMinutes: number;
    penaltyMultiplier: number;
    targetMinutes: number;
  };
  healthcare: {
    appointmentMinutes: number;
    bookingStart: string;
    bookingEnd: string;
    bookingDays: number[];
    operatingRooms: string[];
  };
  finance: {
    currency: string;
    paymentMethods: string[];
    invoicePrefix: string;
    invoiceNextNumber: number;
  };
  notifications: {
    meetingReminders: boolean;
    appointmentReminders: boolean;
    reminderMinutes: number;
    taskAlerts: boolean;
    desktopAlerts: boolean;
  };
  security: {
    sessionHours: number;
    rememberDays: number;
    passwordForDeletion: boolean;
  };
  system: {
    language: string;
    timezone: string;
    dateFormat: string;
    backupEnabled: boolean;
    backupIntervalHours: number;
    backupRetentionDays: number;
  };
};
export const settingsSnapshot = () => store.getState().settings;
export async function loadSettings() {
  const response = await apiClient.get<Settings>("/settings/runtime");
  const current = response.data;
  store.dispatch(settingsLoaded(current));
  const branding = current.organization;
  document.title = branding.name;
  for (const icon of document.querySelectorAll<HTMLLinkElement>(
    'link[rel="icon"], link[rel="apple-touch-icon"]',
  ))
    icon.href = branding.logo || defaultLogo;
  try {
    localStorage.setItem(
      "nho-branding",
      JSON.stringify({
        name: branding.name,
        logo: branding.logo,
        loadingText: branding.loadingText || "",
      }),
    );
  } catch {
    /* Branding remains applied when browser storage is unavailable. */
  }
  if (!localStorage.getItem("nho-language"))
    void i18n.changeLanguage(current.system.language);
  return current;
}
export function useSettings() {
  return useAppSelector((state) => state.settings);
}
export function formatSystemDate(value: string | Date) {
  const system = settingsSnapshot()?.system;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: system?.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (key: string) => parts.find((p) => p.type === key)?.value;
  if (system?.dateFormat === "dd/MM/yyyy")
    return `${part("day")}/${part("month")}/${part("year")}`;
  if (system?.dateFormat === "MM/dd/yyyy")
    return `${part("month")}/${part("day")}/${part("year")}`;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
