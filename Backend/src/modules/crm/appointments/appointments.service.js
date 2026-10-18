import { paginateRows } from "../../../shared/database/paginate.js";
import { hospitalDate, todayWindow } from "./today.js";
import { getSettings } from "../../settings/settings.service.js";
import { appointmentsModel } from "./appointments.model.js";

const fail = (message, status) => {
  throw Object.assign(new Error(message), { status });
};

export const ensureAppointmentDate = (scheduledAt, currentScheduledAt) => {
  if (scheduledAt === undefined) return;
  const date = new Date(scheduledAt);
  // Historical appointments can still have their status or notes updated.
  if (
    currentScheduledAt &&
    date.getTime() === new Date(currentScheduledAt).getTime()
  )
    return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) fail("Appointment date cannot be in the past.", 400);
};

const ensureDoctor = async (data) => {
  if (!data.doctorId) return;
  const doctor = await appointmentsModel.findDoctor(data.doctorId);
  if (doctor.staffType !== "doctor")
    fail("Appointments can only be assigned to doctors.", 400);
  if (data.departmentId && doctor.departmentId !== data.departmentId)
    fail("The selected doctor does not belong to this department.", 400);
};

export const appointmentsService = {
  serve: (id) => appointmentsModel.serve(id),
  profileCandidates: (id) => appointmentsModel.profileCandidates(id),
  async today(query = {}) {
    const system = await getSettings("system");
    const timezone = system.timezone || "Asia/Baghdad";
    const { date, start, end } = todayWindow(new Date(), timezone);
    const [consultations, surgeries] = await Promise.all([
      appointmentsModel.today(start, end),
      appointmentsModel.todaySurgeries(start, end),
    ]);
    const items = [
      ...consultations.filter(
        (item) => hospitalDate(item.scheduledAt, timezone) === date,
      ),
      ...surgeries
        .filter(
          (item) =>
            item.status === "in_progress" ||
            hospitalDate(item.scheduledAt, timezone) === date,
        )
        .map((item) => ({
          id: `surgery:${item.id}`,
          patientId: item.patientId,
          patientName:
            `${item.patient.firstName} ${item.patient.lastName}`.trim(),
          patientPhone: item.patient.phone,
          doctorId: item.doctorId,
          doctor: item.doctor,
          department: item.doctor?.department ?? null,
          scheduledAt: item.scheduledAt,
          status: item.status,
          reason: item.surgery.name,
          durationMinutes: item.surgery.durationMinutes,
          operatingRoom: item.operatingRoom,
        })),
    ].sort((a, b) => a.scheduledAt - b.scheduledAt);
    if (query.page === undefined) return { date, timezone, items };
    const pending = ["pending", "confirmed", "scheduled", "in_progress"];
    const search = String(query.search ?? "")
      .trim()
      .toLocaleLowerCase();
    const filtered = items.filter(
      (item) =>
        (!query.status ||
          query.status === "all" ||
          (query.status === "current"
            ? pending.includes(item.status)
            : item.status === query.status)) &&
        (!query.doctor ||
          query.doctor === "all" ||
          item.doctorId === query.doctor) &&
        (item.patientName + " " + item.patientPhone)
          .toLocaleLowerCase()
          .includes(search),
    );
    const doctors = [
      ...new Map(
        items
          .filter((item) => item.doctorId)
          .map((item) => [
            item.doctorId,
            item.doctor
              ? item.doctor.employee.firstName +
                " " +
                item.doctor.employee.lastName
              : "—",
          ]),
      ).entries(),
    ];
    return {
      date,
      timezone,
      ...paginateRows(filtered, query),
      doctors,
      totals: {
        total: items.length,
        current: items.filter((item) => pending.includes(item.status)).length,
        completed: items.filter((item) => item.status === "completed").length,
      },
    };
  },
  list: (query) => appointmentsModel.list(query),
  async create(data) {
    const policy = await getSettings("healthcare");
    data = {
      ...data,
      durationMinutes: data.durationMinutes ?? policy.appointmentMinutes,
    };
    ensureAppointmentDate(data.scheduledAt);
    await ensureDoctor(data);
    return appointmentsModel.create({
      ...data,
      patientEmail: data.patientEmail || null,
      source: "admin",
    });
  },
  async update(id, data) {
    const current = await appointmentsModel.findById(id);
    ensureAppointmentDate(data.scheduledAt, current.scheduledAt);
    await ensureDoctor({ ...current, ...data });
    return appointmentsModel.update(id, {
      ...data,
      ...(data.patientEmail !== undefined && {
        patientEmail: data.patientEmail || null,
      }),
    });
  },
  remove: (id) => appointmentsModel.remove(id),
  async book(data) {
    const policy = await getSettings("healthcare");
    const system = await getSettings("system");
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: system.timezone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(data.scheduledAt));
    const part = (key) => parts.find((p) => p.type === key)?.value;
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
      part("weekday"),
    );
    const minute = Number(part("hour")) * 60 + Number(part("minute"));
    const minutes = (time) =>
      Number(time.split(":")[0]) * 60 + Number(time.split(":")[1]);
    if (
      !policy.bookingDays.includes(day) ||
      minute < minutes(policy.bookingStart) ||
      minute + policy.appointmentMinutes > minutes(policy.bookingEnd)
    )
      fail("This appointment is outside public booking hours.", 400);
    if (
      !(await appointmentsModel.findPublicDoctor(
        data.doctorId,
        data.departmentId,
      ))
    )
      fail("The selected doctor is not available for public booking.", 400);
    if (await appointmentsModel.findConflict(data.doctorId, data.scheduledAt))
      fail("This appointment time is no longer available.", 409);
    return appointmentsModel.create(
      {
        ...data,
        patientEmail: data.patientEmail || null,
        durationMinutes: policy.appointmentMinutes,
        status: "pending",
        source: "website",
      },
      true,
    );
  },
};
