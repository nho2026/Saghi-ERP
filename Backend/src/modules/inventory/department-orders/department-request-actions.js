import { randomUUID } from "node:crypto";
import { notifyDepartmentOrder } from "./department-order-notifications.js";

export function actOnDepartmentRequest(db, id, departmentId, action) {
  return db.$transaction(async (tx) => {
    const order = await tx.inventoryDepartmentOrder.findFirst({
      where: { id, departmentId },
    });
    if (!order)
      throw Object.assign(new Error("Order not found."), { status: 404 });
    if (order.status !== "pending")
      throw Object.assign(
        new Error("Only pending orders can be cancelled or reminded."),
        { status: 409 },
      );
    const status = action === "cancel" ? "cancelled" : "pending";
    const changed = await tx.inventoryDepartmentOrder.updateMany({
      where: { id, departmentId, status: "pending" },
      data: { status },
    });
    if (changed.count !== 1)
      throw Object.assign(
        new Error("Order has changed. Refresh and try again."),
        { status: 409 },
      );
    if (action === "remind")
      await notifyDepartmentOrder(tx, order, randomUUID());
    return { ...order, status };
  });
}
