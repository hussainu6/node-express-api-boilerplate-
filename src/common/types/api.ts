export interface ApiMeta {
  requestId?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: ApiMeta;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export const defaultPagination = { page: 1, limit: 20 };
