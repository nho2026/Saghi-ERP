import { createHmac, timingSafeEqual } from "node:crypto";

export function captureWhatsappBody(req, _res, buffer) {
  // Match Express's case-insensitive routing and optional trailing slash.
  if (
    /^\/api\/crm\/whatsapp\/webhook\/?$/i.test(req.originalUrl.split("?")[0])
  ) {
    req.rawBody = buffer;
  }
}

export function verifyWhatsappSignature(body, signature, secret) {
  if (
    !secret ||
    !Buffer.isBuffer(body) ||
    !/^sha256=[a-f0-9]{64}$/.test(signature ?? "")
  )
    return false;
  const expected = createHmac("sha256", secret).update(body).digest();
  return timingSafeEqual(expected, Buffer.from(signature.slice(7), "hex"));
}

export function autoReplyConfigured(config) {
  return Boolean(
    config.whatsapp.autoReply &&
    config.anthropic.apiKey &&
    config.whatsapp.appSecret &&
    config.whatsapp.accessToken &&
    config.whatsapp.phoneNumberId,
  );
}

export async function generateReply(history, config, fetchImpl = fetch) {
  const messages = history
    .filter((item) => item.body?.trim() && item.messageType === "text")
    .map((item) => ({
      role: item.direction === "inbound" ? "user" : "assistant",
      content: item.body.slice(0, 6000),
    }));
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages.at(-1).role !== "user")
    throw new Error("No customer message to reply to.");
  const response = await fetchImpl("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
      ...(config.workspaceId
        ? { "anthropic-workspace-id": config.workspaceId }
        : {}),
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 700,
      system: config.systemPrompt,
      messages,
    }),
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) {
    let details;
    try {
      details = await response.json();
    } catch {
      /* Non-JSON upstream error. */
    }
    const needsWorkspace =
      /workspace/i.test(details?.error?.message ?? "") && !config.workspaceId;
    const error = new Error(
      `Claude request failed (${response.status}).${needsWorkspace ? " Set ANTHROPIC_WORKSPACE_ID to your Claude workspace ID, or use a workspace-scoped API key." : " Check API credentials, model access, billing, and rate limits."}`,
    );
    error.autoReplyDiagnostic = error.message;
    throw error;
  }
  const result = await response.json();
  const reply = (result.content ?? [])
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
  if (!reply) throw new Error("Claude returned no text.");
  return reply.slice(0, 4096);
}

// Claims are persisted before any external call; webhook retries cannot send twice.
export async function processAutoReply({
  db,
  config,
  send,
  generate = generateReply,
  now = new Date(),
}) {
  const pending = await db.crmWhatsappMessage.findFirst({
    where: { direction: "inbound", status: "ai_pending" },
    orderBy: { createdAt: "asc" },
  });
  if (!pending) return;
  const claimed = await db.crmWhatsappMessage.updateMany({
    where: { id: pending.id, status: "ai_pending" },
    data: { status: "ai_processing" },
  });
  if (!claimed.count) return;
  let status = "ai_failed";
  try {
    // Leave a margin before WhatsApp's 24-hour customer service window expires.
    if (now - new Date(pending.sentAt) > 23 * 60 * 60 * 1000) {
      status = "ai_skipped";
      return;
    }
    const recent = await db.crmWhatsappMessage.findMany({
      where: { conversationId: pending.conversationId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 20,
    });
    if (recent[0]?.id !== pending.id) {
      status = "ai_skipped";
      return;
    }
    const reply = await generate(recent.reverse(), config.anthropic);
    // A staff reply or a newer customer message supersedes this answer.
    const latest = await db.crmWhatsappMessage.findFirst({
      where: { conversationId: pending.conversationId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
    if (latest?.id !== pending.id) {
      status = "ai_skipped";
      return;
    }
    await send(pending.conversationId, reply);
    status = "ai_replied";
  } finally {
    await db.crmWhatsappMessage.update({
      where: { id: pending.id },
      data: { status },
    });
  }
}
