// Repository para logs de auditoría de accesos QR
import { BaseRepository } from "./base.repository";
import { supabase } from "@/api/services/supabase";
import logger from "@/config/logger";
import type { AccessLog, AccessLogFilters } from "@/api/dto/qr.dto";
import type { SupabaseClient } from "@supabase/supabase-js";

export class AccessLogRepository extends BaseRepository<AccessLog> {
  constructor(db?: SupabaseClient) {
    super(db || supabase, "access_logs");
  }

  /**
   * Registra intento de validación QR (auditoría)
   * Este método NO lanza errores para no bloquear la operación principal
   */
  async logAccess(log: {
    transaction_id: string;
    user_id: string;
    location_id: string;
    qr_data?: string;
    validation_result:
      | "valid"
      | "invalid"
      | "expired"
      | "already_used"
      | "falsified";
    scanned_by?: string;
  }): Promise<void> {
    try {
      await this.db.from(this.tableName).insert({
        ...log,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // Log error pero no propagar (logging no debe bloquear validación)
      logger.error("Error al registrar log de acceso", { error });
    }
  }

  /**
   * Busca logs con filtros múltiples y paginación
   */
  async findWithFilters(filters: AccessLogFilters) {
    let query = this.db.from(this.tableName).select("*", { count: "exact" });

    // Aplicar filtros opcionales
    if (filters.user_id) {
      query = query.eq("user_id", filters.user_id);
    }

    if (filters.location_id) {
      query = query.eq("location_id", filters.location_id);
    }

    if (filters.transaction_id) {
      query = query.eq("transaction_id", filters.transaction_id);
    }

    if (filters.validation_result) {
      query = query.eq("validation_result", filters.validation_result);
    }

    if (filters.from) {
      query = query.gte("timestamp", filters.from);
    }

    if (filters.to) {
      query = query.lte("timestamp", filters.to);
    }

    // Aplicar paginación
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    // Ordenar por timestamp descendente (más recientes primero)
    query = query.order("timestamp", { ascending: false });

    return query;
  }

  /**
   * Obtiene logs por transaction_id
   */
  async findByTransactionId(transactionId: string) {
    return this.db
      .from(this.tableName)
      .select("*")
      .eq("transaction_id", transactionId)
      .order("timestamp", { ascending: false });
  }

  /**
   * Obtiene logs por user_id
   */
  async findByUserId(userId: string) {
    return this.db
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false });
  }

  /**
   * Cuenta logs por resultado de validación
   */
  async countByValidationResult(result: string) {
    const { count } = await this.db
      .from(this.tableName)
      .select("*", { count: "exact", head: true })
      .eq("validation_result", result);

    return count || 0;
  }
}
