export const presentRole = (role) => ({
  id: role.id,
  code: role.code ?? null,
  name: role.name,
  description: role.description,
  users: role._count.users,
  permissions: role._count.permissions,
  permissionItems: role.permissions.map(({ permission }) => permission),
});
