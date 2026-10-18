import { z } from "zod";

export const createTargetSchema = z
  .object({
    title: z.string().trim().min(2).max(160),
    description: z.string().trim().max(5000).nullable().optional(),
    metric: z.string().trim().min(1).max(100),
    unit: z.string().trim().min(1).max(30),
    targetValue: z.coerce.number().positive(),
    currentValue: z.coerce.number().min(0).default(0),
    startDate: z.coerce.date(),
    dueDate: z.coerce.date(),
    employeeId: z.string().min(1),
  })
  .refine(({ startDate, dueDate }) => dueDate >= startDate, {
    message: "Due date must be on or after the start date.",
    path: ["dueDate"],
  });

export const updateTargetSchema = z
  .object({
    currentValue: z.coerce.number().min(0).optional(),
    status: z.enum(["active", "completed", "paused", "cancelled"]).optional(),
    rewardAmount: z.coerce.number().positive().optional(),
    rewardReason: z.string().trim().min(2).max(5000).optional(),
  })
  .refine(
    (data) => (data.rewardAmount == null) === (data.rewardReason == null),
    {
      message: "Reward amount and reason are required together.",
    },
  );
