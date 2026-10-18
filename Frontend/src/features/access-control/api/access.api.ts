import { apiClient } from "@/shared/api/client";
import type { Permission, Role, User } from "../types/access.types";

export const usersApi = {
  storageOptions: async () =>
    (
      await apiClient.get<{ id: string; name: string }[]>(
        "/users/storage-options",
      )
    ).data,
  list: async () => (await apiClient.get<User[]>("/users")).data,
  create: async (payload: Record<string, unknown>) =>
    (await apiClient.post<User>("/users", payload)).data,
  update: async (id: string, payload: Record<string, unknown>) =>
    (await apiClient.patch<User>(`/users/${id}`, payload)).data,
  remove: async (id: string) => apiClient.delete(`/users/${id}`),
  unlockAttempts: async (id: string) =>
    apiClient.post(`/users/${id}/unlock-attempts`),
};

export const rolesApi = {
  list: async () => (await apiClient.get<Role[]>("/roles")).data,
  create: async (payload: {
    name: string;
    description?: string;
    permissionIds: string[];
  }) => (await apiClient.post<Role>("/roles", payload)).data,
  update: async (id: string, payload: Partial<Role>) =>
    (await apiClient.patch<Role>(`/roles/${id}`, payload)).data,
  remove: async (id: string) => apiClient.delete(`/roles/${id}`),
  assignPermissions: async (id: string, permissionIds: string[]) =>
    (
      await apiClient.put<Role>(`/roles/${id}/permissions`, {
        permissionIds,
      })
    ).data,
};

export const permissionsApi = {
  list: async () => (await apiClient.get<Permission[]>("/permissions")).data,
};
