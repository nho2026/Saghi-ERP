import { z } from "zod";
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm time.");
const names = z
  .array(z.string().trim().min(1).max(191))
  .max(100)
  .refine(
    (a) => new Set(a.map((x) => x.toLowerCase())).size === a.length,
    "Remove duplicate entries.",
  );
const quality = z.enum(["auto", "360p", "720p", "1080p", "audio_only"]);
export const defaults = {
  meetings: {
    videoQuality: "auto",
    maxVideoQuality: "1080p",
    audioQuality: "standard",
    echoCancellation: true,
    noiseSuppression: true,
    screenSharing: true,
    screenQuality: "documents",
    participantLimit: 12,
    cameraDefault: false,
    microphoneDefault: false,
  },
  organization: {
    name: "",
    loadingText: "",
    logo: "",
    branches: [],
    email: "",
    phone: "",
    address: "",
  },
  hr: {
    startTime: "09:00",
    endTime: "17:00",
    weekends: [5, 6],
    graceMinutes: 0,
    penaltyMultiplier: 1,
    targetMinutes: 480,
  },
  healthcare: {
    appointmentMinutes: 30,
    bookingStart: "09:00",
    bookingEnd: "17:00",
    bookingDays: [0, 1, 2, 3, 4],
    operatingRooms: [],
  },
  finance: {
    currency: "USD",
    paymentMethods: ["cash", "card", "bank_transfer", "cheque", "other"],
    invoicePrefix: "INV",
    invoiceNextNumber: 1,
  },
  notifications: {
    meetingReminders: true,
    appointmentReminders: true,
    reminderMinutes: 30,
    taskAlerts: true,
    desktopAlerts: true,
  },
  security: { sessionHours: 8, rememberDays: 30, passwordForDeletion: true },
  system: {
    language: "en",
    timezone: "Asia/Baghdad",
    dateFormat: "yyyy-MM-dd",
    backupEnabled: false,
    backupIntervalHours: 24,
    backupRetentionDays: 14,
  },
};
const days = z
  .array(z.number().int().min(0).max(6))
  .max(7)
  .refine((a) => new Set(a).size === a.length);
export const schemas = {
  meetings: z.object({
    videoQuality: quality,
    maxVideoQuality: z.enum(["360p", "720p", "1080p"]),
    audioQuality: z.enum(["low", "standard", "high"]),
    echoCancellation: z.boolean(),
    noiseSuppression: z.boolean(),
    screenSharing: z.boolean(),
    screenQuality: z.enum(["documents", "video"]),
    participantLimit: z.number().int().min(2).max(50),
    cameraDefault: z.boolean(),
    microphoneDefault: z.boolean(),
  }),
  organization: z.object({
    name: z.string().trim().min(1).max(120),
    loadingText: z.string().trim().max(160).default(""),
    logo: z
      .string()
      .max(2_000_000)
      .refine(
        (v) =>
          !v ||
          /^https:\/\//.test(v) ||
          /^data:image\/(png|jpeg|webp);base64,/.test(v),
        "Use an HTTPS image URL or upload a PNG, JPEG or WebP image.",
      ),
    branches: names,
    email: z.union([z.email(), z.literal("")]),
    phone: z.string().max(60),
    address: z.string().max(1000),
  }),
  hr: z.object({
    startTime: time,
    endTime: time,
    weekends: days,
    graceMinutes: z.number().int().min(0).max(120),
    penaltyMultiplier: z.number().min(0).max(10),
    targetMinutes: z.number().int().min(1).max(1440),
  }),
  healthcare: z
    .object({
      appointmentMinutes: z.number().int().min(10).max(480),
      bookingStart: time,
      bookingEnd: time,
      bookingDays: days.min(1),
      operatingRooms: names,
    })
    .refine(
      (v) => v.bookingEnd > v.bookingStart,
      "Booking end must be after booking start.",
    ),
  finance: z.object({
    currency: z.literal("USD"),
    paymentMethods: z
      .array(z.enum(["cash", "card", "bank_transfer", "cheque", "other"]))
      .min(1),
    invoicePrefix: z.string().regex(/^[A-Za-z0-9-]{1,20}$/),
    invoiceNextNumber: z.number().int().min(1).max(999999999),
  }),
  notifications: z.object({
    meetingReminders: z.boolean(),
    appointmentReminders: z.boolean(),
    reminderMinutes: z.number().int().min(5).max(1440),
    taskAlerts: z.boolean(),
    desktopAlerts: z.boolean(),
  }),
  security: z.object({
    sessionHours: z.number().int().min(1).max(168),
    rememberDays: z.number().int().min(1).max(90),
    passwordForDeletion: z.boolean(),
  }),
  system: z.object({
    language: z.enum(["en", "ar", "ku"]),
    timezone: z.string().refine((v) => {
      try {
        new Intl.DateTimeFormat("en", { timeZone: v });
        return true;
      } catch {
        return false;
      }
    }, "Enter a valid timezone."),
    dateFormat: z.enum(["yyyy-MM-dd", "dd/MM/yyyy", "MM/dd/yyyy"]),
    backupEnabled: z.boolean(),
    backupIntervalHours: z.number().int().min(1).max(168),
    backupRetentionDays: z.number().int().min(1).max(365),
  }),
};
