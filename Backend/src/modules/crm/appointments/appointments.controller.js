import { appointmentsService } from "./appointments.service.js";

const run = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res)).catch(next);

export const appointmentsController = {
  serve: run(async (req, res) =>
    res.json(await appointmentsService.serve(req.params.id)),
  ),
  profileCandidates: run(async (req, res) =>
    res.json(await appointmentsService.profileCandidates(req.params.id)),
  ),
  today: run(async (req, res) =>
    res.json(await appointmentsService.today(req.query)),
  ),
  list: run(async (req, res) =>
    res.json(await appointmentsService.list(req.query)),
  ),
  create: run(async (req, res) =>
    res.status(201).json(await appointmentsService.create(req.validatedBody)),
  ),
  update: run(async (req, res) =>
    res.json(
      await appointmentsService.update(req.params.id, req.validatedBody),
    ),
  ),
  remove: run(async (req, res) => {
    await appointmentsService.remove(req.params.id);
    res.status(204).end();
  }),
  book: run(async (req, res) =>
    res.status(201).json({
      message: "Appointment request received.",
      appointment: await appointmentsService.book(req.validatedBody),
    }),
  ),
};
