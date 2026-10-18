import { apiBaseUrl } from "@/shared/api/base-url";

export type ConnectionStatus =
  "checking" | "online" | "offline" | "unreachable";
let status: ConnectionStatus = navigator.onLine ? "checking" : "offline";
const listeners = new Set<() => void>();
let interval: ReturnType<typeof setInterval> | undefined;
let pending: AbortController | undefined;

function publish(next: ConnectionStatus) {
  if (status === next) return;
  status = next;
  for (const listener of listeners) listener();
}

function disconnected() {
  pending?.abort();
  pending = undefined;
  publish("offline");
}

async function check() {
  if (!navigator.onLine) return disconnected();
  if (pending) return;
  const controller = new AbortController();
  pending = controller;
  const timeout = setTimeout(() => controller.abort(), 2000);
  try {
    const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/health`, {
      cache: "no-store",
      credentials: "omit",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    const body = response.ok ? await response.json() : null;
    if (pending === controller) {
      publish(
        !navigator.onLine
          ? "offline"
          : body?.status === "ok"
            ? "online"
            : "unreachable",
      );
    }
  } catch {
    if (pending === controller)
      publish(navigator.onLine ? "unreachable" : "offline");
  } finally {
    clearTimeout(timeout);
    if (pending === controller) pending = undefined;
  }
}

function recheck() {
  void check();
}
function visibilityChanged() {
  if (document.visibilityState === "visible") recheck();
}

export const connectionSnapshot = () => status;
export function subscribeToConnection(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    window.addEventListener("offline", disconnected);
    window.addEventListener("online", recheck);
    window.addEventListener("focus", recheck);
    window.addEventListener("nho:connection-error", recheck);
    document.addEventListener("visibilitychange", visibilityChanged);
    interval = setInterval(recheck, 3000);
    recheck();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size) return;
    clearInterval(interval);
    pending?.abort();
    pending = undefined;
    window.removeEventListener("offline", disconnected);
    window.removeEventListener("online", recheck);
    window.removeEventListener("focus", recheck);
    window.removeEventListener("nho:connection-error", recheck);
    document.removeEventListener("visibilitychange", visibilityChanged);
  };
}
