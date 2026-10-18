import { apiClient } from "@/shared/api/client";

export type Account = {
  id: string;
  code: string;
  name: string;
  type: string;
  currency: string;
  status: string;
  parent?: Account | null;
};
export type JournalLine = {
  id?: string;
  accountId: string;
  description?: string;
  debit: number;
  credit: number;
  account?: Account;
};
export type Journal = {
  id: string;
  entryNumber: string;
  entryDate: string;
  description: string;
  reference?: string;
  status: string;
  lines: JournalLine[];
};
export type AccountingReport = {
  totals: { debit: number; credit: number };
  pagination?: import("@/shared/api/pagination").Pagination;
  trialBalance: Array<Account & { debit: number; credit: number }>;
  profitLoss: { revenue: number; expenses: number; netIncome: number };
  balanceSheet: { assets: number; liabilities: number; equity: number };
};

export const accountingApi = {
  accounts: {
    list: () =>
      apiClient.get<Account[]>("/accounting/accounts").then((r) => r.data),
    create: (data: Record<string, unknown>) =>
      apiClient.post("/accounting/accounts", data),
    update: (id: string, data: Record<string, unknown>) =>
      apiClient.patch(`/accounting/accounts/${id}`, data),
    remove: (id: string) => apiClient.delete(`/accounting/accounts/${id}`),
  },
  journals: {
    list: () =>
      apiClient.get<Journal[]>("/accounting/journals").then((r) => r.data),
    create: (data: Record<string, unknown>) =>
      apiClient.post("/accounting/journals", data),
    post: (id: string) => apiClient.post(`/accounting/journals/${id}/post`),
    remove: (id: string) => apiClient.delete(`/accounting/journals/${id}`),
  },
  reports: () =>
    apiClient.get<AccountingReport>("/accounting/reports").then((r) => r.data),
};
