import "dotenv/config";

export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? "development-only-secret",
  pinLookupSecret: process.env.PIN_LOOKUP_SECRET ?? "development-pin-secret",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  publicWebsiteUrls: (process.env.PUBLIC_WEBSITE_URLS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
  production: process.env.NODE_ENV === "production",
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    workspaceId: (process.env.ANTHROPIC_WORKSPACE_ID ?? "").trim(),
    model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
    systemPrompt:
      process.env.WHATSAPP_AI_SYSTEM_PROMPT ??
      "You are the automated customer service assistant for SAGHI. Reply briefly in the customer’s language. Identify yourself as an automated assistant. Do not invent prices, availability, policies, or completed actions. When information is missing, ask a clarifying question or suggest contacting staff. You cannot access ERP records or perform actions.",
  },
  whatsapp: {
    autoReply: process.env.WHATSAPP_AUTO_REPLY === "true",
    appSecret: process.env.WHATSAPP_APP_SECRET ?? "",
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN ?? "",
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN ?? "",
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? "",
    graphVersion: process.env.WHATSAPP_GRAPH_VERSION ?? "v26.0",
  },
};
