import { systemLogsService } from "./system-logs.service.js";

export const systemLogsController = {
  async list(req, res, next) {
    try {
      res.json(await systemLogsService.list(req.query));
    } catch (error) {
      next(error);
    }
  },
};
