// Repository para Booking
import { BaseRepository } from "./base.repository";
import { supabase } from "../services/supabase";
import type { Booking, BookingFilters } from "@/shared/dto/booking.dto";
import type { PaginationParams } from "@/shared/types/common.types";
import { SupabaseClient } from "@supabase/supabase-js";

export class BookingRepository extends BaseRepository<Booking> {
  constructor(db?: SupabaseClient) {
    super(db || supabase, "bookings");
  }

  /**
   * Sobrescribe findAll para manejar filtros de fecha específicos de Booking
   */
  override async findAll(
    filters?: BookingFilters,
    pagination?: PaginationParams
  ) {
    let query = this.db.from(this.tableName).select("*", { count: "exact" });

    // Aplicar filtros estándar
    if (filters) {
      const { start_date, end_date, ...standardFilters } = filters;

      // Filtros estándar (user_id, service_point_id, etc.)
      Object.entries(standardFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      // Filtros de rango de fechas
      if (start_date) {
        query = query.gte("start_time", start_date);
      }
      if (end_date) {
        query = query.lte("end_time", end_date);
      }
    }

    // Aplicar paginación
    if (pagination) {
      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;
      query = query.range(from, to);
    }

    // Ordenamiento al final (después de paginación)
    query = query.order("start_time", { ascending: false });

    return query;
  }

  /**
   * Buscar bookings activos (pending o confirmed)
   */
  async findActive() {
    return this.db
      .from(this.tableName)
      .select("*")
      .in("status", ["pending", "confirmed"])
      .order("start_time", { ascending: true });
  }

  /**
   * Buscar bookings por usuario y estado
   */
  async findByUserAndStatus(userId: string, status: string) {
    return this.db
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId)
      .eq("status", status)
      .order("start_time", { ascending: false });
  }

  /**
   * Buscar bookings próximos (en los próximos N días)
   */
  async findUpcoming(days: number = 7) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.db
      .from(this.tableName)
      .select("*")
      .gte("start_time", now.toISOString())
      .lte("start_time", futureDate.toISOString())
      .in("status", ["pending", "confirmed"])
      .order("start_time", { ascending: true });
  }
}
