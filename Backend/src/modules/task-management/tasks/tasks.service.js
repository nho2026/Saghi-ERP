import { taskModel } from "./tasks.model.js";
const fail = (status, message) => {
  throw Object.assign(new Error(message), { status });
};
const isHr = (permissions) =>
  permissions?.has("*") || permissions?.has("tasks.list.manage_all");
const canSee = (task, user, permissions) =>
  isHr(permissions) ||
  task.createdById === user.id ||
  task.assignees.some(
    ({ employeeId, employee }) =>
      employeeId === user.employee?.id ||
      (Boolean(user.employee?.id) &&
        employee.department?.managerId === user.employee.id),
  );
const ensureLeader = (user, permissions) => {
  if (!isHr(permissions) && !user.employee?.isDepartmentLeader)
    fail(403, "Only HR or a department leader can assign tasks.");
};
const validateAssignees = async (ids, user, permissions) => {
  const employees = await taskModel.employeeScopes(ids);
  if (employees.length !== new Set(ids).size)
    fail(422, "One or more selected employees do not exist.");
  if (
    !isHr(permissions) &&
    employees.some(
      ({ department }) => department?.managerId !== user.employee?.id,
    )
  )
    fail(403, "Department leaders can assign tasks only to their employees.");
  return employees;
};
const notifyStatus = async (task, actorId, status) => {
  const hr = await taskModel.hrUserIds();
  const employeeIds = task.assignees.map(({ employeeId }) => employeeId);
  const employees = await taskModel.employeeScopes(employeeIds);
  const assigneeUserIds = employees.map(({ userId }) => userId).filter(Boolean);
  const leaderIds = [
    ...new Set(
      employees.map(({ department }) => department?.managerId).filter(Boolean),
    ),
  ];
  const leaders = await taskModel.employeeScopes(leaderIds);
  const recipients = [
    task.createdById,
    ...assigneeUserIds,
    ...leaders.map(({ userId }) => userId).filter(Boolean),
    ...hr.map(({ id }) => id),
  ].filter((id) => id && id !== actorId);
  await taskModel.notify(
    task.id,
    status === "review" ? "task_review_requested" : "task_status_updated",
    recipients,
  );
};
const split = ({ assigneeIds, attachments, ...data }) => ({
  data,
  assigneeIds,
  attachments,
});
export const taskService = {
  async departments(user, permissions) {
    const where = isHr(permissions)
      ? { status: "active" }
      : { id: user.employee?.departmentId ?? "__none__", status: "active" };
    return taskModel.listDepartments(where);
  },
  async projects(user, permissions, departmentId) {
    const hr = isHr(permissions);
    const ownDepartmentId = user.employee?.departmentId;
    if (!hr && (!ownDepartmentId || departmentId !== ownDepartmentId))
      fail(403, "You can only view projects in your department.");
    return taskModel.listProjects({ departmentId, status: "active" });
  },
  async createProject(user, permissions, input) {
    ensureLeader(user, permissions);
    const department = await taskModel.findDepartment(input.departmentId);
    if (!department) fail(404, "Department not found.");
    if (!isHr(permissions) && department.managerId !== user.employee?.id)
      fail(403, "You can create projects only for your department.");
    return taskModel.createProject({
      name: input.name,
      description: input.description || null,
      departmentId: input.departmentId,
      createdById: user.id,
    });
  },
  authorizeAssignment(user, permissions) {
    ensureLeader(user, permissions);
  },
  list(q, user, permissions) {
    const page = Math.max(1, Number(q.page) || 1),
      pageSize = Math.min(100, Math.max(1, Number(q.pageSize) || 50)),
      access = isHr(permissions)
        ? {}
        : user.employee?.isDepartmentLeader
          ? {
              OR: [
                { createdById: user.id },
                { assignees: { some: { employeeId: user.employee.id } } },
                {
                  assignees: {
                    some: {
                      employee: { department: { managerId: user.employee.id } },
                    },
                  },
                },
              ],
            }
          : user.employee?.id
            ? { assignees: { some: { employeeId: user.employee.id } } }
            : { id: "__none__" },
      where = {
        AND: [access],
        ...(q.status && { status: String(q.status) }),
        ...(q.projectId && { projectId: String(q.projectId) }),
        ...(q.departmentId && {
          project: { departmentId: String(q.departmentId) },
        }),
        ...(q.priority && { priority: String(q.priority) }),
        ...(q.assigneeId && {
          assignees: { some: { employeeId: String(q.assigneeId) } },
        }),
        ...(q.mine === "true" &&
          user.employee?.id && {
            assignees: { some: { employeeId: user.employee.id } },
          }),
        ...(q.search && {
          OR: [
            { title: { contains: String(q.search) } },
            { description: { contains: String(q.search) } },
          ],
        }),
      };
    return taskModel.findPage(where, page, pageSize);
  },
  async get(id, user, permissions) {
    const access = await taskModel.findAccess(id);
    if (!canSee(access, user, permissions))
      fail(403, "You cannot view this task.");
    return taskModel.findById(id);
  },
  assignees(user, permissions) {
    ensureLeader(user, permissions);
    return taskModel.eligibleEmployees(
      isHr(permissions) ? {} : { department: { managerId: user.employee.id } },
    );
  },
  async create(user, permissions, input) {
    ensureLeader(user, permissions);
    if (["completed", "rejected"].includes(input.status))
      fail(403, "Create a task before submitting it for review.");
    const { data, assigneeIds, attachments } = split(input);
    if (data.projectId) {
      const project = await taskModel.findProject(data.projectId);
      if (!project || project.status !== "active")
        fail(422, "Select an active project.");
      if (
        !isHr(permissions) &&
        project.department.managerId !== user.employee?.id
      )
        fail(403, "You can create tasks only in your department project.");
      const employees = await validateAssignees(assigneeIds, user, permissions);
      if (
        employees.some(
          ({ department }) => department?.id !== project.departmentId,
        )
      )
        fail(422, "Assignees must belong to the project's department.");
    } else await validateAssignees(assigneeIds, user, permissions);
    return taskModel.create(user.id, {
      ...data,
      assignees: { create: assigneeIds.map((employeeId) => ({ employeeId })) },
      attachments: { create: attachments },
    });
  },
  async update(id, user, permissions, input) {
    const current = await taskModel.findAccess(id);
    if (!canSee(current, user, permissions))
      fail(403, "You cannot update this task.");
    const hr = isHr(permissions);
    const { assigneeIds, adjustment, ...data } = input;
    if (assigneeIds) {
      ensureLeader(user, permissions);
      await validateAssignees(assigneeIds, user, permissions);
    }
    if (
      ["completed", "rejected"].includes(data.status) &&
      !(hr && (permissions?.has("*") || permissions?.has("tasks.list.approve")))
    )
      fail(403, "Only authorized reviewers can approve or reject tasks.");
    if (!hr) {
      if (
        !current.assignees.some(
          ({ employeeId }) => employeeId === user.employee?.id,
        )
      )
        fail(403, "You can update only your assigned tasks.");
      if (current.status === "completed")
        fail(403, "Approved tasks cannot be changed by employees.");
      const allowed = new Set(["status", "reviewNote"]);
      if (Object.keys(data).some((key) => !allowed.has(key)) || assigneeIds)
        fail(403, "Employees may update only task progress.");
      if (
        data.status &&
        !["todo", "in_progress", "incomplete", "review"].includes(data.status)
      )
        fail(403, "Submit completed work for HR review.");
    }
    if (data.status === "completed") {
      if (!hr) fail(403, "Only HR can approve a completed task.");
      if (current.status !== "review")
        fail(409, "The task must be submitted for review before completion.");
      data.completedAt = new Date();
      data.reviewedAt = new Date();
      data.reviewedBy = { connect: { id: user.id } };
      if (
        adjustment &&
        !current.assignees.some(
          ({ employeeId }) => employeeId === adjustment.employeeId,
        )
      )
        fail(
          422,
          "The reward or punishment employee must be assigned to this task.",
        );
    } else if (data.status === "rejected") {
      if (!hr) fail(403, "Only HR can reject a task.");
      if (current.status !== "review")
        fail(409, "The task must be submitted for review before rejection.");
      data.completedAt = null;
      data.reviewedAt = new Date();
      data.reviewedBy = { connect: { id: user.id } };
    } else if (data.status) {
      data.completedAt = null;
      if (data.status !== "review") {
        data.reviewedAt = null;
        data.reviewedBy = { disconnect: true };
      }
    }
    if (adjustment && data.status !== "completed")
      fail(
        422,
        "A reward or punishment can be added only when approving the task.",
      );
    const updateData = {
      ...data,
      ...(assigneeIds && {
        assignees: {
          deleteMany: {},
          create: assigneeIds.map((employeeId) => ({ employeeId })),
        },
      }),
    };
    const task = adjustment
      ? await taskModel.updateWithAdjustment(id, updateData, adjustment)
      : await taskModel.update(id, updateData);
    if (data.status && data.status !== current.status)
      await notifyStatus(task, user.id, data.status);
    return task;
  },
  async remove(id, user, permissions) {
    const task = await taskModel.findAccess(id);
    if (!canSee(task, user, permissions))
      fail(403, "You cannot delete this task.");
    return taskModel.remove(id);
  },
  addAttachments: async (id, files, user, permissions) => {
    const task = await taskModel.findAccess(id);
    if (!canSee(task, user, permissions))
      fail(403, "You cannot update this task.");
    await taskModel.addAttachments(id, files);
    return taskModel.findById(id);
  },
  async addComment(id, authorId, body, user, permissions) {
    const task = await taskModel.findAccess(id);
    if (!canSee(task, user, permissions))
      fail(403, "You cannot comment on this task.");
    return taskModel.addComment(id, authorId, body);
  },
  async addTime(id, recordedById, data, user, permissions) {
    const task = await taskModel.findAccess(id);
    if (!canSee(task, user, permissions))
      fail(403, "You cannot record time for this task.");
    if (
      !isHr(permissions) &&
      data.employeeId !== user.employee?.id &&
      !(
        user.employee?.isDepartmentLeader &&
        task.assignees.some(
          ({ employeeId, employee }) =>
            employeeId === data.employeeId &&
            employee.department?.managerId === user.employee.id,
        )
      )
    )
      fail(
        403,
        "You can record time only for yourself or your department employees.",
      );
    return taskModel.addTime(id, recordedById, data);
  },
  async monthlyReport(month) {
    const [year, monthNumber] = month.split("-").map(Number);
    const from = new Date(Date.UTC(year, monthNumber - 1, 1));
    const to = new Date(Date.UTC(year, monthNumber, 1));
    const [tasks, entries] = await taskModel.reportData(from, to);
    const created = tasks.filter(
      (task) => task.createdAt >= from && task.createdAt < to,
    );
    const completed = tasks.filter(
      (task) =>
        task.completedAt && task.completedAt >= from && task.completedAt < to,
    );
    const overdue = tasks.filter(
      (task) =>
        task.dueDate &&
        task.dueDate < new Date() &&
        !["completed", "rejected", "cancelled"].includes(task.status),
    );
    const minutes = entries.reduce((sum, entry) => sum + entry.minutes, 0);
    const estimatedMinutes = tasks.reduce(
      (sum, task) => sum + (task.estimatedMinutes ?? 0),
      0,
    );
    const employeeMap = new Map();
    for (const entry of entries) {
      const current = employeeMap.get(entry.employeeId) ?? {
        employeeId: entry.employeeId,
        employeeName: `${entry.employee.firstName} ${entry.employee.lastName}`,
        minutes: 0,
        entries: 0,
      };
      current.minutes += entry.minutes;
      current.entries += 1;
      employeeMap.set(entry.employeeId, current);
    }
    return {
      month,
      summary: {
        created: created.length,
        completed: completed.length,
        overdue: overdue.length,
        completionRate: created.length
          ? Math.round((completed.length / created.length) * 100)
          : 0,
        estimatedMinutes,
        trackedMinutes: minutes,
        varianceMinutes: minutes - estimatedMinutes,
      },
      employees: [...employeeMap.values()].sort(
        (a, b) => b.minutes - a.minutes,
      ),
    };
  },
};
