import { verifyWhatsappSignature } from "./whatsapp.ai.js";
import { env } from "../../../config/environment.js";
import multer from "multer";
import { requireRequestPermission } from "../../../shared/middleware/permission.middleware.js";
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../../shared/middleware/auth.middleware.js";
import { validate } from "../../../shared/middleware/validation.middleware.js";
import { whatsappService } from "./whatsapp.service.js";

const router = Router();
const handle = (handler) => async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (error) {
    next(error);
  }
};
const canView = requireRequestPermission;
const canManage = requireRequestPermission;

router.get(
  "/webhook",
  handle(async (req, res) => {
    const challenge = whatsappService.verify(
      req.query["hub.mode"],
      req.query["hub.verify_token"],
      req.query["hub.challenge"],
    );
    res.status(200).send(challenge);
  }),
);
router.post(
  "/webhook",
  handle(async (req, res) => {
    if (
      (env.whatsapp.appSecret || env.whatsapp.autoReply) &&
      !verifyWhatsappSignature(
        req.rawBody,
        req.get("x-hub-signature-256"),
        env.whatsapp.appSecret,
      )
    ) {
      console.warn(
        "WhatsApp webhook rejected: signature verification failed. Check WHATSAPP_APP_SECRET against Meta App Settings > Basic (not the verify token), and ensure the proxy preserves the body and x-hub-signature-256 header.",
      );
      return res
        .status(403)
        .json({ message: "Invalid WhatsApp webhook signature." });
    }
    await whatsappService.receive(req.body);
    res.sendStatus(200);
  }),
);
router.use(requireAuth);
router.get(
  "/status",
  canView,
  handle(async (_req, res) => res.json(whatsappService.status())),
);
router.get(
  "/conversations",
  canView,
  handle(async (_req, res) => res.json(await whatsappService.list())),
);
router.get(
  "/conversations/:id",
  canView,
  handle(async (req, res) =>
    res.json(await whatsappService.get(req.params.id)),
  ),
);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 16 * 1024 * 1024, files: 1, fields: 3 },
}).single("file");
router.get(
  "/messages/:id/media",
  canView,
  handle(async (req, res) => {
    const media = await whatsappService.media(req.params.id);
    res
      .set({
        "Content-Type": media.mime,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      })
      .send(media.buffer);
  }),
);
router.post(
  "/conversations/:id/messages",
  canManage,
  (req, res, next) =>
    upload(req, res, (error) => {
      if (error)
        return res
          .status(400)
          .json({
            message:
              error.code === "LIMIT_FILE_SIZE"
                ? "Files must be 16 MB or smaller."
                : "Invalid attachment upload.",
          });
      next();
    }),
  handle(async (req, res) => {
    if (req.file) {
      const input = z
        .object({
          body: z.string().trim().max(1024).optional(),
          voice: z.enum(["true", "false"]).optional(),
        })
        .parse(req.body);
      return res
        .status(201)
        .json(
          await whatsappService.sendMedia(
            req.params.id,
            req.file,
            input.voice === "true",
            input.body,
          ),
        );
    }
    const { body } = z
      .object({ body: z.string().trim().min(1).max(4096) })
      .parse(req.body);
    res.status(201).json(await whatsappService.send(req.params.id, body));
  }),
);

export default router;
