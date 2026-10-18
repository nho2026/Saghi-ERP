import { apiClient } from "@/shared/api/client";

export type HealthcareRecord = Record<string, unknown> & { id: string };
const resource = (path: string) => ({
  list: () =>
    apiClient.get<HealthcareRecord[]>(path).then((response) => response.data),
  create: (data: Record<string, unknown>) =>
    apiClient.post(path, data).then((response) => response.data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`${path}/${id}`, data).then((response) => response.data),
  remove: (id: string) => apiClient.delete(`${path}/${id}`),
});

export const healthcareApi = {
  specializations: resource("/healthcare/specializations"),
  departments: {
    ...resource("/healthcare/departments"),
    removeMany: (ids: string[]) =>
      apiClient.delete("/healthcare/departments/bulk", { data: { ids } }),
  },
  staff: resource("/healthcare/staff"),
  appointments: resource("/crm/appointments"),
};
