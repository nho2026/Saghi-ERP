import { z } from "zod";

const booleanFilter = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const patientFilterSchema = z.object({
  search: z.string().trim().max(191).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  bloodType: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .optional(),
  status: z
    .enum([
      "new",
      "contacted",
      "qualified",
      "appointment_requested",
      "surgery_appointment",
      "converted",
      "direct_surgery_converted",
      "active",
      "inactive",
      "post_discharge_follow_up",
      "post_discharge_follow_up_completed",
    ])
    .optional(),
  followUp: booleanFilter.optional(),
  isMarried: booleanFilter.optional(),
  hasDiabetes: booleanFilter.optional(),
  hasHypertension: booleanFilter.optional(),
});
