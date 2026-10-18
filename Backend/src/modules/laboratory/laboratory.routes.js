import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.middleware.js";
import { laboratoryService as service } from "./laboratory.service.js";
import {
  uploadAttachment,
  addAttachment,
  getAttachment,
} from "./laboratory.attachments.js";

const router = Router();
router.use(requireAuth);
const run =
  (handler, status = 200) =>
  async (req, res, next) => {
    try {
      res.status(status).json(await handler(req));
    } catch (error) {
      next(error);
    }
  };
router.get(
  "/overview",
  run(() => service.overview()),
);
router.get(
  "/accounting-queue",
  run(() => service.accountingQueue()),
);
router.get(
  "/orders/:id/queue-position",
  run((req) => service.queuePosition(req.params.id)),
);
router.post(
  "/orders/:id/request-patient",
  run((req) => service.requestPatient(req.params.id, req.user.name)),
);
router.post(
  "/orders/:id/call-ticket",
  run((req) => service.callAccountingTicket(req.params.id, req.user.name)),
);
router.get(
  "/dashboard",
  run((req) =>
    service.dashboard(
      req.permissionKeys.has("*") ||
        req.permissionKeys.has("laboratory.payments.view"),
    ),
  ),
);
router.get(
  "/config",
  run(() => service.config()),
);
router.get(
  "/tests",
  run((req) => service.tests(req.query)),
);
router.post(
  "/tests",
  run((req) => service.createTest(req.body), 201),
);
router.patch(
  "/tests/:id",
  run((req) => service.updateTest(req.params.id, req.body)),
);
router.delete(
  "/tests/:id",
  run((req) => service.deleteTest(req.params.id)),
);
router.get(
  "/lookups/:resource",
  run((req) => service.lookup(req.params.resource, req.query)),
);
router.get(
  "/orders",
  run((req) => service.list(req.query)),
);
router.get(
  "/orders/:id",
  run((req) => service.get(req.params.id)),
);
router.post("/orders/:id/attachments", (req, res, next) => {
  uploadAttachment(req, res, (error) => {
    if (error)
      return next(
        Object.assign(
          new Error(
            error.code === "LIMIT_FILE_SIZE"
              ? "Attachments must be 5 MB or smaller."
              : "Invalid attachment upload.",
          ),
          { status: 400 },
        ),
      );
    run(async (request) => {
      await addAttachment(request.params.id, request.file, request.user.name);
      return service.get(request.params.id);
    }, 201)(req, res, next);
  });
});
router.get("/orders/:id/attachments/:attachmentId", async (req, res, next) => {
  try {
    const file = await getAttachment(req.params.id, req.params.attachmentId);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, no-store");
    res.type(file.mime);
    res.download(file.path, file.name, (error) => {
      if (error && !res.headersSent) next(error);
    });
  } catch (error) {
    next(error);
  }
});
router.post(
  "/orders",
  run((req) => {
    const keys = req.permissionKeys;
    if (!keys.has("*")) {
      const required = req.body?.leadId
        ? "crm.leads.update"
        : req.body?.patient
          ? "crm.patients.create"
          : undefined;
      if (required && !keys.has(required))
        throw Object.assign(new Error(`Missing permission: ${required}`), {
          status: 403,
        });
    }
    return service.create(req.body, req.user.name);
  }, 201),
);
router.post(
  "/orders/:id/pay",
  run((req) => service.pay(req.params.id, req.body)),
);
router.patch(
  "/orders/:id/stage",
  run((req) => service.advance(req.params.id, req.body, req.user.name)),
);
router.patch(
  "/orders/:id/results",
  run((req) => service.results(req.params.id, req.body)),
);
export default router;
