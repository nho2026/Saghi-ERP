import { apiClient } from "@/shared/api/client";
export type RecordItem = Record<string, any> & { id: string };
export type PageData = {
  items: RecordItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
export type StoragePageData = PageData & {
  totals: { products: number; quantity: number; buy: number; sell: number };
};
export type ExpiryPageData = PageData & {
  warehouses: RecordItem[];
  categories: RecordItem[];
  today: string;
};
export const inventoryApi = {
  stockSummary: () =>
    apiClient
      .get<
        {
          warehouseId: string;
          total: number;
          units: number;
          empty: number;
          low: number;
        }[]
      >("/inventory/stock/summary")
      .then((response) => response.data),
  expiry: (page = 1, filters: Record<string, string> = {}) =>
    apiClient
      .get<ExpiryPageData>("/inventory/expiry", {
        params: { page, pageSize: 50, ...filters },
      })
      .then((response) => response.data),
  storage: (page = 1, filters: Record<string, string> = {}) =>
    apiClient
      .get<StoragePageData>("/inventory/storage", {
        params: { page, pageSize: 10, ...filters },
      })
      .then((response) => response.data),
  list: (resource: string, page = 1, filters: Record<string, string> = {}) =>
    apiClient
      .get<PageData>(`/inventory/${resource}`, {
        params: { page, pageSize: 50, ...filters },
      })
      .then((r) => r.data),
  all: (resource: string) =>
    apiClient
      .get<RecordItem[]>(`/inventory/${resource}`, { params: { all: true } })
      .then((r) => r.data),
  create: (resource: string, data: Record<string, unknown>) =>
    apiClient.post(`/inventory/${resource}`, data),
  update: (resource: string, id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/inventory/${resource}/${id}`, data),
  remove: (resource: string, id: string) =>
    apiClient.delete(`/inventory/${resource}/${id}`),
  newBarcode: () =>
    apiClient
      .get<{ barcode: string }>("/inventory/products/barcode/new")
      .then((response) => response.data.barcode),
  addBarcode: (id: string, barcode: string) =>
    apiClient
      .patch<RecordItem>(`/inventory/products/${id}/barcode`, { barcode })
      .then((response) => response.data),
  removeBarcode: (id: string) =>
    apiClient.delete(`/inventory/products/${id}/barcode`),
  adjust: (data: Record<string, unknown>) =>
    apiClient.post("/inventory/adjust", data),
  removeImage: (imageUrl: string) =>
    apiClient.delete("/inventory/products/images", { data: { imageUrl } }),
  uploadImages: (files: File[]) => {
    const body = new FormData();
    files.forEach((file) => body.append("images", file));
    return apiClient
      .post<{ imageUrl: string }[]>("/inventory/products/images", body, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};
export const productImageUrl = (url?: string) =>
  url
    ? url.startsWith("http")
      ? url
      : `${(import.meta.env.VITE_API_URL ?? "").replace(/\/api\/?$/, "")}${url}`
    : "";
export const posApi = {
  list: (page = 1, filters: Record<string, string> = {}) =>
    apiClient
      .get<PageData>("/pos/sales", {
        params: { page, pageSize: 50, ...filters },
      })
      .then((r) => r.data),
  create: (data: Record<string, unknown>) =>
    apiClient.post("/pos/sales", data).then((r) => r.data),
  cancel: (id: string, password: string) =>
    apiClient.post(`/pos/sales/${id}/cancel`, { password }),
  returnByNumber: (saleNumber: string) =>
    apiClient.post("/pos/sales/return", { saleNumber }).then((r) => r.data),
};
