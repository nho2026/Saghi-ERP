import { prisma } from "../../shared/database/client.js";

export async function meetingDepartmentIdFor(user) {
  const assignedDepartment = user.department?.trim();
  if (assignedDepartment) {
    const department = await prisma.department.findFirst({
      where: {
        status: "active",
        OR: [{ name: assignedDepartment }, { code: assignedDepartment }],
      },
      select: { id: true },
    });
    if (department) return department.id;
  }
  return user.employee?.departmentId ?? null;
}
