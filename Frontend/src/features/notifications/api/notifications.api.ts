import { apiClient } from "@/shared/api/client";

export type NotificationItem = {
  title?: string;
  body?: string;
  route?: string;
  id: string;
  type:
    | "department_order_requested"
    | "appointment_reminder"
    | "meeting_reminder"
    | "task_assigned"
    | "task_status_updated"
    | "task_review_requested"
    | "warning"
    | "meeting_created";
  readAt: string | null;
  createdAt: string;
  task: {
    id: string;
    title: string;
    priority: string;
    dueDate: string | null;
  } | null;
  warning: {
    id: string;
    title: string;
    message: string;
    severity: string;
  } | null;
  meeting: {
    id: string;
    title: string;
    roomCode: string;
    department: { id: string; name: string };
  } | null;
};
export type NotificationList = {
  items: NotificationItem[];
  unreadCount: number;
};

export const notificationsApi = {
  list: () =>
    apiClient
      .get<NotificationList>("/notifications")
      .then((response) => response.data),
  markRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.patch("/notifications/read-all"),
};
