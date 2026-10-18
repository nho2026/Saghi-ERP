import { buildingService } from "./building.service.js";

const action = (fn) => async (req, res, next) => {
  try {
    res.json(await fn(req));
  } catch (error) {
    next(error);
  }
};

export const buildingController = {
  uploadInvoice: async (req, res, next) => {
    try {
      if (!req.file)
        throw Object.assign(new Error("Choose an invoice image."), {
          status: 400,
        });
      res.status(201).json({
        attachmentUrl: `/public/product-images/${req.file.filename}`,
      });
    } catch (error) {
      next(error);
    }
  },
  overview: action(() => buildingService.overview()),
  createProduct: action((req) => buildingService.createProduct(req.body)),
  updateProduct: action((req) =>
    buildingService.updateProduct(req.params.id, req.body),
  ),
  updateAllocation: action((req) =>
    buildingService.updateAllocation(req.params.id, req.body),
  ),
  createExpense: action((req) =>
    buildingService.createExpense(req.body, req.user),
  ),
  updateExpense: action((req) =>
    buildingService.updateExpense(req.params.id, req.body),
  ),
  createRequest: action((req) =>
    buildingService.createRequest(req.body, req.user),
  ),
  recordPayment: action((req) =>
    buildingService.recordPayment(req.params.id, req.body, req.user),
  ),
  updateDraft: action((req) =>
    buildingService.updateDraft(req.params.id, req.body),
  ),
  submitRequest: action((req) =>
    buildingService.submitRequest(req.params.id, req.user),
  ),
  updateRequestStatus: action((req) =>
    buildingService.updateRequestStatus(req.params.id, req.body, req.user),
  ),
};
