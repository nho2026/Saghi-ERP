import { z } from "zod";

const optional = (schema) =>
  z.preprocess(
    (value) => (value === "" ? undefined : value),
    schema.optional(),
  );
export const saleAmountFields = [
  "subtotal",
  "discountAmount",
  "taxAmount",
  "totalAmount",
  "paidAmount",
  "changeAmount",
];
export const posFilterShape = {
  ...Object.fromEntries(
    [
      "saleNumber",
      "warehouseId",
      "cashierName",
      "customerName",
      "notes",
      "product",
    ].map((key) => [key, optional(z.string().trim().max(200))]),
  ),
  paymentMethod: optional(z.enum(["cash", "card", "bank_transfer"])),
  status: optional(z.enum(["completed", "cancelled"])),
  fromDate: optional(z.iso.date()),
  toDate: optional(z.iso.date()),
  ...Object.fromEntries(
    saleAmountFields.flatMap((field) =>
      ["min", "max"].map((bound) => [
        `${bound}_${field}`,
        optional(z.coerce.number().finite().min(0)),
      ]),
    ),
  ),
};
export function validateSaleRanges(input, ctx) {
  if (input.fromDate && input.toDate && input.fromDate > input.toDate)
    ctx.addIssue({
      code: "custom",
      path: ["toDate"],
      message: "From date must be on or before to date.",
    });
  for (const field of saleAmountFields) {
    if (
      input[`min_${field}`] !== undefined &&
      input[`max_${field}`] !== undefined &&
      input[`min_${field}`] > input[`max_${field}`]
    )
      ctx.addIssue({
        code: "custom",
        path: [`max_${field}`],
        message: "Minimum amount must not exceed maximum amount.",
      });
  }
}
export function saleFiltersWhere(input) {
  const where = {};
  for (const field of ["saleNumber", "cashierName", "customerName", "notes"]) {
    if (input[field]) where[field] = { contains: input[field] };
  }
  for (const field of ["warehouseId", "paymentMethod", "status"]) {
    if (input[field]) where[field] = input[field];
  }
  if (input.product)
    where.items = {
      some: {
        product: {
          OR: ["name", "sku", "barcode"].map((field) => ({
            [field]: { contains: input.product },
          })),
        },
      },
    };
  if (input.fromDate || input.toDate) {
    where.soldAt = {};
    if (input.fromDate)
      where.soldAt.gte = new Date(`${input.fromDate}T00:00:00.000Z`);
    if (input.toDate) {
      const end = new Date(`${input.toDate}T00:00:00.000Z`);
      end.setUTCDate(end.getUTCDate() + 1);
      where.soldAt.lt = end;
    }
  }
  for (const field of saleAmountFields) {
    const min = input[`min_${field}`],
      max = input[`max_${field}`];
    if (min !== undefined || max !== undefined)
      where[field] = {
        ...(min !== undefined && { gte: min }),
        ...(max !== undefined && { lte: max }),
      };
  }
  return where;
}
