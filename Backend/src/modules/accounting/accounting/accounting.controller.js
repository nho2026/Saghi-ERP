import { accountingService } from "./accounting.service.js";
const handle = (handler) => async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (error) {
    next(error);
  }
};
export const accountingController = {
  listAccounts: handle(async (_req, res) =>
    res.json(await accountingService.listAccounts(_req.query)),
  ),
  createAccount: handle(async (req, res) =>
    res
      .status(201)
      .json(await accountingService.createAccount(req.validatedBody)),
  ),
  updateAccount: handle(async (req, res) =>
    res.json(
      await accountingService.updateAccount(req.params.id, req.validatedBody),
    ),
  ),
  deleteAccount: handle(async (req, res) => {
    await accountingService.deleteAccount(req.params.id);
    res.status(204).end();
  }),
  listJournals: handle(async (_req, res) =>
    res.json(await accountingService.listJournals(_req.query)),
  ),
  createJournal: handle(async (req, res) =>
    res
      .status(201)
      .json(await accountingService.createJournal(req.validatedBody)),
  ),
  postJournal: handle(async (req, res) =>
    res.json(await accountingService.postJournal(req.params.id)),
  ),
  deleteJournal: handle(async (req, res) => {
    await accountingService.deleteJournal(req.params.id);
    res.status(204).end();
  }),
  reports: handle(async (req, res) =>
    res.json(await accountingService.reports(req.query)),
  ),
};
