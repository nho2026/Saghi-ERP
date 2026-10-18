import { z } from "zod";

const fieldType = z.enum([
  "text",
  "textarea",
  "number",
  "date",
  "select",
  "checkbox",
]);

export const formFieldSchema = z.object({
  id: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(191),
  type: fieldType,
  required: z.boolean().default(false),
  options: z.array(z.string().trim().min(1)).max(50).optional(),
});

export const formTemplateSchema = z.object({
  code: z.string().optional(),
  name: z.string().trim().min(2).max(191),
  description: z.string().trim().nullable().optional(),
  category: z.enum(["clinical", "examination", "assessment", "consent"]),
  fields: z.array(formFieldSchema).min(1).max(100),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const formSubmissionSchema = z.object({
  formTemplateId: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
});
