import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.middleware.js";
import { notificationModel } from "./notifications.model.js";

const router = Router();
router.use(requireAuth);
router.get("/", async (req, res, next) => {
  try {
    res.json(await notificationModel.list(req.user.id));
  } catch (error) {
    next(error);
  }
});
router.patch("/read-all", async (req, res, next) => {
  try {
    await notificationModel.markAllRead(req.user.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
router.patch("/:id/read", async (req, res, next) => {
  try {
    await notificationModel.markRead(req.params.id, req.user.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
export default router;
