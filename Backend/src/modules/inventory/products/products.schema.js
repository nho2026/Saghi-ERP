import { z } from "zod";
export const optionalId = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().nullable().optional(),
);
export const optionalText = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().trim().nullable().optional(),
);
const productExpiry = z.preprocess(
  (value) =>
    value === "" || value === null
      ? null
      : value instanceof Date
        ? value.toISOString().slice(0, 10)
        : typeof value === "string"
          ? value.replace(/T00:00:00\.000Z$/, "")
          : value,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    }, "Enter a valid calendar date.")
    .transform((value) => new Date(`${value}T00:00:00.000Z`))
    .nullable()
    .optional(),
);
const optionalPositive = z.preprocess(
  (value) => (value === "" ? null : value),
  z.coerce.number().finite().positive().nullable().optional(),
);
export const productSchema = z.object({
  doseMgKgDay: optionalPositive,
  dosesPerDay: z.preprocess(
    (value) => (value === "" ? null : value),
    z.coerce.number().int().positive().max(24).nullable().optional(),
  ),
  concentrationMg: optionalPositive,
  concentrationMl: optionalPositive,

  expiryDate: productExpiry,
  sku: z.string().trim().min(1),
  barcode: optionalText,
  name: z.string().trim().min(2),
  categoryId: optionalId,
  brandId: optionalId,
  unit: z.string().trim().min(1).default("item"),
  costPrice: z.coerce.number().min(0),
  sellingPrice: z.coerce.number().min(0),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  discountType: z.preprocess(
    (value) => (value === "" ? null : value),
    z.enum(["percentage", "fixed"]).nullable().optional(),
  ),
  discountValue: z.coerce.number().min(0).default(0),
  discountStart: z.preprocess(
    (value) => (value === "" || value == null ? null : value),
    z.coerce.date().nullable().optional(),
  ),
  discountEnd: z.preprocess(
    (value) => (value === "" || value == null ? null : value),
    z.coerce.date().nullable().optional(),
  ),
  status: z.enum(["active", "inactive"]).default("active"),
  images: z
    .array(
      z.object({
        imageUrl: z.string().startsWith("/public/product-images/"),
        isMain: z.boolean().default(false),
      }),
    )
    .max(8)
    .optional(),
});
export const barcodeAssignmentSchema = z.object({
  barcode: z.string().regex(/^\d{13}$/, "A 13-digit barcode is required."),
});

export const specialProductSchema = z
  .object({
    doseMgKgDay: productSchema.shape.doseMgKgDay,
    dosesPerDay: productSchema.shape.dosesPerDay,
    concentrationMg: productSchema.shape.concentrationMg,
    concentrationMl: productSchema.shape.concentrationMl,

    name: z.string().trim().min(2).max(191),
    categoryId: z.string().min(1),
    size: z.string().trim().max(100).default(""),
    boxPrice: z.number().finite().min(0).max(100000000),
    specialProfitRate: z.number().finite().min(0).max(100),
    specialPrice: z.number().finite().min(0).max(100000000),
    productType: z.enum(["patient_use", "staff_use"]),
    variants: z
      .array(
        z.object({
          code: z.string().trim().min(1).max(100),
          barcode: z.string().trim().max(100).default(""),
          productionCompany: z.string().trim().max(191).default(""),
        }),
      )
      .min(1)
      .max(50),
  })
  .refine(
    (data) =>
      new Set(data.variants.map((v) => v.code.toLowerCase())).size ===
      data.variants.length,
    "Each product code must be unique.",
  );

export const specialPriceSchema = z
  .object({
    specialPrice: z
      .number()
      .finite()
      .min(0)
      .max(100000000)
      .refine(
        (value) => Math.abs(value * 100 - Math.round(value * 100)) < 0.000001,
        "Use at most two decimal places.",
      ),
  })
  .strict();

export const expiryDateSchema = z
  .object({
    expiryDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine((value) => {
        const date = new Date(`${value}T00:00:00.000Z`);
        return (
          !Number.isNaN(date.getTime()) &&
          date.toISOString().slice(0, 10) === value
        );
      }, "Enter a valid calendar date.")
      .nullable(),
  })
  .strict();
