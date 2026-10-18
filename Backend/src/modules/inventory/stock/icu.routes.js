import { listIcuCases } from "./icu-list.js";
import { paginate } from "../../../shared/database/paginate.js";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../../shared/database/client.js";
import { inventoryAction as action } from "../shared/inventory.controller.js";
import { manage } from "../shared/inventory.permissions.js";
import { requirePermission } from "../../../shared/middleware/permission.middleware.js";
const router = Router();
const amount = z.number().finite().min(0).max(100000000);
const schema = z
  .object({
    patientId: z.string().trim().min(1).max(191),
    entry: z.coerce.date(),
    exit: z.coerce.date().nullable(),
    items: z
      .array(
        z.object({
          name: z.string().trim().min(1).max(191),
          category: z.string().trim().max(191),
          part: z.enum(["scrubNurse", "anesthesia", "perfusion"]).optional(),
          quantity: z.number().finite().positive().max(1000000),
          price: amount,
          cost: amount,
        }),
      )
      .max(500),
  })
  .refine((v) => !v.exit || v.exit >= v.entry, {
    message: "Exit cannot precede entry.",
    path: ["exit"],
  });
router.get(
  "/icu-cases/patients",
  requirePermission("inventory.icu.view"),
  action(({ query }) =>
    paginate(
      "patient",
      query,
      {
        select: {
          id: true,
          patientCode: true,
          firstName: true,
          lastName: true,
        },
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      },
      ["firstName", "lastName", "patientCode", "phone"],
    ),
  ),
);
async function caseData(body) {
  const input = schema.parse(body);
  const patient = await prisma.patient.findUnique({
    where: { id: input.patientId },
    select: { firstName: true, lastName: true },
  });
  if (!patient)
    throw Object.assign(new Error("Select an existing patient."), {
      status: 400,
    });
  return {
    ...input,
    patientName: [patient.firstName, patient.lastName]
      .filter(Boolean)
      .join(" "),
  };
}
router.get(
  "/surgery-bypass",
  requirePermission("inventory.view"),
  action(({ query }) =>
    paginate(
      "inventoryIcuCase",
      query,
      {
        where: { unit: "cardiac-surgery" },
        select: {
          id: true,
          patientName: true,
          entry: true,
          exit: true,
          isBypass: true,
        },
        orderBy: [{ entry: "desc" }, { id: "desc" }],
      },
      ["patientName"],
    ),
  ),
);
router.patch(
  "/surgery-bypass/:id",
  manage,
  action(({ id, body }) =>
    prisma.inventoryIcuCase.update({
      where: { id, unit: "cardiac-surgery" },
      data: z.object({ isBypass: z.boolean() }).parse(body),
    }),
  ),
);
for (const unit of [
  "icu",
  "picu",
  "cardiac-sw",
  "cardiac-surgery",
  "cardiology",
]) {
  const path = `/${unit}-cases`;
  const caseView =
    unit === "icu"
      ? requirePermission("inventory.icu.view")
      : requirePermission("inventory.view");
  const caseCreate =
    unit === "icu" ? requirePermission("inventory.icu.create") : manage;
  const caseUpdate =
    unit === "icu" ? requirePermission("inventory.icu.update") : manage;
  router.get(
    path,
    caseView,
    action(({ query }) => listIcuCases(unit, query)),
  );
  router.post(
    path,
    caseCreate,
    action(
      async ({ body }) =>
        prisma.inventoryIcuCase.create({
          data: { ...(await caseData(body)), unit },
        }),
      201,
    ),
  );
  router.patch(
    `${path}/:id`,
    caseUpdate,
    action(async ({ body, id }) =>
      prisma.inventoryIcuCase.update({
        where: { id, unit },
        data: await caseData(body),
      }),
    ),
  );
  // ICU case records are part of the patient's permanent clinical history.
}
export default router;
