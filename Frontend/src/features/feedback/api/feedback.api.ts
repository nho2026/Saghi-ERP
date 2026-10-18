import { apiClient } from "@/shared/api/client";
export type Feedback = {
  id: string;
  targetType: "product" | "service";
  customerName: string;
  customerEmail: string | null;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  product?: { id: string; name: string; sku: string };
  service?: { id: string; name: string; code: string };
  createdAt: string;
};
export type FeedbackPage = {
  items: Feedback[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
export type FeedbackSummary = {
  average: number;
  count: number;
  distribution: { rating: number; count: number }[];
  products: {
    targetId: string;
    targetName: string;
    count: number;
    average: number;
  }[];
  services: {
    targetId: string;
    targetName: string;
    count: number;
    average: number;
  }[];
};
export const feedbackApi = {
  list: (params: Record<string, string | number | undefined>) =>
    apiClient.get<FeedbackPage>("/feedback", { params }).then((r) => r.data),
  summary: () =>
    apiClient.get<FeedbackSummary>("/feedback/summary").then((r) => r.data),
  status: (id: string, status: string) =>
    apiClient.patch(`/feedback/${id}/status`, { status }),
  remove: (id: string) => apiClient.delete(`/feedback/${id}`),
};
