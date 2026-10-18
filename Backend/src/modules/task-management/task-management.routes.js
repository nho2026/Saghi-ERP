import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.middleware.js";
import tasks from "./tasks/tasks.routes.js";
const router = Router();
router.use(requireAuth);
router.use("/", tasks);
export default router;
