import { effectivePermissions } from "../../../shared/security/access-policy.js";

export async function notifyDepartmentOrder(tx, order, reminderId = null) {
  const users = await tx.user.findMany({
    where: { status: "active" },
    include: {
      roles: {
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
        },
      },
    },
  });
  const recipients = users.filter((user) => {
    if (user.status !== "active") return false;
    if (user.roles.some(({ role }) => role.name === "Super Administrator"))
      return true;
    const permissions = effectivePermissions(
      user.roles.flatMap(({ role }) =>
        role.permissions.map(({ permission }) => permission.key),
      ),
    );
    return (
      permissions.has("*") ||
      permissions.has("inventory.department-orders.view")
    );
  });
  if (!recipients.length) return;
  await tx.notification.createMany({
    data: recipients.map(({ id }) => ({
      userId: id,
      reminderKey: `department-order:${order.id}:${reminderId ? `${reminderId}:` : ""}${id}`,
      type: "department_order_requested",
      title: reminderId ? "Request order reminder" : "New request order",
      body: `${order.departmentName} requested ${order.items.length} product line(s). Awaiting warehouse review.`,
      route: `/warehouses/buy/department-orders?search=${encodeURIComponent(order.id)}`,
    })),
    skipDuplicates: true,
  });
}
