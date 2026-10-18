import { apiClient } from "@/shared/api/client";
export type MyTask = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string | null;
  createdBy: { id: string; name: string };
};
export type Idea = {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
};
export type EmployeeWarning = {
  warningId: string;
  readAt: string | null;
  warning: {
    id: string;
    title: string;
    message: string;
    severity: string;
    createdAt: string;
    sender: { id: string; name: string };
  };
};
export const employeePortalApi = {
  tasks: () =>
    apiClient.get<MyTask[]>("/employee-portal/my-tasks").then((r) => r.data),
  ideas: () =>
    apiClient.get<Idea[]>("/employee-portal/ideas").then((r) => r.data),
  submitIdea: (data: { title: string; description: string }) =>
    apiClient.post<Idea>("/employee-portal/ideas", data).then((r) => r.data),
  warnings: () =>
    apiClient
      .get<EmployeeWarning[]>("/employee-portal/warnings")
      .then((r) => r.data),
};
