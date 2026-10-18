import { z } from "zod";

const optional = (schema) =>
  z.preprocess(
    (value) => (value === "" ? undefined : value),
    schema.optional(),
  );
const schema = z
  .object({
    invoiceNumber: optional(z.string().trim().max(100)),
    salesperson: optional(z.string().trim().max(150)),
    fromDate: optional(z.iso.date()),
    toDate: optional(z.iso.date()),
    minTotal: optional(z.coerce.number().finite().min(0)),
    maxTotal: optional(z.coerce.number().finite().min(0)),
    isDebt: optional(z.enum(["true", "false"])),
    purchaseStatus: optional(z.enum(["completed", "returned"])),
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
      input.minTotal === undefined ||
      input.maxTotal === undefined ||
      input.minTotal <= input.maxTotal,
    {
      message: "Minimum total must not exceed maximum total.",
      path: ["maxTotal"],
    },
  );

export function purchaseFiltersWhere(query) {
  const input = schema.parse(query);
  const where = {};
  if (input.invoiceNumber)
    where.invoiceNumber = { contains: input.invoiceNumber };
  if (input.salesperson) where.salesperson = { contains: input.salesperson };
  if (input.isDebt !== undefined) where.isDebt = input.isDebt === "true";
  if (input.purchaseStatus) where.status = input.purchaseStatus;
  if (input.fromDate || input.toDate) {
    where.buyDate = {};
    if (input.fromDate)
      where.buyDate.gte = new Date(`${input.fromDate}T00:00:00.000Z`);
    if (input.toDate) {
      const nextDay = new Date(`${input.toDate}T00:00:00.000Z`);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      where.buyDate.lt = nextDay;
    }
  }
  if (input.minTotal !== undefined || input.maxTotal !== undefined) {
    where.totalPrice = {
      ...(input.minTotal !== undefined && { gte: input.minTotal }),
      ...(input.maxTotal !== undefined && { lte: input.maxTotal }),
    };
  }
  return where;
}
