import { apiClient } from "@/shared/api/client";
import type { Page } from "@/shared/api/pagination";

export type AuditLog = {
  id: string;
  userId: string | null;
  userName: string | null;
  method: string;
  path: string;
  module: string;
  action: "login" | "create" | "update" | "delete";
  statusCode: number;
  ipAddress: string | null;
  userAgent: string | null;
  details: Record<string, unknown> | null;
  durationMs: number;
  createdAt: string;
};

export type AuditLogPage = Page<AuditLog> & { modules: string[] };

export const systemLogsApi = {
  list: (params: Record<string, string | number | undefined>) =>
    apiClient
      .get<AuditLogPage>("/system-logs", { params })
      .then(({ data }) => data),
};
