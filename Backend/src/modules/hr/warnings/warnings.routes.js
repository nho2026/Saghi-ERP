import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../../shared/database/client.js";
import { requirePermission } from "../../../shared/middleware/permission.middleware.js";
import { validate } from "../../../shared/middleware/validation.middleware.js";

const router = Router();
const manage = requirePermission("employees.manage");
const schema = z
  .object({
    title: z.string().trim().min(2).max(200),
    message: z.string().trim().min(2).max(10000),
    severity: z.enum(["info", "warning", "urgent"]).default("warning"),
    audience: z.enum(["all", "role", "department", "users"]),
    targetId: z.string().optional(),
    userIds: z.array(z.string()).default([]),
  })
  .refine(
    (v) =>
      v.audience === "all" ||
      (v.audience === "users" ? v.userIds.length > 0 : !!v.targetId),
    { message: "Select warning recipients." },
  );
router.get("/audience", manage, async (_req, res, next) => {
  try {
    const [roles, departments, users] = await Promise.all([
      prisma.role.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.department.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.user.findMany({
        where: { status: "active", employee: { isNot: null } },
        select: {
          id: true,
          name: true,
          employee: { select: { employeeCode: true } },
        },
        orderBy: { name: "asc" },
      }),
    ]);
    res.json({ roles, departments, users });
  } catch (error) {
    next(error);
  }
});
router.get("/", manage, async (_req, res, next) => {
  try {
    res.json(
      await prisma.warning.findMany({
        include: {
          sender: { select: { id: true, name: true } },
          _count: { select: { recipients: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    );
  } catch (error) {
    next(error);
  }
});
router.post("/", manage, validate(schema), async (req, res, next) => {
  try {
    const { audience, targetId, userIds, ...data } = req.validatedBody;
    const where =
      audience === "all"
        ? { status: "active" }
        : audience === "role"
          ? { status: "active", roles: { some: { roleId: targetId } } }
          : audience === "department"
            ? { status: "active", employee: { departmentId: targetId } }
            : { status: "active", id: { in: userIds } };
    const users = await prisma.user.findMany({ where, select: { id: true } });
    if (!users.length)
      return res
        .status(422)
        .json({ message: "No active users match this audience." });
    const warning = await prisma.$transaction(async (tx) => {
      const created = await tx.warning.create({
        data: {
          ...data,
          senderId: req.user.id,
          recipients: { create: users.map(({ id }) => ({ userId: id })) },
        },
      });
      await tx.notification.createMany({
        data: users.map(({ id }) => ({
          userId: id,
          warningId: created.id,
          type: "warning",
        })),
      });
      return created;
    });
    res.status(201).json(warning);
  } catch (error) {
    next(error);
  }
});
export default router;
