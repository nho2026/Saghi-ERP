export function createCrudController(service) {
  const run = (handler) => (req, res, next) =>
    Promise.resolve(handler(req, res)).catch(next);
  return {
    list: run(async (req, res) => res.json(await service.list(req.query))),
    create: run(async (req, res) =>
      res.status(201).json(await service.create(req.validatedBody)),
    ),
    update: run(async (req, res) =>
      res.json(await service.update(req.params.id, req.validatedBody)),
    ),
    remove: run(async (req, res) => {
      await service.remove(req.params.id);
      res.status(204).end();
    }),
  };
}
