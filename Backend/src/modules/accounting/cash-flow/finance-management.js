import { z } from "zod";
import { prisma } from "../../../shared/database/client.js";
import { audit } from "./finance-sync.js";
const fail = (message, status = 409) => {
  throw Object.assign(new Error(message), { status });
};
export const cashAccountSchema = z.object({
  name: z.string().trim().min(2).max(191),
  type: z.enum(["safe", "bank"]),
  currency: z.enum(["USD"]),
  openingBalance: z.coerce
    .number()
    .finite()
    .min(-999999999999.99)
    .max(999999999999.99)
    .multipleOf(0.01),
  openingDate: z.coerce.date(),
});
export async function checkAssignment(tx, data) {
  if (
    data.departmentId &&
    !(await tx.department.findUnique({ where: { id: data.departmentId } }))
  )
    fail("Select an existing department.", 422);
  if (data.cashAccountId) {
    const account = await tx.financeCashAccount.findUniqueOrThrow({
      where: { id: data.cashAccountId },
    });
    if (account.currency !== data.currency)
      fail("The cash account and transaction currencies must match.", 422);
    if (new Date(data.flowDate) < account.openingDate)
      fail("This transaction predates the cash account opening balance.", 422);
  }
}
export async function mutateFlow(action, id, input, userId, db = prisma) {
  return db.$transaction(async (tx) => {
    if (id)
      await tx.$queryRaw`SELECT id FROM finance_FinanceCashFlow WHERE id = ${id} FOR UPDATE`;
    const old = id
      ? await tx.financeCashFlow.findUniqueOrThrow({ where: { id } })
      : null;
    if (old?.sourceType) {
      if (
        action !== "update" ||
        Object.keys(input).some(
          (key) => !["departmentId", "category", "cashAccountId"].includes(key),
        )
      )
        fail(
          "Amounts and status are controlled by the source record. Only classification and cash account can be changed.",
        );
    }
    if (action === "approve") {
      if (old.status !== "pending")
        fail("Only pending expenses can be approved.");
      if (old.createdBy === userId)
        fail("Another approver must approve this expense.", 403);
      input = {
        status: "confirmed",
        approvedBy: userId,
        approvedAt: new Date(),
      };
    } else if (action === "cancel") {
      if (old.status === "cancelled") return old;
      input = { status: "cancelled" };
    } else if (
      !old?.sourceType &&
      (input.flowType ?? old?.flowType) === "outflow" &&
      (input.status ?? old?.status ?? "confirmed") === "confirmed"
    ) {
      input = {
        ...input,
        status: "pending",
        approvedBy: null,
        approvedAt: null,
      };
    }
    const combined = { ...old, ...input };
    await checkAssignment(tx, combined);
    const row = old
      ? await tx.financeCashFlow.update({ where: { id }, data: input })
      : await tx.financeCashFlow.create({
          data: { ...input, createdBy: userId },
        });
    await audit(tx, row.id, action, userId, old, row);
    return row;
  });
}
