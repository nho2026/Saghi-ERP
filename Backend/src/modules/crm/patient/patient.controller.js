import { patientService } from "./patient.service.js";

export const patientController = {
  list: async (req, res, next) => {
    try {
      res.json(await patientService.list(req.query));
    } catch (error) {
      next(error);
    }
  },
  profile: async (req, res, next) => {
    try {
      res.json(await patientService.profile(req.params.id));
    } catch (error) {
      next(error);
    }
  },
};
