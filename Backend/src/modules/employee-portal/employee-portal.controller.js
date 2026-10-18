import { employeePortalService } from "./employee-portal.service.js";

export const employeePortalController = {
  myTasks: async (req, res, next) => {
    try {
      res.json(await employeePortalService.myTasks({ user: req.user }));
    } catch (error) {
      next(error);
    }
  },
  ideas: async (req, res, next) => {
    try {
      res.json(await employeePortalService.ideas({ user: req.user }));
    } catch (error) {
      next(error);
    }
  },
  createIdea: async (req, res, next) => {
    try {
      res.status(201).json(
        await employeePortalService.createIdea({
          user: req.user,
          body: req.validatedBody,
        }),
      );
    } catch (error) {
      next(error);
    }
  },
  warnings: async (req, res, next) => {
    try {
      res.json(await employeePortalService.warnings({ user: req.user }));
    } catch (error) {
      next(error);
    }
  },
};
