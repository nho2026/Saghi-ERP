import { apiClient } from "@/shared/api/client";

export type Meeting = {
  id: string;
  title: string;
  roomCode: string;
  status: string;
  createdAt: string;
  endedAt?: string | null;
  department: { id: string; name: string } | null;
  creator: { id: string; name: string };
  participants?: {
    id?: string;
    userId?: string;
    joinedAt?: string;
    leftAt?: string | null;
  }[];
};
export type MeetingDepartment = { id: string; name: string; code: string };

export const meetingsApi = {
  list: () => apiClient.get<Meeting[]>("/meetings").then((r) => r.data),
  history: () =>
    apiClient.get<Meeting[]>("/meetings/history").then((r) => r.data),
  departments: () =>
    apiClient
      .get<MeetingDepartment[]>("/meetings/departments")
      .then((r) => r.data),
  create: (title: string, departmentId: string) =>
    apiClient
      .post<Meeting>("/meetings", { title, departmentId })
      .then((r) => r.data),
};
