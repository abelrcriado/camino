// Base Repository para operaciones CRUD comunes
import { SupabaseClient } from "@supabase/supabase-js";
import type {
  PaginationParams,
  QueryFilters,
  SortParams,
} from "@/shared/types/common.types";

export abstract class BaseRepository<T> {
  constructor(protected db: SupabaseClient, protected tableName: string) {}

  /**
   * Encuentra todos los registros con filtros opcionales y paginación
   */
  async findAll(
    filters?: QueryFilters,
    pagination?: PaginationParams,
    sort?: SortParams
  ) {
    let query = this.db.from(this.tableName).select("*", { count: "exact" });

    // Aplicar filtros
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    // Aplicar ordenamiento
    if (sort) {
      query = query.order(sort.field, { ascending: sort.order === "asc" });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    // Aplicar paginación
    if (pagination) {
      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;
      query = query.range(from, to);
    }

    return query;
  }

  /**
   * Encuentra un registro por ID
   */
  async findById(id: string) {
    return this.db.from(this.tableName).select("*").eq("id", id).single();
  }

  /**
   * Crea un nuevo registro
   */
  async create(data: Partial<T>) {
    return this.db.from(this.tableName).insert([data]).select();
  }

  /**
   * Actualiza un registro por ID
   */
  async update(id: string, data: Partial<T>) {
    return this.db.from(this.tableName).update(data).eq("id", id).select();
  }

  /**
   * Elimina un registro por ID
   */
  async delete(id: string) {
    return this.db.from(this.tableName).delete().eq("id", id);
  }

  /**
   * Cuenta registros con filtros opcionales
   */
  async count(filters?: QueryFilters) {
    let query = this.db
      .from(this.tableName)
      .select("*", { count: "exact", head: true });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    return query;
  }
}
