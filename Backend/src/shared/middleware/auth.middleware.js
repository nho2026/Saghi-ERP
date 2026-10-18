import { effectivePermissions } from "../security/access-policy.js";
import { requireRequestPermission } from "./permission.middleware.js";
import { prisma } from "../database/client.js";
import { verifyToken } from "../security/token.js";

export async function requireAuth(req, res, next) {
  try {
    const bearer = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null;
    const token = req.cookies.access_token ?? bearer;
    if (!token)
      return res.status(401).json({ message: "Authentication required." });
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        employee: {
          select: {
            id: true,
            departmentId: true,
            department: { select: { managerId: true } },
          },
        },
        roles: {
          include: {
            role: {
              include: { permissions: { include: { permission: true } } },
            },
          },
        },
      },
    });
    if (!user || user.status !== "active")
      return res.status(401).json({ message: "Account is unavailable." });
    if (user.employee)
      user.employee.isDepartmentLeader =
        user.employee.department?.managerId === user.employee.id;
    user.isHospitalDepartment = Boolean(
      user.department &&
      (await prisma.department.count({
        where: { name: user.department, type: "hospital", status: "active" },
      })),
    );
    req.user = user;
    req.permissionKeys = new Set(
      user.roles.flatMap(({ role }) =>
        role.permissions.map(({ permission }) => permission.key),
      ),
    );
    req.permissionKeys = effectivePermissions(req.permissionKeys);
    if (user.roles.some(({ role }) => role.name === "Super Administrator"))
      req.permissionKeys.add("*");
    return requireRequestPermission(req, res, next);
  } catch (error) {
    console.error("Authentication lookup failed:", error);
    res.status(401).json({ message: "Your session is invalid or expired." });
  }
}
