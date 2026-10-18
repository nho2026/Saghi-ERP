import { apiClient } from "@/shared/api/client";
export type LabTest = {
  id: string;
  code: string;
  name: string;
  specimen: string;
  price: string;
  unit: string | null;
  referenceRange: string | null;
  status: string;
};
export type LabItem = {
  id: string;
  testName: string;
  specimen: string;
  price: string;
  unit: string | null;
  referenceRange: string | null;
  result: string | null;
  resultNotes: string | null;
};
export type LabOrder = {
  accountingCalledAt: string | null;
  attachments:
    { id: string; name: string; mime: string; size: number }[] | null;
  id: string;
  queueDay: string;
  queueNumber: number;
  status: string;
  notes: string | null;
  createdAt: string;
  completedAt: string | null;
  contactedAt: string | null;
  deliveredAt: string | null;
  patient: {
    id: string;
    patientCode: string;
    firstName: string;
    lastName: string;
    phone: string;
    address?: string | null;
  };
  lead: { id: string; name: string; code: string } | null;
  appointment: { id: string; scheduledAt: string; patientName: string } | null;
  invoice: {
    payments: { id: string; amount: number; method: string; paidAt: string }[];
    id: string;
    invoiceNumber: string;
    currency: string;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    status: string;
  };
  items: LabItem[];
};
export type LabChoice = {
  id: string;
  name?: string;
  code?: string;
  firstName?: string;
  lastName?: string;
  patientCode?: string;
  phone?: string;
  address?: string | null;
  patientPhone?: string;
  patientName?: string;
  scheduledAt?: string;
  price?: string;
};
export const labApi = {
  queuePosition: (id: string) =>
    apiClient
      .get<{
        ahead: number;
        active: boolean;
        queue: "accounting" | "laboratory";
      }>(`/laboratory/orders/${id}/queue-position`)
      .then((r) => r.data),
  requestPatient: (id: string) =>
    apiClient
      .post<LabOrder>(`/laboratory/orders/${id}/request-patient`)
      .then((r) => r.data),
  accountingQueue: () =>
    apiClient
      .get<{ tickets: LabOrder[]; total: number }>(
        "/laboratory/accounting-queue",
      )
      .then((r) => r.data),
  callTicket: (id: string) =>
    apiClient
      .post<LabOrder>(`/laboratory/orders/${id}/call-ticket`)
      .then((r) => r.data),
  getOrder: (id: string) =>
    apiClient.get<LabOrder>(`/laboratory/orders/${id}`).then((r) => r.data),
  dashboard: () =>
    apiClient
      .get<{
        today: string;
        stages: Record<string, number>;
        todayRequests: number;
        activeTests: number;
        patients: number;
        examinations: { name: string; specimen: string; count: number }[];
        recent: {
          id: string;
          queueNumber: number;
          queueDay: string;
          status: string;
          patient: { firstName: string; lastName: string; patientCode: string };
        }[];
        currencies: {
          currency: string;
          invoiced: number;
          paid: number;
          balance: number;
        }[];
        methods: {
          currency: string;
          method: string;
          amount: number;
          total: number;
        }[];
      }>("/laboratory/dashboard")
      .then((r) => r.data),
  overview: () =>
    apiClient
      .get<Record<string, number>>("/laboratory/overview")
      .then((r) => r.data),
  attach: (id: string, file: File) => {
    const body = new FormData();
    body.append("file", file);
    return apiClient
      .post<LabOrder>(`/laboratory/orders/${id}/attachments`, body, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
  attachment: (id: string, attachmentId: string) =>
    apiClient
      .get<Blob>(`/laboratory/orders/${id}/attachments/${attachmentId}`, {
        responseType: "blob",
      })
      .then((r) => r.data),
  config: () =>
    apiClient
      .get<{ currency: string; paymentMethods: string[] }>("/laboratory/config")
      .then((r) => r.data),
  createOrder: (body: unknown) =>
    apiClient.post<LabOrder>("/laboratory/orders", body).then((r) => r.data),
  stage: (id: string, status: string) =>
    apiClient
      .patch<LabOrder>(`/laboratory/orders/${id}/stage`, { status })
      .then((r) => r.data),
  results: (id: string, items: unknown[]) =>
    apiClient
      .patch<LabOrder>(`/laboratory/orders/${id}/results`, { items })
      .then((r) => r.data),
  pay: (id: string, body: unknown) =>
    apiClient
      .post<LabOrder>(`/laboratory/orders/${id}/pay`, body)
      .then((r) => r.data),
  saveTest: (id: string | undefined, body: unknown) =>
    apiClient.request({
      method: id ? "PATCH" : "POST",
      url: `/laboratory/tests${id ? `/${id}` : ""}`,
      data: body,
    }),
  deleteTest: (id: string) => apiClient.delete(`/laboratory/tests/${id}`),
};
export function choiceLabel(choice: LabChoice) {
  return (
    choice.name ??
    (choice.firstName
      ? `${choice.firstName} ${choice.lastName ?? ""} · ${choice.patientCode}`
      : `${choice.patientName} · ${new Date(choice.scheduledAt ?? "").toLocaleString()}`)
  );
}
