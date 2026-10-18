import { Router } from "express";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "../../shared/database/client.js";
import { requireAuth } from "../../shared/middleware/auth.middleware.js";
import { requirePermission } from "../../shared/middleware/permission.middleware.js";
import { meetingDepartmentIdFor } from "./meeting-department.js";

const router = Router();
router.use(requireAuth);

router.get(
  "/departments",
  requirePermission("meetings.create"),
  async (req, res, next) => {
    try {
      const ownDepartmentId = await meetingDepartmentIdFor(req.user);
      res.json(
        await prisma.department.findMany({
          where: req.permissionKeys.has("*")
            ? { status: "active" }
            : { id: ownDepartmentId ?? "", status: "active" },
          select: { id: true, name: true, code: true },
          orderBy: { name: "asc" },
        }),
      );
    } catch (error) {
      next(error);
    }
  },
);

router.get("/", async (req, res, next) => {
  try {
    const departmentId = await meetingDepartmentIdFor(req.user);
    const privileged = req.permissionKeys.has("*");
    if (!departmentId && !privileged)
      return res
        .status(403)
        .json({ message: "Your account has no department." });
    const meetings = await prisma.meeting.findMany({
      where: {
        status: "active",
        ...(privileged || !departmentId ? {} : { departmentId }),
      },
      include: {
        department: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } },
        participants: { where: { leftAt: null }, select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(meetings);
  } catch (error) {
    next(error);
  }
});

router.get("/history", async (req, res, next) => {
  try {
    const departmentId = await meetingDepartmentIdFor(req.user);
    const privileged = req.permissionKeys.has("*");
    if (!departmentId && !privileged)
      return res
        .status(403)
        .json({ message: "Your account has no department." });

    const meetings = await prisma.meeting.findMany({
      where: {
        status: { not: "active" },
        ...(privileged || !departmentId ? {} : { departmentId }),
      },
      include: {
        department: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } },
        participants: {
          select: { userId: true, joinedAt: true, leftAt: true },
        },
      },
      orderBy: { endedAt: "desc" },
      take: 50,
    });
    res.json(meetings);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  requirePermission("meetings.create"),
  async (req, res, next) => {
    try {
      const input = z
        .object({
          title: z.string().trim().min(2).max(120),
          departmentId: z.string().optional(),
        })
        .parse(req.body);
      const ownDepartmentId = await meetingDepartmentIdFor(req.user);
      const departmentId = req.permissionKeys.has("*")
        ? input.departmentId
        : ownDepartmentId;
      if (!departmentId)
        return res
          .status(400)
          .json({ message: "Select a department for this meeting." });
      const department = await prisma.department.findFirst({
        where: { id: departmentId, status: "active" },
        select: { id: true, name: true, code: true },
      });
      if (!department)
        return res
          .status(400)
          .json({ message: "The selected department is unavailable." });
      const meeting = await prisma.$transaction(async (tx) => {
        const created = await tx.meeting.create({
          data: {
            title: input.title,
            roomCode: randomBytes(4).toString("hex").toUpperCase(),
            departmentId,
            creatorId: req.user.id,
          },
          include: {
            department: true,
            creator: { select: { id: true, name: true } },
          },
        });
        const recipients = await tx.user.findMany({
          where: {
            id: { not: req.user.id },
            status: "active",
            OR: [
              { department: { in: [department.name, department.code] } },
              { employee: { is: { departmentId } } },
            ],
          },
          select: { id: true },
        });
        if (recipients.length)
          await tx.notification.createMany({
            data: recipients.map(({ id: userId }) => ({
              userId,
              meetingId: created.id,
              type: "meeting_created",
            })),
          });
        return created;
      });
      res.status(201).json(meeting);
    } catch (error) {
      next(error);
    }
  },
);

router.get("/:roomCode/participants", async (req, res, next) => {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { roomCode: req.params.roomCode },
    });
    if (!meeting)
      return res.status(404).json({ message: "Meeting not found." });
    const departmentId = await meetingDepartmentIdFor(req.user);
    if (!req.permissionKeys.has("*") && meeting.departmentId !== departmentId)
      return res
        .status(403)
        .json({ message: "This meeting belongs to another department." });
    res.json(
      await prisma.meetingParticipant.findMany({
        where: { meetingId: meeting.id },
        include: { user: { select: { id: true, name: true, username: true } } },
        orderBy: { joinedAt: "desc" },
      }),
    );
  } catch (error) {
    next(error);
  }
});

export default router;
