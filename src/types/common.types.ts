// Tipos comunes para toda la aplicación

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface QueryFilters {
  [key: string]: string | number | boolean | undefined;
}

export interface SupabaseResponse<T> {
  data: T[] | null;
  error: {
    message: string;
    code?: string;
    details?: string;
  } | null;
  count?: number | null;
}

export interface DatabaseError {
  message: string;
  code?: string;
  details?: string;
}

export type SortOrder = "asc" | "desc";

export interface SortParams {
  field: string;
  order: SortOrder;
}
