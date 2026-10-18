import { Router } from "express";
import { requireAuth } from "../../../shared/middleware/auth.middleware.js";
import { requireAnyPermission } from "../../../shared/middleware/permission.middleware.js";
import { validate } from "../../../shared/middleware/validation.middleware.js";
import { billingController } from "./billing.controller.js";
import {
  customerSchema,
  invoiceSchema,
  invoiceStatusSchema,
  paymentSchema,
} from "./billing.schema.js";
const router = Router();
const access = (permission, legacy) => requireAnyPermission(permission, legacy);
router.use(requireAuth);
router.get(
  "/customers",
  access("accounting.customers.view", "finance.view"),
  billingController.listCustomers,
);
router.post(
  "/customers",
  access("accounting.customers.create", "journal.create"),
  validate(customerSchema),
  billingController.createCustomer,
);
router.patch(
  "/customers/:id",
  access("accounting.customers.update", "journal.create"),
  validate(customerSchema.partial()),
  billingController.updateCustomer,
);
router.delete(
  "/customers/:id",
  access("accounting.customers.delete", "journal.create"),
  billingController.deleteCustomer,
);
router.get(
  "/invoices",
  access("accounting.invoices.view", "finance.view"),
  billingController.listInvoices,
);
router.post(
  "/invoices",
  access("accounting.invoices.create", "journal.create"),
  validate(invoiceSchema),
  billingController.createInvoice,
);
router.patch(
  "/invoices/:id/status",
  access("accounting.invoices.update", "journal.create"),
  validate(invoiceStatusSchema),
  billingController.updateInvoiceStatus,
);
router.delete(
  "/invoices/:id",
  access("accounting.invoices.delete", "journal.create"),
  billingController.deleteInvoice,
);
router.get(
  "/payments",
  access("accounting.payments.view", "finance.view"),
  billingController.listPayments,
);
router.post(
  "/payments",
  access("accounting.payments.create", "journal.create"),
  validate(paymentSchema),
  billingController.createPayment,
);
export default router;
