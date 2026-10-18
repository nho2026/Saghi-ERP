import { getSettings } from "../settings/settings.service.js";
import {
  pageResult,
  paginationArgs,
} from "../../shared/pagination/pagination.js";
import { crmModel } from "./crm.model.js";

export const crmService = {
  lookups: () => crmModel.lookups(),
  async list(resource, query) {
    const { page, pageSize, skip, take } = paginationArgs(query);
    const [items, total] = await crmModel.list(resource, skip, take);
    return pageResult(items, total, page, pageSize);
  },
  async create(resource, data) {
    if (
      resource === "surgery-appointments" &&
      data.operatingRoom &&
      !(await getSettings("healthcare")).operatingRooms.includes(
        data.operatingRoom,
      )
    )
      throw Object.assign(
        new Error("Select an operating room from Settings."),
        { status: 400 },
      );
    return crmModel.create(resource, data);
  },
  async update(resource, id, data) {
    if (
      resource === "surgery-appointments" &&
      data.operatingRoom &&
      !(await getSettings("healthcare")).operatingRooms.includes(
        data.operatingRoom,
      )
    )
      throw Object.assign(
        new Error("Select an operating room from Settings."),
        { status: 400 },
      );
    return crmModel.update(resource, id, data);
  },
  delete: (resource, id) => crmModel.delete(resource, id),
};
