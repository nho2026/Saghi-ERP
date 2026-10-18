import { prisma } from "../../../shared/database/client.js";
import { payrollAdjustmentData } from "../../hr/payroll-adjustments/payroll-adjustments.service.js";
const include = {
  project: {
    select: {
      id: true,
      name: true,
      department: { select: { id: true, name: true } },
    },
  },
  createdBy: { select: { id: true, name: true } },
  reviewedBy: { select: { id: true, name: true } },
  assignees: {
    include: {
      employee: {
        include: {
          department: { select: { managerId: true, name: true } },
          position: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  },
  attachments: true,
  comments: {
    include: { author: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  },
  timeEntries: {
    include: {
      employee: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { workDate: "desc" },
  },
};
export const taskModel = {
  include,
  listDepartments: (where) =>
    prisma.department.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        projects: {
          where: { status: "active" },
          orderBy: { name: "asc" },
          include: { _count: { select: { tasks: true } } },
        },
      },
    }),
  listProjects: (where) =>
    prisma.project.findMany({
      where,
      include: {
        department: { select: { id: true, name: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    }),
  findProject: (id) =>
    prisma.project.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, name: true, managerId: true } },
      },
    }),
  findDepartment: (id) =>
    prisma.department.findUnique({
      where: { id },
      select: { id: true, managerId: true, status: true },
    }),
  createProject: (data) =>
    prisma.project.create({
      data,
      include: {
        department: { select: { id: true, name: true } },
        _count: { select: { tasks: true } },
      },
    }),
  async findPage(where, page, pageSize) {
    const [items, total, groups] = await prisma.$transaction([
      prisma.task.findMany({
        where,
        include,
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.task.count({ where }),
      prisma.task.groupBy({ by: ["status"], where, _count: { _all: true } }),
    ]);
    return {
      items,
      counts: Object.fromEntries(
        groups.map((row) => [row.status, row._count._all]),
      ),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  },
  findById: (id) => prisma.task.findUniqueOrThrow({ where: { id }, include }),
  findAccess: (id) =>
    prisma.task.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        status: true,
        createdById: true,
        assignees: {
          select: {
            employeeId: true,
            employee: {
              select: { department: { select: { managerId: true } } },
            },
          },
        },
      },
    }),
  eligibleEmployees: (where) =>
    prisma.employee.findMany({
      where: { status: "active", userId: { not: null }, ...where },
      include: {
        department: { select: { managerId: true, name: true } },
        position: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ department: { name: "asc" } }, { firstName: "asc" }],
    }),
  employeeScopes: (ids) =>
    prisma.employee.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        department: { select: { id: true, managerId: true } },
        userId: true,
      },
    }),
  hrUserIds: () =>
    prisma.user.findMany({
      where: {
        status: "active",
        roles: {
          some: {
            role: {
              OR: [
                { name: "Super Administrator" },
                {
                  permissions: {
                    some: {
                      permission: {
                        key: {
                          in: [
                            "employees.manage",
                            "hr.employees.create",
                            "hr.employees.update",
                            "hr.employees.delete",
                          ],
                        },
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
      select: { id: true },
    }),
  notify: (taskId, type, userIds) =>
    userIds.length
      ? prisma.notification.createMany({
          data: [...new Set(userIds)].map((userId) => ({
            userId,
            taskId,
            type,
          })),
        })
      : Promise.resolve(),
  create: (createdById, data) =>
    prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: { ...data, createdById },
        include,
      });
      const userIds = task.assignees
        .map(({ employee }) => employee.user?.id)
        .filter(Boolean);
      if (userIds.length)
        await tx.notification.createMany({
          data: userIds.map((userId) => ({
            userId,
            taskId: task.id,
            type: "task_assigned",
          })),
        });
      return task;
    }),
  update: (id, data) =>
    prisma.$transaction(async (tx) => {
      const previous = data.assignees
        ? await tx.taskAssignee.findMany({
            where: { taskId: id },
            select: { employeeId: true },
          })
        : [];
      const task = await tx.task.update({ where: { id }, data, include });
      if (data.assignees) {
        const previousIds = new Set(
          previous.map(({ employeeId }) => employeeId),
        );
        const userIds = task.assignees
          .filter(({ employeeId }) => !previousIds.has(employeeId))
          .map(({ employee }) => employee.user?.id)
          .filter(Boolean);
        if (userIds.length)
          await tx.notification.createMany({
            data: userIds.map((userId) => ({
              userId,
              taskId: task.id,
              type: "task_assigned",
            })),
          });
      }
      return task;
    }),
  updateWithAdjustment: (id, data, adjustment) =>
    prisma.$transaction(async (tx) => {
      const task = await tx.task.update({ where: { id }, data, include });
      await tx.payrollAdjustment.upsert({
        where: { sourceType_sourceId: { sourceType: "task", sourceId: id } },
        create: payrollAdjustmentData({
          ...adjustment,
          sourceType: "task",
          sourceId: id,
        }),
        update: payrollAdjustmentData(adjustment),
      });
      return task;
    }),
  remove: (id) => prisma.task.delete({ where: { id } }),
  addAttachments: (taskId, files) =>
    prisma.taskAttachment.createMany({
      data: files.map((file) => ({ taskId, ...file })),
    }),
  addComment: (taskId, authorId, body) =>
    prisma.taskComment.create({
      data: { taskId, authorId, body },
      include: { author: { select: { id: true, name: true } } },
    }),
  addTime: (taskId, recordedById, data) =>
    prisma.taskTimeEntry.create({
      data: { taskId, recordedById, ...data },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
  reportData: (from, to) =>
    Promise.all([
      prisma.task.findMany({
        where: {
          OR: [
            { createdAt: { gte: from, lt: to } },
            { completedAt: { gte: from, lt: to } },
            { dueDate: { gte: from, lt: to } },
          ],
        },
        include: {
          assignees: {
            include: {
              employee: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
          },
          timeEntries: { where: { workDate: { gte: from, lt: to } } },
        },
      }),
      prisma.taskTimeEntry.findMany({
        where: { workDate: { gte: from, lt: to } },
        include: {
          employee: { select: { id: true, firstName: true, lastName: true } },
          task: { select: { team: true } },
        },
      }),
    ]),
};
