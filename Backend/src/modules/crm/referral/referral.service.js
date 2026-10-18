import {
  pageResult,
  paginationArgs,
} from "../../../shared/pagination/pagination.js";
import { referralModel } from "./referral.model.js";
import { referralFilterSchema } from "./referral.schema.js";

export const referralService = {
  async list(query) {
    const { page, pageSize, skip, take } = paginationArgs(query);
    const filters = referralFilterSchema.parse(query);
    const where = {
      ...(filters.patientId && { patientId: filters.patientId }),
      ...(filters.referralType && { referralType: filters.referralType }),
      ...(filters.status && { status: filters.status }),
      ...((filters.from || filters.to) && {
        referredAt: {
          ...(filters.from && { gte: filters.from }),
          ...(filters.to && { lte: filters.to }),
        },
      }),
      ...(filters.search && {
        OR: ["referrerName", "referrerPhone", "notes"].map((field) => ({
          [field]: { contains: filters.search },
        })),
      }),
    };
    const [items, total] = await referralModel.list(skip, take, where);
    const phones = [
      ...new Set(items.map((item) => item.referrerPhone).filter(Boolean)),
    ];
    const counts = phones.length
      ? await referralModel.broughtCounts(phones)
      : [];
    const countByPhone = new Map(
      counts.map((entry) => [entry.referrerPhone, entry._count.patientId]),
    );
    return pageResult(
      items.map((item) => ({
        ...item,
        broughtPatients: item.referrerPhone
          ? (countByPhone.get(item.referrerPhone) ?? 0)
          : 0,
        refereeName:
          `${item.patient.firstName} ${item.patient.lastName}`.trim(),
        leadCode: item.patient.sourceLeads[0]?.code ?? null,
      })),
      total,
      page,
      pageSize,
    );
  },
  create: (data) => referralModel.create(data),
  update: (id, data) => referralModel.update(id, data),
  remove: (id) => referralModel.remove(id),
};
