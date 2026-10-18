import {
  pageResult,
  paginationArgs,
} from "../../../shared/pagination/pagination.js";
import { leadModel } from "./lead.model.js";
import { leadFilterSchema } from "./lead.schema.js";

export const leadService = {
  async list(query) {
    const { page, pageSize, skip, take } = paginationArgs(query);
    const filters = leadFilterSchema.parse(query);
    const where = {
      ...(filters.search && {
        OR: ["code", "name", "phone", "source", "address"].map((field) => ({
          [field]: { contains: filters.search },
        })),
      }),
      ...Object.fromEntries(
        ["city", "country"]
          .filter((field) => filters[field])
          .map((field) => [field, { contains: filters[field] }]),
      ),
      ...Object.fromEntries(
        ["contactMethod", "leadSourceChannel", "patientType", "referralPersona"]
          .filter((field) => filters[field])
          .map((field) => [field, filters[field]]),
      ),
      ...(filters.source && { source: filters.source }),
      ...(filters.gender && { gender: filters.gender }),
      ...(filters.status && { status: filters.status }),
      ...((filters.minAge !== undefined || filters.maxAge !== undefined) && {
        age: {
          ...(filters.minAge !== undefined && { gte: filters.minAge }),
          ...(filters.maxAge !== undefined && { lte: filters.maxAge }),
        },
      }),
    };
    if (filters.fromDate || filters.toDate) {
      const range = {};
      if (filters.fromDate)
        range.gte = new Date(`${filters.fromDate}T00:00:00.000Z`);
      if (filters.toDate) {
        const nextDay = new Date(`${filters.toDate}T00:00:00.000Z`);
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);
        range.lt = nextDay;
      }
      where[filters.dateField ?? "createdAt"] = range;
    }
    const [items, total] = await leadModel.findAll(skip, take, where);
    const result = pageResult(items, total, page, pageSize);
    if (query.summary === "true") {
      const { status: _status, ...summaryWhere } = where;
      result.counts = Object.fromEntries(
        (await leadModel.counts(summaryWhere)).map((row) => [
          row.status,
          row._count._all,
        ]),
      );
    }
    return result;
  },
  get: (id) => leadModel.findById(id),
  create: (data) =>
    leadModel.create({
      ...data,
      code: data.code || `L${Date.now().toString().slice(-10)}`,
    }),
  async update(id, data) {
    if (!["converted", "direct_surgery_converted"].includes(data.status))
      return leadModel.update(id, data);
    const lead = await leadModel.findById(id);
    return lead.convertedPatient
      ? leadModel.update(id, data)
      : leadModel.convert(lead, data);
  },
  remove: (id) => leadModel.remove(id),
  addAttachments: (id, attachments) =>
    leadModel.addAttachments(id, attachments),
  removeAttachment: async (id) => {
    const attachment = await leadModel.findAttachment(id);
    await leadModel.removeAttachment(id);
    return attachment;
  },
};
