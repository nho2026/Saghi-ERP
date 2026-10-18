export const createCrudService = (model) => ({
  list: (query) => model.findAll(query),
  create: (data) => model.create(data),
  update: (id, data) => model.update(id, data),
  remove: (id) => model.remove(id),
});
