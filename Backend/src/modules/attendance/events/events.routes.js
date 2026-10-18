import { Router } from "express";
import { validate } from "../../../shared/middleware/validation.middleware.js";
import { eventsController as c } from "./events.controller.js";
import { syncEventsSchema } from "./events.schema.js";
import { requirePermission } from "../../../shared/middleware/permission.middleware.js";
import { subscribeToAttendanceEvents } from "./events.live.js";
const router = Router(),
  view = requirePermission("employees.view"),
  manage = requirePermission("employees.manage");
router.get("/", view, c.list);
router.get("/stream", view, (req, res) => {
  res.status(200).set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();
  res.write(
    `event: connected\ndata: ${JSON.stringify({ connected: true })}\n\n`,
  );
  let closed = false;
  const unsubscribe = subscribeToAttendanceEvents((event) => {
      if (!res.destroyed && !res.writableEnded)
        res.write(`event: attendance\ndata: ${JSON.stringify(event)}\n\n`);
    }),
    heartbeat = setInterval(() => {
      if (!res.destroyed && !res.writableEnded) res.write(": keep-alive\n\n");
    }, 20000),
    close = () => {
      if (closed) return;
      closed = true;
      clearInterval(heartbeat);
      unsubscribe();
    };
  res.on("close", close);
  req.on("aborted", close);
});
router.post("/sync", manage, validate(syncEventsSchema), c.sync);
export default router;
