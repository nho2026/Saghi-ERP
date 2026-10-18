import { paginate } from "../../../shared/database/paginate.js";
import {
  createWithCode,
  withoutCode,
} from "../../../shared/database/automatic-code.js";
import { getSettings } from "../../settings/settings.service.js";
import { prisma } from "../../../shared/database/client.js";
const recordInclude = {
  user: {
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      status: true,
      roles: { select: { role: { select: { id: true, name: true } } } },
    },
  },
  position: true,
  department: {
    include: {
      manager: { select: { id: true, firstName: true, lastName: true } },
    },
  },
  _count: {
    select: {
      salaries: true,
      attendance: true,
      payrolls: true,
      devicePeople: true,
    },
  },
};

const employeeData = (input, updating = false) => {
  const { userId, departmentId, positionId, ...data } = input;
  const relation = (id) =>
    id
      ? { connect: { id } }
      : updating && id === null
        ? { disconnect: true }
        : undefined;
  return {
    ...data,
    ...(userId !== undefined && { user: relation(userId) }),
    ...(departmentId !== undefined && { department: relation(departmentId) }),
    ...(positionId !== undefined && { position: relation(positionId) }),
  };
};

const validateSchedule = (data) => {
  if (data.scheduleType === "dynamic" && !data.workSchedule?.length)
    throw Object.assign(
      new Error("Select at least one working day for a dynamic schedule."),
      { status: 422 },
    );
  if (data.checkInTime === data.checkOutTime && data.scheduleType !== "dynamic")
    throw Object.assign(
      new Error("Check-in and check-out must be different."),
      { status: 422 },
    );
};

export const employeeModel = {
  findAll: (query = {}) =>
    paginate(
      "employee",
      query,
      {
        where: {
          ...(query.departmentId && {
            departmentId: String(query.departmentId),
          }),
          ...(query.positionId && { positionId: String(query.positionId) }),
          ...(query.status && { status: String(query.status) }),
        },
        include: recordInclude,
        orderBy: { createdAt: "desc" },
      },
      ["firstName", "lastName", "employeeCode"],
    ),
  create: async (data) => {
    const settings = await getSettings("hr");
    data = {
      ...data,
      checkInTime: data.checkInTime ?? settings.startTime,
      checkOutTime: data.checkOutTime ?? settings.endTime,
    };
    validateSchedule(data);
    return createWithCode(
      prisma.employee,
      {
        data: employeeData(data),
        include: recordInclude,
      },
      "EMP",
      "employeeCode",
    );
  },
  update: async (id, data) => {
    const current = await prisma.employee.findUniqueOrThrow({ where: { id } });
    validateSchedule({ ...current, ...data });
    return prisma.employee.update({
      where: { id },
      data: employeeData(withoutCode(data, "employeeCode"), true),
      include: recordInclude,
    });
  },
  remove: (id) =>
    prisma.$transaction(async (tx) => {
      // Relations that represent an identity link should survive, but no
      // longer point at an employee that is being removed.
      await tx.attendancePerson.updateMany({
        where: { employeeId: id },
        data: { employeeId: null },
      });
      await tx.department.updateMany({
        where: { managerId: id },
        data: { managerId: null },
      });

      // Remove dependent operational/history rows in explicit FK order.
      // This avoids MySQL P2003 conflicts from SalaryAdvance (RESTRICT),
      // Payroll -> Salary, and Appointment -> HealthStaff.
      const staff = await tx.healthStaff.findUnique({
        where: { employeeId: id },
        select: { id: true },
      });
      if (staff) {
        await tx.appointment.deleteMany({ where: { doctorId: staff.id } });
        await tx.surgeryAppointment.deleteMany({
          where: { doctorId: staff.id },
        });
        await tx.healthStaff.delete({ where: { id: staff.id } });
      }
      await tx.salaryAdvance.deleteMany({ where: { employeeId: id } });
      await tx.payroll.deleteMany({ where: { employeeId: id } });
      await tx.employeeSalary.deleteMany({ where: { employeeId: id } });
      await tx.employeeAttendance.deleteMany({ where: { employeeId: id } });
      await tx.taskTimeEntry.deleteMany({ where: { employeeId: id } });
      await tx.taskAssignee.deleteMany({ where: { employeeId: id } });

      return tx.employee.delete({ where: { id } });
    }),
};
