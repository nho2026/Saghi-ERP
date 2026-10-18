import { autoReplyConfigured } from "./whatsapp.ai.js";
import { prepareMedia } from "./whatsapp.media.js";
import { randomBytes } from "node:crypto";
import { prisma } from "../../../shared/database/client.js";
import { env } from "../../../config/environment.js";

function requireLiveWhatsapp(conversation) {
  if (conversation.channel !== "whatsapp" || conversation.isDemo)
    throw Object.assign(
      new Error(
        "Sending is unavailable for demo or disconnected-channel conversations.",
      ),
      { status: 409 },
    );
}

const normalizePhone = (value = "") => String(value).replace(/\D/g, "");
const leadCode = (phone) =>
  `WA-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${phone.slice(-6)}-${randomBytes(2).toString("hex").toUpperCase()}`;

const textFromMessage = (message) => {
  if (message.text?.body) return message.text.body;
  if (message.button?.text) return message.button.text;
  if (message.interactive?.button_reply?.title)
    return message.interactive.button_reply.title;
  if (message.interactive?.list_reply?.title)
    return message.interactive.list_reply.title;
  if (message.image?.caption) return message.image.caption;
  if (message.document?.caption) return message.document.caption;
  return null;
};

async function ensureConversation(tx, phoneValue, profileName) {
  const phone = normalizePhone(phoneValue);
  if (!phone)
    throw Object.assign(new Error("WhatsApp phone is missing."), {
      status: 400,
    });
  let lead = await tx.crmLead.findFirst({
    where: {
      OR: [{ whatsappPhone: phone }, { phone }, { phone: `+${phone}` }],
    },
  });
  if (!lead) {
    lead = await tx.crmLead.create({
      data: {
        code: leadCode(phone),
        name: profileName?.trim() || `WhatsApp ${phone}`,
        phone: `+${phone}`,
        whatsappPhone: phone,
        source: "WhatsApp",
        leadSourceChannel: "digital",
        contactMethod: "whatsapp",
        status: "new",
      },
    });
    await tx.crmLeadStatusHistory.create({
      data: { leadId: lead.id, toStatus: "new" },
    });
  } else if (
    !lead.whatsappPhone ||
    (profileName && lead.name.startsWith("WhatsApp "))
  ) {
    lead = await tx.crmLead.update({
      where: { id: lead.id },
      data: {
        whatsappPhone: phone,
        ...(profileName && lead.name.startsWith("WhatsApp ")
          ? { name: profileName.trim() }
          : {}),
      },
    });
  }
  return tx.crmWhatsappConversation.upsert({
    where: { phone },
    create: { phone, profileName: profileName || lead.name, leadId: lead.id },
    update: {
      leadId: lead.id,
      ...(profileName ? { profileName: profileName.trim() } : {}),
      lastMessageAt: new Date(),
    },
  });
}

export const whatsappService = {
  verify(mode, token, challenge) {
    if (
      mode === "subscribe" &&
      env.whatsapp.verifyToken &&
      token === env.whatsapp.verifyToken
    )
      return challenge;
    throw Object.assign(new Error("WhatsApp webhook verification failed."), {
      status: 403,
    });
  },
  async receive(payload) {
    const changes = (payload.entry ?? []).flatMap(
      (entry) => entry.changes ?? [],
    );
    for (const change of changes) {
      const value = change.value ?? {};
      for (const status of value.statuses ?? []) {
        await prisma.crmWhatsappMessage.updateMany({
          where: { externalId: status.id, direction: "outbound" },
          data: { status: status.status },
        });
      }
      if (
        value.messages?.length &&
        env.whatsapp.phoneNumberId &&
        String(value.metadata?.phone_number_id ?? "") !==
          env.whatsapp.phoneNumberId.trim()
      ) {
        console.warn(
          "WhatsApp webhook skipped: metadata.phone_number_id does not match WHATSAPP_PHONE_NUMBER_ID. Use Meta's phone number ID, not the display phone number.",
        );
        continue;
      }
      for (const message of value.messages ?? []) {
        if (!message.id || !message.from) continue;
        const contact = (value.contacts ?? []).find(
          (item) => normalizePhone(item.wa_id) === normalizePhone(message.from),
        );
        await prisma.$transaction(async (tx) => {
          const conversation = await ensureConversation(
            tx,
            message.from,
            contact?.profile?.name,
          );
          await tx.crmWhatsappMessage.upsert({
            where: { externalId: message.id },
            create: {
              externalId: message.id,
              conversationId: conversation.id,
              direction: "inbound",
              messageType: message.type ?? "unknown",
              body: textFromMessage(message),
              status:
                autoReplyConfigured(env) &&
                message.type === "text" &&
                message.text?.body?.trim()
                  ? "ai_pending"
                  : "received",
              sentAt: message.timestamp
                ? new Date(Number(message.timestamp) * 1000)
                : new Date(),
              rawPayload: message,
            },
            update: {},
          });
        });
      }
    }
  },
  list: () =>
    prisma.crmWhatsappConversation.findMany({
      include: {
        lead: {
          select: {
            id: true,
            code: true,
            name: true,
            phone: true,
            status: true,
          },
        },
        messages: { orderBy: { sentAt: "desc" }, take: 1 },
      },
      orderBy: { lastMessageAt: "desc" },
    }),
  get: (id) =>
    prisma.crmWhatsappConversation.findUniqueOrThrow({
      where: { id },
      include: {
        lead: {
          select: {
            id: true,
            code: true,
            name: true,
            phone: true,
            status: true,
          },
        },
        messages: { orderBy: { sentAt: "asc" }, take: 500 },
      },
    }),
  status: () => ({
    configured: Boolean(
      env.whatsapp.accessToken &&
      env.whatsapp.phoneNumberId &&
      env.whatsapp.verifyToken,
    ),
    autoReplyEnabled: env.whatsapp.autoReply,
    autoReplyConfigured: autoReplyConfigured(env),
    phoneNumberId: env.whatsapp.phoneNumberId || null,
    graphVersion: env.whatsapp.graphVersion,
  }),
  async sendMedia(conversationId, file, voice = false, caption = "") {
    if (!env.whatsapp.accessToken || !env.whatsapp.phoneNumberId)
      throw Object.assign(new Error("WhatsApp Cloud API is not configured."), {
        status: 503,
      });
    const conversation = await prisma.crmWhatsappConversation.findUniqueOrThrow(
      { where: { id: conversationId } },
    );
    requireLiveWhatsapp(conversation);
    const media = await prepareMedia(file, voice);
    const headers = { Authorization: `Bearer ${env.whatsapp.accessToken}` };
    const base = `https://graph.facebook.com/${env.whatsapp.graphVersion}`;
    const form = new FormData();
    form.set("messaging_product", "whatsapp");
    form.set("type", media.mime);
    form.set(
      "file",
      new Blob([media.buffer], { type: media.mime }),
      media.filename,
    );
    const upload = await fetch(`${base}/${env.whatsapp.phoneNumberId}/media`, {
      method: "POST",
      headers,
      body: form,
      signal: AbortSignal.timeout(60000),
    });
    const uploaded = await upload.json();
    if (!upload.ok || !uploaded.id)
      throw Object.assign(
        new Error(uploaded.error?.message || "Media upload failed."),
        { status: 502 },
      );
    const payload = {
      id: uploaded.id,
      ...(media.type === "document" ? { filename: media.filename } : {}),
      ...(["image", "video", "document"].includes(media.type) && caption
        ? { caption }
        : {}),
    };
    const response = await fetch(
      `${base}/${env.whatsapp.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: conversation.phone,
          type: media.type,
          [media.type]: payload,
        }),
        signal: AbortSignal.timeout(30000),
      },
    );
    const result = await response.json();
    if (!response.ok)
      throw Object.assign(
        new Error(result.error?.message || "Media message failed."),
        { status: 502 },
      );
    const message = await prisma.crmWhatsappMessage.create({
      data: {
        conversationId,
        externalId: result.messages?.[0]?.id,
        direction: "outbound",
        messageType: media.type,
        body: caption || media.filename,
        status: "sent",
        rawPayload: {
          [media.type]: {
            id: uploaded.id,
            mime_type: media.mime,
            filename: media.filename,
          },
          voice,
        },
      },
    });
    await prisma.crmWhatsappConversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });
    return message;
  },
  async media(messageId) {
    const message = await prisma.crmWhatsappMessage.findUniqueOrThrow({
      where: { id: messageId },
    });
    const media = message.rawPayload?.[message.messageType];
    if (!media?.id)
      throw Object.assign(new Error("This attachment is unavailable."), {
        status: 404,
      });
    const headers = { Authorization: `Bearer ${env.whatsapp.accessToken}` };
    const lookup = await fetch(
      `https://graph.facebook.com/${env.whatsapp.graphVersion}/${encodeURIComponent(media.id)}`,
      { headers, signal: AbortSignal.timeout(15000) },
    );
    const data = await lookup.json();
    if (!lookup.ok || !data.url)
      throw Object.assign(
        new Error("The attachment is no longer available from WhatsApp."),
        { status: 502 },
      );
    const response = await fetch(data.url, {
      headers,
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok)
      throw Object.assign(new Error("Attachment download failed."), {
        status: 502,
      });
    return {
      buffer: Buffer.from(await response.arrayBuffer()),
      mime: media.mime_type || data.mime_type || "application/octet-stream",
    };
  },
  async send(conversationId, body) {
    if (!env.whatsapp.accessToken || !env.whatsapp.phoneNumberId)
      throw Object.assign(new Error("WhatsApp Cloud API is not configured."), {
        status: 503,
      });
    const conversation = await prisma.crmWhatsappConversation.findUniqueOrThrow(
      { where: { id: conversationId } },
    );
    requireLiveWhatsapp(conversation);
    const response = await fetch(
      `https://graph.facebook.com/${env.whatsapp.graphVersion}/${env.whatsapp.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.whatsapp.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: conversation.phone,
          type: "text",
          text: { preview_url: false, body },
        }),
        signal: AbortSignal.timeout(30000),
      },
    );
    const result = await response.json();
    if (!response.ok)
      throw Object.assign(
        new Error(result.error?.message || "WhatsApp message failed."),
        { status: 502 },
      );
    const message = await prisma.crmWhatsappMessage.create({
      data: {
        externalId: result.messages?.[0]?.id,
        conversationId,
        direction: "outbound",
        messageType: "text",
        body,
        status: "sent",
      },
    });
    await prisma.crmWhatsappConversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });
    return message;
  },
};
