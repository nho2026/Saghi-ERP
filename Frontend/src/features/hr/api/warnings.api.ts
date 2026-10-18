import { apiClient } from "@/shared/api/client";
export type AudienceOptions = {
  roles: { id: string; name: string }[];
  departments: { id: string; name: string }[];
  users: {
    id: string;
    name: string;
    employee: { employeeCode: string } | null;
  }[];
};
export type WarningRecord = {
  id: string;
  title: string;
  message: string;
  severity: string;
  createdAt: string;
  sender: { id: string; name: string };
  _count: { recipients: number };
};
export const warningsApi = {
  options: () =>
    apiClient
      .get<AudienceOptions>("/employees/warnings/audience")
      .then((r) => r.data),
  list: () =>
    apiClient.get<WarningRecord[]>("/employees/warnings").then((r) => r.data),
  send: (data: Record<string, unknown>) =>
    apiClient.post("/employees/warnings", data),
};
