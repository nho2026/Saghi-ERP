export function presentUser(user) {
  const roles =
    user.roles?.map(({ role }) => ({
      id: role.id,
      name: role.name,
      code: role.code ?? null,
    })) ?? [];
  const permissions = [
    ...new Set(
      user.roles?.flatMap(
        ({ role }) =>
          role.permissions?.map(({ permission }) => permission.key) ?? [],
      ) ?? [],
    ),
  ];
  if (roles.some(({ name }) => name === "Super Administrator"))
    permissions.push("*");
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    department: user.department,
    warehouseId: user.warehouseId ?? null,
    warehouse: user.warehouse ?? null,
    status: user.status,
    role: roles[0]?.name ?? null,
    roles,
    permissions: [...new Set(permissions)],
    createdAt: user.createdAt,
    employee: user.employee
      ? {
          ...user.employee,
          isDepartmentLeader:
            user.employee.department?.managerId === user.employee.id,
        }
      : null,
  };
}
