export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type Page<T> = { items: T[]; pagination: Pagination };

export const DEFAULT_PAGE_SIZE = 10;
