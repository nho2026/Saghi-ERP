import { z } from "zod";
const name = z.string().trim().min(1).max(191);
export const directoryDefinitions = [
  {
    path: "production-companies",
    model: "inventoryProductionCompany",
    fields: ["name", "country"],
    schema: z.object({ name, country: z.string().trim().min(1).max(191) }),
  },
  {
    path: "customers",
    model: "inventoryCustomer",
    fields: ["name", "phone", "email", "address"],
    schema: z.object({
      name,
      phone: z.string().trim().max(50).default(""),
      email: z.union([z.email().max(191), z.literal("")]).default(""),
      address: z.string().trim().max(500).default(""),
      note: z.string().trim().max(5000).default(""),
      debtThreshold: z.coerce
        .number()
        .finite()
        .min(0)
        .max(999999999999.99)
        .multipleOf(0.01),
    }),
  },
];
