import { z } from "zod";

const permissionFields = z.object({
  employeeId: z.string().min(1),
  permissionType: z.enum(["full_day", "hours"]),
  fromDate: z.coerce.date(),
  toDate: z.coerce.date(),
  permittedMinutes: z.coerce
    .number()
    .int()
    .positive()
    .max(1440)
    .nullable()
    .optional(),
  reason: z.string().trim().max(1000).nullable().optional(),
  status: z.enum(["approved", "cancelled"]).default("approved"),
});
const validatePermission = (data, context) => {
  if (data.toDate < data.fromDate)
    context.addIssue({
      code: "custom",
      path: ["toDate"],
      message: "End date must be on or after start date.",
    });
  if (data.permissionType === "hours" && !data.permittedMinutes)
    context.addIssue({
      code: "custom",
      path: ["permittedMinutes"],
      message: "Permitted hours are required.",
    });
};
export const attendancePermissionSchema =
  permissionFields.superRefine(validatePermission);
export const attendancePermissionUpdateSchema = permissionFields.partial();
