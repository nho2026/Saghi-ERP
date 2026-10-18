import { z } from "zod";

const leadStatus = z.enum([
  "new",
  "contacted",
  "qualified",
  "converted",
  "appointment_requested",
  "surgery_appointment",
  "direct_surgery_converted",
  "lost",
]);
const optionalQueryEnum = (schema) =>
  z.preprocess(
    (value) => (value === "" ? undefined : value),
    schema.optional(),
  );

export const leadSchema = z.object({
  code: z.string().trim().min(1).max(50).optional(),
  name: z.string().trim().min(2).max(191),
  phone: z.string().trim().min(5).max(50),
  secondaryPhone: z.string().trim().max(50).nullable().optional(),
  source: z.string().trim().min(2).max(100),
  age: z.coerce.number().int().min(0).max(150).nullable().optional(),
  dateOfBirth: z.coerce.date().nullable().optional(),
  gender: z.enum(["male", "female", "other"]).nullable().optional(),
  maritalStatus: z
    .enum(["single", "married", "divorced", "widowed"])
    .nullable()
    .optional(),
  preferredLanguage: z.string().trim().max(50).nullable().optional(),
  address: z.string().trim().max(500).nullable().optional(),
  country: z.string().trim().max(100).nullable().optional(),
  city: z.string().trim().max(100).nullable().optional(),
  email: z.string().trim().email().nullable().optional(),
  leadSourceChannel: z.enum(["digital", "traditional"]).nullable().optional(),
  contactMethod: z
    .enum(["phone", "whatsapp", "social_media", "walk_in", "email"])
    .nullable()
    .optional(),
  patientType: z
    .enum(["medical", "non_cardiac", "surgical"])
    .nullable()
    .optional(),
  referralPersona: z
    .enum(["doctor", "our_patient", "people"])
    .nullable()
    .optional(),
  referralName: z.string().trim().max(191).nullable().optional(),
  referralPhone: z.string().trim().max(50).nullable().optional(),
  referralAddress: z.string().trim().max(500).nullable().optional(),
  referralNote: z.string().trim().nullable().optional(),
  interest: z.string().trim().nullable().optional(),
  competitorsNote: z.string().trim().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
  satisfactionScore: z.coerce
    .number()
    .int()
    .min(0)
    .max(100)
    .nullable()
    .optional(),
  knowledgeRating: z.coerce.number().int().min(1).max(5).nullable().optional(),
  budgetRange: z.string().trim().max(100).nullable().optional(),
  decisionInfluencers: z.string().trim().nullable().optional(),
  painPoints: z.string().trim().nullable().optional(),
  status: leadStatus.default("new"),
});

export const leadUpdateSchema = leadSchema.partial().extend({
  status: leadStatus.optional(),
});

export const leadFilterSchema = z
  .object({
    search: z.string().trim().max(191).optional(),
    source: z.string().trim().max(100).optional(),
    gender: optionalQueryEnum(z.enum(["male", "female", "other"])),
    status: optionalQueryEnum(leadStatus),
    minAge: optionalQueryEnum(z.coerce.number().int().min(0).max(150)),
    maxAge: optionalQueryEnum(z.coerce.number().int().min(0).max(150)),
    fromDate: optionalQueryEnum(z.iso.date()),
    toDate: optionalQueryEnum(z.iso.date()),
    dateField: optionalQueryEnum(z.enum(["createdAt", "updatedAt"])),
    city: z.string().trim().max(100).optional(),
    country: z.string().trim().max(100).optional(),
    contactMethod: optionalQueryEnum(
      leadSchema.shape.contactMethod.unwrap().unwrap(),
    ),
    leadSourceChannel: optionalQueryEnum(
      leadSchema.shape.leadSourceChannel.unwrap().unwrap(),
    ),
    patientType: optionalQueryEnum(
      leadSchema.shape.patientType.unwrap().unwrap(),
    ),
    referralPersona: optionalQueryEnum(
      leadSchema.shape.referralPersona.unwrap().unwrap(),
    ),
  })
  .refine(
    (input) =>
      !input.fromDate || !input.toDate || input.fromDate <= input.toDate,
    {
      message: "From date must be on or before to date.",
      path: ["toDate"],
    },
  )
  .refine(
    (input) =>
      input.minAge === undefined ||
      input.maxAge === undefined ||
      input.minAge <= input.maxAge,
    {
      message: "Minimum age cannot exceed maximum age.",
      path: ["maxAge"],
    },
  );
