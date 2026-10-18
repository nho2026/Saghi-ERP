import { useCallback, useState } from "react";
import { apiClient } from "@/shared/api/client";
import type { Page } from "@/shared/api/pagination";
import { useApiResource } from "./useApiResource";

export function useServerTable<T, Meta extends object = object>(
  endpoint: string,
  filters: Record<string, string | number | undefined> = {},
  enabled = true,
  pageSize = 20,
) {
  const key = JSON.stringify([endpoint, filters, enabled, pageSize]);
  const [position, setPosition] = useState({ key, page: 1 });
  const page = position.key === key ? position.page : 1;
  const params = JSON.stringify({ ...filters, page, pageSize });
  const result = useApiResource(
    useCallback(async () => {
      if (!enabled)
        return {
          items: [],
          pagination: { page: 1, pageSize, total: 0, totalPages: 1 },
        } as Page<T> & Meta;
      const data = (
        await apiClient.get<Page<T> & Meta>(endpoint, {
          params: JSON.parse(params),
        })
      ).data;
      if (
        !data ||
        !Array.isArray(data.items) ||
        !data.pagination ||
        !Number.isInteger(data.pagination.page) ||
        data.pagination.page < 1 ||
        !Number.isInteger(data.pagination.totalPages) ||
        data.pagination.totalPages < 1 ||
        !Number.isInteger(data.pagination.total) ||
        data.pagination.total < 0
      ) {
        throw new Error("Invalid paginated response from server.");
      }
      return data;
    }, [endpoint, params, enabled, pageSize]),
  );
  const pagination = {
    page: result.data?.pagination?.page ?? page,
    totalPages: result.data?.pagination?.totalPages ?? 1,
    total: result.data?.pagination?.total ?? 0,
    onPageChange: (next: number) => setPosition({ key, page: next }),
    disabled: result.isLoading,
  };
  return {
    ...result,
    pageData: result.data,
    data: result.data?.items ?? null,
    pagination,
    tableProps: { autoPaginate: false as const, pagination },
  };
}
