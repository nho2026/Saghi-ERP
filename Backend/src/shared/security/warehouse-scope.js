export function assignedWarehouse(user) {
  const scoped = user?.warehouseId || user?.isHospitalDepartment;
  if (!scoped) return null;
  if (!user.warehouseId)
    throw Object.assign(
      new Error(
        "No storage is assigned to your account. Contact an administrator.",
      ),
      { status: 403 },
    );
  return user.warehouseId;
}
export function scopeWarehouseQuery(user, query = {}) {
  const warehouseId = assignedWarehouse(user);
  if (!warehouseId) return query;
  if (query.warehouseId && query.warehouseId !== warehouseId)
    throw Object.assign(
      new Error("You can access only your assigned storage."),
      { status: 403 },
    );
  return { ...query, warehouseId };
}
