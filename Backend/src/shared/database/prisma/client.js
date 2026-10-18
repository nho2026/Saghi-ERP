import { PrismaClient } from "@prisma/client";

export const prisma = globalThis.__nhoPrisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.__nhoPrisma = prisma;
