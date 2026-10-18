import { deletePatient } from "./patient/delete-patient.js";
import { bookWithProgress } from "./patient/book-with-progress.js";
import {
  createWithCode,
  withoutCode,
} from "../../shared/database/automatic-code.js";
import { createPatient } from "./patient/patient-code.js";
import { prisma } from "../../shared/database/client.js";

const models = {
  patients: "patient",
  surgeries: "surgery",
  "surgery-appointments": "surgeryAppointment",
  payments: "patientPayment",
};

const includes = {
  patients: undefined,
  surgeries: undefined,
  "surgery-appointments": {
    patient: true,
    doctor: { include: { employee: true } },
    surgery: true,
  },
  payments: {
    patient: true,
    surgeryAppointment: { include: { surgery: true } },
  },
};

const delegate = (resource) => prisma[models[resource]];
const includeFor = (resource) =>
  includes[resource] ? { include: includes[resource] } : {};

export const crmModel = {
  async lookups() {
    const [patients, doctors, surgeries, surgeryAppointments] =
      await Promise.all([
        prisma.patient.findMany({
          where: { status: { not: "inactive" } },
          orderBy: { firstName: "asc" },
        }),
        prisma.healthStaff.findMany({
          where: { staffType: "doctor", status: "active" },
          include: { employee: true },
          orderBy: { employee: { firstName: "asc" } },
        }),
        prisma.surgery.findMany({
          where: { status: "active" },
          orderBy: { name: "asc" },
        }),
        prisma.surgeryAppointment.findMany({
          include: { patient: true, surgery: true },
          orderBy: { scheduledAt: "desc" },
          take: 500,
        }),
      ]);
    return { patients, doctors, surgeries, surgeryAppointments };
  },
  list: (resource, skip, take) =>
    Promise.all([
      delegate(resource).findMany({
        ...includeFor(resource),
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      delegate(resource).count(),
    ]),
  create: (resource, data) =>
    resource === "surgery-appointments"
      ? bookWithProgress(prisma, data.patientId, "surgery_appointment", (tx) =>
          tx.surgeryAppointment.create({ data, ...includeFor(resource) }),
        )
      : resource === "patients"
        ? createPatient(prisma, data)
        : resource === "surgeries"
          ? createWithCode(prisma.surgery, { data }, "SUR")
          : delegate(resource).create({ data, ...includeFor(resource) }),
  update: async (resource, id, data) => {
    const changes = resource === "surgeries" ? withoutCode(data) : { ...data };
    if (resource === "patients") {
      delete changes.patientCode;
      if (
        [
          "post_discharge_follow_up",
          "post_discharge_follow_up_completed",
        ].includes(changes.status)
      ) {
        const current = await prisma.patient.findUniqueOrThrow({
          where: { id },
          select: { followUpDate: true },
        });
        if (!changes.followUpDate && !current.followUpDate) {
          throw Object.assign(new Error("Follow-up date is required."), {
            status: 400,
          });
        }
      }
    }
    return delegate(resource).update({
      where: { id },
      data: changes,
      ...includeFor(resource),
    });
  },
  delete: (resource, id) =>
    resource === "patients"
      ? deletePatient(prisma, id)
      : delegate(resource).delete({ where: { id } }),
};
