import { apiClient } from "@/shared/api/client";
export type Device = {
  id: string;
  name: string;
  model: string;
  ipAddress: string;
  port: number;
  username: string;
  serialNumber?: string;
  status: string;
  lastSeenAt?: string;
};
export type Person = {
  id: string;
  deviceId: string;
  employeeId?: string;
  employeeNo: string;
  name: string;
  cardNo?: string;
  hasFingerprint: boolean;
  hasFace: boolean;
  hasPassword: boolean;
  device?: { name: string };
  employee?: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    user?: { id: string; name: string; username: string };
  };
};
export type AttendanceEvent = {
  id: string;
  employeeNo: string;
  personName?: string;
  eventType: string;
  occurredAt: string;
  verification?: string;
  device: { name: string };
  person?: { id: string; employeeId?: string };
};
export type DeviceSyncResult = {
  synced: number;
  errors: { deviceId: string; deviceName: string; message: string }[];
};
export const attendanceApi = {
  devices: () =>
    apiClient.get<Device[]>("/attendance/devices").then((r) => r.data),
  addDevice: (data: Record<string, unknown>) =>
    apiClient.post<Device>("/attendance/devices", data).then((r) => r.data),
  updateDevice: (id: string, data: Record<string, unknown>) =>
    apiClient
      .patch<Device>(`/attendance/devices/${id}`, data)
      .then((r) => r.data),
  deleteDevice: (id: string, password: string) =>
    apiClient.delete(`/attendance/devices/${id}`, { data: { password } }),
  clearDeviceEvents: (id: string, password: string) =>
    apiClient.delete<{ deleted: number; clearedAt: string }>(
      `/attendance/devices/${id}/events`,
      { data: { password } },
    ),
  testDevice: (id: string) =>
    apiClient.post(`/attendance/devices/${id}/test`, undefined, {
      timeout: 45_000,
    }),
  people: (deviceId?: string) =>
    apiClient
      .get<Person[]>("/attendance/people", {
        params: { deviceId },
        timeout: 45_000,
      })
      .then((r) => r.data),
  syncPeople: (deviceId?: string) =>
    apiClient
      .post<DeviceSyncResult>(
        "/attendance/people/sync",
        { deviceId },
        {
          timeout: 120_000,
        },
      )
      .then((r) => r.data),
  addPerson: (data: Record<string, unknown>) =>
    apiClient
      .post<Person>("/attendance/people", data, { timeout: 45_000 })
      .then((r) => r.data),
  updatePerson: (id: string, data: Record<string, unknown>) =>
    apiClient
      .patch<Person>(`/attendance/people/${id}`, data)
      .then((r) => r.data),
  deletePerson: (id: string, password: string) =>
    apiClient.delete(`/attendance/people/${id}`, { data: { password } }),
  removeCredential: (
    id: string,
    method: "card" | "fingerprint" | "face" | "pin",
  ) =>
    apiClient
      .delete<Person>(`/attendance/people/${id}/${method}`, {
        timeout: 60_000,
      })
      .then((r) => r.data),
  enroll: (
    id: string,
    method: "card" | "fingerprint" | "face" | "pin",
    payload: Record<string, string> = {},
  ) =>
    apiClient
      .post<Person>(`/attendance/people/${id}/${method}`, payload, {
        timeout: 600_000,
      })
      .then((r) => r.data),
  events: (params: Record<string, string>) =>
    apiClient
      .get<AttendanceEvent[]>("/attendance/events", { params })
      .then((r) => r.data),
  sync: (data: Record<string, string>) =>
    apiClient
      .post<DeviceSyncResult>("/attendance/events/sync", data, {
        timeout: 180_000,
      })
      .then((response) => response.data),
};

export const attendanceEventsStreamUrl = () => {
  const base = import.meta.env.VITE_API_URL ?? "/api";
  return `${base.replace(/\/$/, "")}/attendance/events/stream`;
};
