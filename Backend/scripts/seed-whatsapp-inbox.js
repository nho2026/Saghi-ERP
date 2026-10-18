import "dotenv/config";
import { prisma } from "../src/shared/database/client.js";
import { whatsappService } from "../src/modules/crm/whatsapp/whatsapp.service.js";

// Fictional NANP 555 number. Database-only sample; never calls send().
const phone = "12025550123";
try {
  const start = Date.now() - 4 * 60_000;
  const messages = [
    { direction: "inbound", body: "Hello! This is a test conversation. I would like to ask about an appointment." },
    { direction: "outbound", body: "[Demo reply — not sent] Welcome! Which day would you prefer?" },
    { direction: "inbound", body: "Tomorrow afternoon, please. What times are available?" },
    { direction: "inbound", body: "Thank you! This conversation is sample data for testing the inbox." },
  ];
  await whatsappService.receive({ entry: [{ changes: [{ value: {
    contacts: [{ wa_id: phone, profile: { name: "Demo Contact — Test Inbox" } }],
    messages: messages.flatMap((message, index) => message.direction === "inbound" ? [{
      id: `seed.whatsapp.inbox.v1.${index}`, from: phone, type: "text",
      text: { body: message.body }, timestamp: String(Math.floor((start + index * 60_000) / 1000)),
    }] : []),
  } }] }] });
  const conversation = await prisma.crmWhatsappConversation.findUniqueOrThrow({ where: { phone } });
  await prisma.crmWhatsappMessage.upsert({
    where: { externalId: "seed.whatsapp.inbox.v1.1" }, update: {},
    create: { externalId: "seed.whatsapp.inbox.v1.1", conversationId: conversation.id,
      direction: "outbound", messageType: "text", body: messages[1].body,
      status: "sent", sentAt: new Date(start + 60_000), rawPayload: { demo: true, actuallySent: false } },
  });
  const saved = await whatsappService.get(conversation.id);
  console.log(JSON.stringify({ name: saved.profileName, messages: saved.messages.length, linkedLead: Boolean(saved.lead), externalMessagesSent: 0 }));
} finally { await prisma.$disconnect(); }
