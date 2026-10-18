import { billingService } from "./billing.service.js";
const handle = (handler) => async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (error) {
    next(error);
  }
};
export const billingController = {
  listCustomers: handle(async (_req, res) =>
    res.json(await billingService.listCustomers(_req.query)),
  ),
  createCustomer: handle(async (req, res) =>
    res
      .status(201)
      .json(await billingService.createCustomer(req.validatedBody)),
  ),
  updateCustomer: handle(async (req, res) =>
    res.json(
      await billingService.updateCustomer(req.params.id, req.validatedBody),
    ),
  ),
  deleteCustomer: handle(async (req, res) => {
    await billingService.deleteCustomer(req.params.id);
    res.status(204).end();
  }),
  listInvoices: handle(async (req, res) =>
    res.json(await billingService.listInvoices(req.query.status, req.query)),
  ),
  createInvoice: handle(async (req, res) =>
    res.status(201).json(await billingService.createInvoice(req.validatedBody)),
  ),
  updateInvoiceStatus: handle(async (req, res) =>
    res.json(
      await billingService.updateInvoiceStatus(
        req.params.id,
        req.validatedBody.status,
      ),
    ),
  ),
  deleteInvoice: handle(async (req, res) => {
    await billingService.deleteInvoice(req.params.id);
    res.status(204).end();
  }),
  listPayments: handle(async (_req, res) =>
    res.json(await billingService.listPayments(_req.query)),
  ),
  createPayment: handle(async (req, res) =>
    res.status(201).json(await billingService.recordPayment(req.validatedBody)),
  ),
};
