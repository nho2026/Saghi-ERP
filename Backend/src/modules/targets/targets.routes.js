import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validation.middleware.js";
import { createTargetSchema, updateTargetSchema } from "./targets.schema.js";
import { targetService } from "./targets.service.js";

const router = Router();
router.use(requireAuth);
const run = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res)).catch(next);
router.get(
  "/",
  run(async (req, res) =>
    res.json(await targetService.list(req.user, req.permissionKeys)),
  ),
);
router.get(
  "/assignees",
  run(async (req, res) =>
    res.json(await targetService.assignees(req.user, req.permissionKeys)),
  ),
);
router.post(
  "/",
  validate(createTargetSchema),
  run(async (req, res) =>
    res
      .status(201)
      .json(
        await targetService.create(
          req.user,
          req.permissionKeys,
          req.validatedBody,
        ),
      ),
  ),
);
router.patch(
  "/:id",
  validate(updateTargetSchema),
  run(async (req, res) =>
    res.json(
      await targetService.update(
        req.params.id,
        req.user,
        req.permissionKeys,
        req.validatedBody,
      ),
    ),
  ),
);
export default router;
