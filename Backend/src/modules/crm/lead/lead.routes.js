import { requireRequestPermission } from "../../../shared/middleware/permission.middleware.js";
import { Router } from "express";
import multer from "multer";
import path from "node:path";
import { mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { validate } from "../../../shared/middleware/validation.middleware.js";
import { leadController } from "./lead.controller.js";
import { leadSchema, leadUpdateSchema } from "./lead.schema.js";

const router = Router();
const attachmentDir = path.resolve(process.cwd(), "public", "lead-attachments");
mkdirSync(attachmentDir, { recursive: true });
const attachmentUpload = multer({
  storage: multer.diskStorage({
    destination: attachmentDir,
    filename: (_req, file, done) =>
      done(
        null,
        `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`,
      ),
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
});

const canView = requireRequestPermission;

const canManage = requireRequestPermission;

router.get("/", canView, leadController.list);
router.get("/:id", canView, leadController.get);
router.post(
  "/:id/attachments",
  canManage,
  attachmentUpload.array("files", 10),
  leadController.attachments,
);
router.delete(
  "/:id/attachments/:attachmentId",
  canManage,
  leadController.removeAttachment,
);
router.post("/", canManage, validate(leadSchema), leadController.create);
router.patch(
  "/:id",
  canManage,
  validate(leadUpdateSchema),
  leadController.update,
);
router.delete("/:id", canManage, leadController.remove);

export default router;
