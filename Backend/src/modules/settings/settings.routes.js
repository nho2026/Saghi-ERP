import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.middleware.js";
import { allSettings, saveSettings, getSettings } from "./settings.service.js";
import { createBackup, listBackups } from "./settings.backups.js";
const router = Router();
const run = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res)).catch(next);
router.get(
  "/logo",
  run(async (_req, res) => {
    const { logo, name } = await getSettings("organization");
    res.set("Cache-Control", "no-store").json({ logo, name });
  }),
);
router.use(requireAuth);
router.get(
  "/runtime",
  run(async (_req, res) => res.json(await allSettings())),
);
router.get(
  "/",
  run(async (_req, res) => res.json(await allSettings())),
);
router.get(
  "/backups",
  run(async (_req, res) => res.json(await listBackups())),
);
router.post(
  "/backups",
  run(async (_req, res) => res.status(201).json(await createBackup())),
);
router.put(
  "/:category",
  run(async (req, res) =>
    res.json(await saveSettings(req.params.category, req.body)),
  ),
);
export default router;
