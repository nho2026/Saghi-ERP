import { z } from "zod";
const optionalDate = z.preprocess(
  (v) => (v === "" || v === null ? null : v),
  z.coerce.date().nullable().optional(),
);
export const taskSchema = z
  .object({
    title: z.string().trim().min(2).max(200),
    projectId: z.string().min(1).optional(),
    description: z.string().trim().min(2).max(10000),
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
    status: z
      .enum([
        "todo",
        "in_progress",
        "incomplete",
        "review",
        "completed",
        "rejected",
      ])
      .default("todo"),
    startDate: optionalDate,
    dueDate: optionalDate,
    estimatedMinutes: z.coerce.number().int().min(0).nullable().optional(),
    assigneeIds: z.array(z.string()).min(1),
    attachments: z
      .array(
        z.object({
          fileName: z.string(),
          fileUrl: z.string().startsWith("/public/task-attachments/"),
          mimeType: z.string(),
          fileSize: z.coerce.number().int().nonnegative(),
        }),
      )
      .max(10)
      .default([]),
  })
  .refine((v) => !v.startDate || !v.dueDate || v.dueDate >= v.startDate, {
    message: "Due date must be on or after the start date.",
    path: ["dueDate"],
  });
export const updateTaskSchema = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().min(2).max(10000).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  status: z
    .enum([
      "todo",
      "in_progress",
      "incomplete",
      "review",
      "completed",
      "rejected",
    ])
    .optional(),
  startDate: optionalDate,
  dueDate: optionalDate,
  estimatedMinutes: z.coerce.number().int().min(0).nullable().optional(),
  assigneeIds: z.array(z.string()).min(1).optional(),
  reviewNote: z.string().trim().max(5000).nullable().optional(),
  adjustment: z
    .object({
      employeeId: z.string().min(1),
      type: z.enum(["reward", "punishment"]),
      amount: z.coerce.number().positive(),
      reason: z.string().trim().min(2).max(5000),
    })
    .nullable()
    .optional(),
});
export const projectSchema = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(5000).optional(),
  departmentId: z.string().min(1),
});
export const commentSchema = z.object({
  body: z.string().trim().min(1).max(5000),
});
export const timeEntrySchema = z.object({
  employeeId: z.string(),
  workDate: z.coerce.date(),
  minutes: z.coerce.number().int().min(1).max(1440),
  note: z.string().trim().max(2000).nullable().optional(),
});
export const monthlyReportSchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
});
