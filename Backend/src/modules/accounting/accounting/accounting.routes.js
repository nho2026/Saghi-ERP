import { Router } from "express";
import { requireAuth } from "../../../shared/middleware/auth.middleware.js";
import { requireAnyPermission } from "../../../shared/middleware/permission.middleware.js";
import { validate } from "../../../shared/middleware/validation.middleware.js";
import { accountingController } from "./accounting.controller.js";
import { accountSchema, journalSchema } from "./accounting.schema.js";
const router = Router();
const access = (permission, legacy) => requireAnyPermission(permission, legacy);
router.use(requireAuth);
router.get(
  "/accounts",
  access("accounting.accounts.view", "finance.view"),
  accountingController.listAccounts,
);
router.post(
  "/accounts",
  access("accounting.accounts.create", "journal.create"),
  validate(accountSchema),
  accountingController.createAccount,
);
router.patch(
  "/accounts/:id",
  access("accounting.accounts.update", "journal.create"),
  validate(accountSchema.partial()),
  accountingController.updateAccount,
);
router.delete(
  "/accounts/:id",
  access("accounting.accounts.delete", "journal.create"),
  accountingController.deleteAccount,
);
router.get(
  "/journals",
  access("accounting.journals.view", "finance.view"),
  accountingController.listJournals,
);
router.post(
  "/journals",
  access("accounting.journals.create", "journal.create"),
  validate(journalSchema),
  accountingController.createJournal,
);
router.post(
  "/journals/:id/post",
  access("accounting.journals.post", "journal.create"),
  accountingController.postJournal,
);
router.delete(
  "/journals/:id",
  access("accounting.journals.delete", "journal.create"),
  accountingController.deleteJournal,
);
router.get(
  "/reports",
  access("accounting.reports.view", "reports.generate"),
  accountingController.reports,
);
export default router;
