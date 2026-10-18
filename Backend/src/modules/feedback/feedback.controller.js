import { feedbackService as s } from "./feedback.service.js";
const run = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res)).catch(next);
export const feedbackController = {
  publicList: run(async (req, res) => res.json(await s.list(req.query, true))),
  adminList: run(async (req, res) => res.json(await s.list(req.query))),
  create: run(async (req, res) =>
    res.status(201).json({
      message: "Feedback received and is awaiting approval.",
      feedback: await s.create(req.validatedBody),
    }),
  ),
  status: run(async (req, res) =>
    res.json(await s.status(req.params.id, req.validatedBody.status)),
  ),
  remove: run(async (req, res) => {
    await s.remove(req.params.id);
    res.status(204).end();
  }),
  targets: run(async (_q, res) => res.json(await s.targets())),
  summary: run(async (_q, res) => res.json(await s.summary())),
  services: run(async (_q, res) => res.json(await s.services())),
  createService: run(async (req, res) =>
    res.status(201).json(await s.createService(req.validatedBody)),
  ),
  updateService: run(async (req, res) =>
    res.json(await s.updateService(req.params.id, req.validatedBody)),
  ),
  removeService: run(async (req, res) => {
    await s.removeService(req.params.id);
    res.status(204).end();
  }),
};
