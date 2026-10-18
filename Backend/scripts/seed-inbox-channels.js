import "dotenv/config";
import { prisma } from "../src/shared/database/client.js";

try {
  for (const [index, channel] of ["whatsapp", "messenger", "instagram", "tiktok"].entries()) {
    const phone = `120255501${String(30 + index)}`;
    const start = new Date(Date.now() - (4 - index) * 60000);
    await prisma.$transaction(async (tx) => {
      const existing = await tx.crmWhatsappConversation.findUnique({ where: { phone } });
      if (existing && !existing.isDemo) throw new Error(`Sample number already belongs to a non-demo conversation: ${channel}`);
      const conversation = await tx.crmWhatsappConversation.upsert({
        where: { phone }, update: {},
        create: { phone, channel, isDemo: true, profileName: `Demo ${channel[0].toUpperCase() + channel.slice(1)} Contact`, lastMessageAt: start },
      });
      for (const [messageIndex, body] of [
        `Hello from ${channel}! Can I book an appointment?`,
        "[Demo reply — not sent] Yes, what day works for you?",
        "Tomorrow afternoon, please. Thank you!",
      ].entries()) {
        await tx.crmWhatsappMessage.upsert({
          where: { externalId: `seed.inbox.${channel}.v1.${messageIndex}` }, update: {},
          create: { externalId: `seed.inbox.${channel}.v1.${messageIndex}`, conversationId: conversation.id,
            direction: messageIndex === 1 ? "outbound" : "inbound", messageType: "text", body,
            status: messageIndex === 1 ? "sent" : "received", sentAt: new Date(start.getTime() - (2 - messageIndex) * 10000),
            rawPayload: { demo: true, actuallySent: false } },
        });
      }
      console.log(`${channel}: demo conversation ready (3 sample messages).`);
    });
  }
  console.log("Inbox seed complete. No external messages sent or queued.");
} finally { await prisma.$disconnect(); }
