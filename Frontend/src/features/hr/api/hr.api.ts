import { apiClient } from "@/shared/api/client";

export type HrRecord = Record<string, unknown> & { id: string };
const resource = (path: string) => ({
  list: (params?: Record<string, string | number>) =>
    apiClient
      .get<HrRecord[]>(path, { params })
      .then((response) => response.data),
  create: (data: Record<string, unknown>) =>
    apiClient.post(path, data).then((response) => response.data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`${path}/${id}`, data).then((response) => response.data),
  remove: (id: string) => apiClient.delete(`${path}/${id}`),
});

export const hrApi = {
  positions: resource("/employees/positions"),
  employees: resource("/employees"),
  salaries: resource("/employees/records/salaries"),
  attendance: resource("/employees/records/attendance"),
  payrolls: resource("/employees/records/payrolls"),
  adjustments: resource("/employees/records/payroll-adjustments"),
  advances: resource("/advances/salary"),
};

export const attendancePermissionsApi = {
  ...resource("/employees/records/attendance-permissions"),
  remove: (id: string, password: string) =>
    apiClient.delete(`/employees/records/attendance-permissions/${id}`, {
      data: { password },
    }),
};
