import {
  pageResult,
  paginationArgs,
} from "../../shared/pagination/pagination.js";
import { auditedActions, systemLogsModel } from "./system-logs.model.js";
import { systemLogsQuerySchema } from "./system-logs.schema.js";

export const systemLogsService = {
  async list(rawQuery) {
    const query = systemLogsQuerySchema.parse(rawQuery);
    const { page, pageSize, skip, take } = paginationArgs(query);
    const where = {
      action: query.action || { in: auditedActions },
      ...(query.module && { module: query.module }),
      ...(query.result === "success" && { statusCode: { lt: 400 } }),
      ...(query.result === "failed" && { statusCode: { gte: 400 } }),
      ...((query.from || query.to) && {
        createdAt: {
          ...(query.from && { gte: query.from }),
          ...(query.to && { lte: query.to }),
        },
      }),
      ...(query.search && {
        OR: ["userName", "path", "module", "ipAddress"].map((field) => ({
          [field]: { contains: query.search },
        })),
      }),
    };
    const [items, total, modules] = await systemLogsModel.list(
      where,
      skip,
      take,
    );
    return {
      ...pageResult(items, total, page, pageSize),
      modules: modules.map((item) => item.module),
    };
  },
};
