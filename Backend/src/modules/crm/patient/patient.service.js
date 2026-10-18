import { patientModel } from "./patient.model.js";
import {
  pageResult,
  paginationArgs,
} from "../../../shared/pagination/pagination.js";
import { patientFilterSchema } from "./patient.schema.js";

export const patientService = {
  async list(query) {
    const { page, pageSize, skip, take } = paginationArgs(query);
    const filters = patientFilterSchema.parse(query);
    const where = {
      ...(filters.search && {
        OR: [
          "patientCode",
          "firstName",
          "lastName",
          "phone",
          "email",
          "address",
        ].map((field) => ({ [field]: { contains: filters.search } })),
      }),
      ...(filters.gender && { gender: filters.gender }),
      ...(filters.bloodType && { bloodType: filters.bloodType }),
      ...(filters.status && { status: filters.status }),
      ...(filters.followUp && {
        status: {
          in: [
            "post_discharge_follow_up",
            "post_discharge_follow_up_completed",
          ],
        },
      }),
      ...(filters.isMarried !== undefined && {
        isMarried: filters.isMarried,
      }),
      ...(filters.hasDiabetes !== undefined && {
        hasDiabetes: filters.hasDiabetes,
      }),
      ...(filters.hasHypertension !== undefined && {
        hasHypertension: filters.hasHypertension,
      }),
    };
    const [items, total] = await patientModel.list(skip, take, where);
    return pageResult(items, total, page, pageSize);
  },
  async profile(id) {
    const { patient, appointments } = await patientModel.profile(id);
    return {
      ...patient,
      lead: patient.sourceLeads[0] ?? null,
      appointments,
      visitCount: appointments.length + patient.surgeryAppointments.length,
    };
  },
};
