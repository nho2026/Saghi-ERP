import { apiClient } from "@/shared/api/client";

export type WhatsappMessage = {
  id: string;
  externalId?: string | null;
  direction: "inbound" | "outbound";
  messageType: string;
  body?: string | null;
  status: string;
  sentAt: string;
};
export type WhatsappConversation = {
  channel: "whatsapp" | "messenger" | "instagram" | "tiktok";
  isDemo: boolean;
  id: string;
  phone: string;
  profileName?: string | null;
  lastMessageAt: string;
  lead?: {
    id: string;
    code?: string | null;
    name: string;
    phone: string;
    status: string;
  } | null;
  messages: WhatsappMessage[];
};

export const whatsappApi = {
  sendFile: (id: string, file: File, body: string, voice: boolean) => {
    const form = new FormData();
    form.set("file", file);
    form.set("body", body);
    form.set("voice", String(voice));
    return apiClient
      .post<WhatsappMessage>(
        `/crm/whatsapp/conversations/${id}/messages`,
        form,
        { headers: { "Content-Type": "multipart/form-data" }, timeout: 120000 },
      )
      .then(({ data }) => data);
  },
  media: (id: string) =>
    apiClient
      .get<Blob>(`/crm/whatsapp/messages/${id}/media`, { responseType: "blob" })
      .then(({ data }) => data),
  status: () =>
    apiClient
      .get<{
        configured: boolean;
        phoneNumberId: string | null;
        graphVersion: string;
      }>("/crm/whatsapp/status")
      .then(({ data }) => data),
  conversations: () =>
    apiClient
      .get<WhatsappConversation[]>("/crm/whatsapp/conversations")
      .then(({ data }) => data),
  conversation: (id: string) =>
    apiClient
      .get<WhatsappConversation>(`/crm/whatsapp/conversations/${id}`)
      .then(({ data }) => data),
  send: (id: string, body: string) =>
    apiClient
      .post<WhatsappMessage>(`/crm/whatsapp/conversations/${id}/messages`, {
        body,
      })
      .then(({ data }) => data),
};
