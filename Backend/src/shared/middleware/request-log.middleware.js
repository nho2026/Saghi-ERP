import { STATUS_CODES } from "node:http";
import { performance } from "node:perf_hooks";

export function requestLog(req, res, next) {
  const startedAt = performance.now();
  const client = String(req.socket?.remoteAddress ?? "unknown").replace(
    /^::ffff:/,
    "",
  );
  const port = req.socket?.remotePort;
  // Query strings can contain credentials; log only the request path.
  const path = (req.originalUrl ?? req.url).split("?")[0];
  let logged = false;
  const log = (aborted = false) => {
    if (logged) return;
    logged = true;
    const duration = (performance.now() - startedAt).toFixed(1);
    const status = aborted
      ? "ABORTED"
      : `${res.statusCode} ${STATUS_CODES[res.statusCode] ?? ""}`;
    console.log(
      `INFO: ${client}${port ? `:${port}` : ""} - ${JSON.stringify(`${req.method} ${path} HTTP/${req.httpVersion}`)} ${status} ${duration}ms`,
    );
  };
  res.once("finish", () => log());
  res.once("close", () => log(!res.writableFinished));
  next();
}
