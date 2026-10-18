import { apiClient } from "@/shared/api/client";

export type TargetEmployee = {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  department?: { id?: string; name: string; managerId?: string | null } | null;
  position?: { name: string } | null;
};
export type EmployeeTarget = {
  id: string;
  title: string;
  description?: string | null;
  metric: string;
  unit: string;
  targetValue: number;
  currentValue: number;
  startDate: string;
  dueDate: string;
  status: string;
  employee: TargetEmployee;
  createdBy: { id: string; name: string };
};
export const targetsApi = {
  list: () =>
    apiClient.get<EmployeeTarget[]>("/targets").then(({ data }) => data),
  assignees: () =>
    apiClient
      .get<TargetEmployee[]>("/targets/assignees")
      .then(({ data }) => data),
  create: (payload: Record<string, unknown>) =>
    apiClient
      .post<EmployeeTarget>("/targets", payload)
      .then(({ data }) => data),
  update: (id: string, payload: Record<string, unknown>) =>
    apiClient
      .patch<EmployeeTarget>(`/targets/${id}`, payload)
      .then(({ data }) => data),
};
