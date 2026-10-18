import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validation.middleware.js";
import { authController } from "./auth.controller.js";
import { loginSchema, profileSchema } from "./auth.schema.js";

const router = Router();
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", requireAuth, authController.me);
router.get("/profile", requireAuth, authController.profile);
router.patch(
  "/profile",
  requireAuth,
  validate(profileSchema),
  authController.updateProfile,
);
router.get("/profile/events", requireAuth, authController.profileEvents);
router.post("/logout", authController.logout);
export default router;
