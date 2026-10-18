import { env } from "../../../config/environment.js";
import { prisma } from "../../../shared/database/client.js";
import { whatsappService } from "./whatsapp.service.js";
import { autoReplyConfigured, processAutoReply } from "./whatsapp.ai.js";

export function startWhatsappAutoReplies() {
  if (!autoReplyConfigured(env)) {
    if (env.whatsapp.autoReply)
      console.warn(
        "WhatsApp auto-reply requires Anthropic and Meta credentials; worker is disabled.",
      );
    return async () => {};
  }
  let active;
  const timer = setInterval(() => {
    if (active) return;
    active = processAutoReply({
      db: prisma,
      config: env,
      send: (id, body) => whatsappService.send(id, body),
    })
      .catch((error) =>
        console.error(
          "WhatsApp auto-reply failed; inspect inbound ai_failed/ai_processing messages. No automatic resend.",
          error.autoReplyDiagnostic ??
            "Check database connectivity and WhatsApp delivery credentials.",
        ),
      )
      .finally(() => {
        active = null;
      });
  }, 2000);
  timer.unref();
  return async () => {
    clearInterval(timer);
    await active;
  };
}
