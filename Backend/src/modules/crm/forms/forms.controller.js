import { formsService } from "./forms.service.js";

const handle = (handler) => async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (error) {
    next(error);
  }
};

export const formsController = {
  templates: handle(async (_req, res) =>
    res.json(await formsService.templates()),
  ),
  activeTemplates: handle(async (_req, res) =>
    res.json(await formsService.activeTemplates()),
  ),
  createTemplate: handle(async (req, res) =>
    res.status(201).json(await formsService.createTemplate(req.validatedBody)),
  ),
  updateTemplate: handle(async (req, res) =>
    res.json(
      await formsService.updateTemplate(req.params.id, req.validatedBody),
    ),
  ),
  removeTemplate: handle(async (req, res) => {
    await formsService.removeTemplate(req.params.id);
    res.status(204).end();
  }),
  submissions: handle(async (req, res) =>
    res.json(await formsService.submissions(req.params.patientId)),
  ),
  createSubmission: handle(async (req, res) =>
    res
      .status(201)
      .json(
        await formsService.createSubmission(
          req.params.patientId,
          req.validatedBody,
          req.user?.id,
        ),
      ),
  ),
  removeSubmission: handle(async (req, res) => {
    await formsService.removeSubmission(req.params.id);
    res.status(204).end();
  }),
};
