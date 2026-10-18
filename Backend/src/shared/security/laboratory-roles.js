const pages = (...names) =>
  names.map((name) => `laboratory.pages.${name}.view`);
export const laboratoryRoles = [
  {
    name: "Laboratory Reception",
    description:
      "Laboratory dashboard, reception requests and display management",
    permissions: [
      ...pages("dashboard", "reception", "tickets", "display"),
      "laboratory.orders.view",
      "laboratory.orders.create",
      "laboratory.orders.print",
      "laboratory.display.view",
      "laboratory.display.call",
    ],
  },
  {
    name: "Laboratory Accountant",
    description: "Laboratory dashboard, accounting and ticket management",
    permissions: [
      ...pages("dashboard", "accounting", "tickets", "display"),
      "laboratory.orders.view",
      "laboratory.orders.print",
      "laboratory.payments.view",
      "laboratory.payments.create",
      "laboratory.display.view",
      "laboratory.display.call",
    ],
  },
  {
    name: "Laboratory Technician",
    description:
      "Laboratory dashboard, queue, examination room, results and test catalog",
    permissions: [
      ...pages("dashboard", "queue", "room", "completed", "received", "tests"),
      "laboratory.orders.view",
      "laboratory.orders.update",
      "laboratory.orders.print",
      "laboratory.tests.view",
      "laboratory.tests.create",
      "laboratory.tests.update",
      "laboratory.tests.delete",
    ],
  },
];

// Create missing defaults only; preserve administrator-customized roles on reruns.
export async function seedLaboratoryRoles(db) {
  return db.$transaction(async (tx) => {
    for (const { permissions: keys, ...role } of laboratoryRoles) {
      const permissions = await tx.permission.findMany({
        where: { key: { in: keys } },
        select: { id: true },
      });
      if (permissions.length !== keys.length)
        throw new Error(
          "Sync the permission catalog before creating laboratory roles.",
        );
      await tx.role.upsert({
        where: { name: role.name },
        update: {},
        create: {
          ...role,
          permissions: {
            create: permissions.map(({ id }) => ({ permissionId: id })),
          },
        },
      });
    }
  });
}
