import { apiClient } from "@/shared/api/client";
export type Customer = {
  id: string;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  status: string;
};
export type Invoice = {
  id: string;
  invoiceNumber: string;
  customerId: string;
  issueDate: string;
  dueDate?: string;
  currency: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: string;
  notes?: string;
  customer: Customer;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    lineTotal: number;
  }>;
};
export type Payment = {
  id: string;
  amount: number;
  method: string;
  reference?: string;
  paidAt: string;
  invoice: Invoice;
};
export type ServiceAdvance = {
  id: string;
  receiptNumber: string;
  patientName: string;
  patientPhone?: string;
  departmentId?: string;
  appointmentId?: string;
  amount: number;
  appliedAmount: number;
  balanceAmount: number;
  currency: string;
  method: string;
  reference?: string;
  receivedAt: string;
  status: string;
  notes?: string;
  department?: { id: string; name: string } | null;
};
export const billingApi = {
  customers: {
    list: () =>
      apiClient.get<Customer[]>("/billing/customers").then((r) => r.data),
    create: (d: Record<string, unknown>) =>
      apiClient.post("/billing/customers", d),
    remove: (id: string) => apiClient.delete(`/billing/customers/${id}`),
  },
  invoices: {
    list: () =>
      apiClient.get<Invoice[]>("/billing/invoices").then((r) => r.data),
    create: (d: Record<string, unknown>) =>
      apiClient.post("/billing/invoices", d),
    status: (id: string, status: string) =>
      apiClient.patch(`/billing/invoices/${id}/status`, { status }),
    remove: (id: string) => apiClient.delete(`/billing/invoices/${id}`),
  },
  payments: {
    list: () =>
      apiClient.get<Payment[]>("/billing/payments").then((r) => r.data),
    create: (d: Record<string, unknown>) =>
      apiClient.post("/billing/payments", d),
  },
  serviceAdvances: {
    list: () =>
      apiClient.get<ServiceAdvance[]>("/advances/service").then((r) => r.data),
    create: (d: Record<string, unknown>) =>
      apiClient.post("/advances/service", d),
    update: (id: string, d: Record<string, unknown>) =>
      apiClient.patch(`/advances/service/${id}`, d),
    remove: (id: string) => apiClient.delete(`/advances/service/${id}`),
  },
};
