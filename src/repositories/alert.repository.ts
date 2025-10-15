// ============================================================================
// Sprint 7: Alerts System - Repository Layer
// ============================================================================

import { SupabaseClient } from "@supabase/supabase-js";
import { BaseRepository } from "./base.repository";
import { Alert, AlertFilters, AlertCountResponse } from "@/dto/alert.dto";
import { supabase as defaultSupabase } from "@/services/supabase";

export class AlertRepository extends BaseRepository<Alert> {
  constructor(db?: SupabaseClient) {
    super(db || defaultSupabase, "alerts");
  }

  /**
   * Contar alertas no leídas
   */
  async countUnread(): Promise<number> {
    try {
      const { count, error } = await this.db
        .from(this.tableName)
        .select("*", { count: "exact", head: true })
        .eq("leida", false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de alertas
   */
  async getStats(): Promise<AlertCountResponse> {
    try {
      // Total de alertas
      const { count: total } = await this.db
        .from(this.tableName)
        .select("*", { count: "exact", head: true });

      // Alertas no leídas
      const { count: no_leidas } = await this.db
        .from(this.tableName)
        .select("*", { count: "exact", head: true })
        .eq("leida", false);

      // Por severidad
      const { data: bySeverity } = await this.db
        .from(this.tableName)
        .select("severidad")
        .eq("leida", false);

      const por_severidad = {
        info: bySeverity?.filter((a) => a.severidad === "info").length || 0,
        warning: bySeverity?.filter((a) => a.severidad === "warning").length || 0,
        critical: bySeverity?.filter((a) => a.severidad === "critical").length || 0,
      };

      // Por tipo
      const { data: byTipo } = await this.db
        .from(this.tableName)
        .select("tipo")
        .eq("leida", false);

      const por_tipo = {
        low_stock_vending: byTipo?.filter((a) => a.tipo === "low_stock_vending").length || 0,
        low_stock_warehouse: byTipo?.filter((a) => a.tipo === "low_stock_warehouse").length || 0,
        machine_offline: byTipo?.filter((a) => a.tipo === "machine_offline").length || 0,
        machine_maintenance: byTipo?.filter((a) => a.tipo === "machine_maintenance").length || 0,
        stock_critical: byTipo?.filter((a) => a.tipo === "stock_critical").length || 0,
        restock_needed: byTipo?.filter((a) => a.tipo === "restock_needed").length || 0,
      };

      return {
        total: total || 0,
        no_leidas: no_leidas || 0,
        por_severidad,
        por_tipo,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Marcar alerta como leída
   */
  async marcarLeida(id: string, leida: boolean): Promise<Alert> {
    try {
      const { data, error } = await this.db
        .from(this.tableName)
        .update({ leida, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Marcar todas las alertas como leídas
   */
  async marcarTodasLeidas(): Promise<number> {
    try {
      const { count, error } = await this.db
        .from(this.tableName)
        .update({ leida: true, updated_at: new Date().toISOString() })
        .eq("leida", false)
        .select("*", { count: "exact" });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar alertas por entidad
   */
  async findByEntidad(
    entidadTipo: string,
    entidadId: string
  ): Promise<Alert[]> {
    try {
      const { data, error } = await this.db
        .from(this.tableName)
        .select("*")
        .eq("entidad_tipo", entidadTipo)
        .eq("entidad_id", entidadId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar alertas antiguas (más de X días)
   */
  async deleteOldAlerts(days: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { count, error } = await this.db
        .from(this.tableName)
        .delete()
        .lt("created_at", cutoffDate.toISOString())
        .eq("leida", true)
        .select("*", { count: "exact" });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      throw error;
    }
  }
}
