// Repository para Report
import { BaseRepository } from "./base.repository";
import { supabase } from "../services/supabase";
import type { Report } from "../dto/report.dto";
import type { SupabaseClient } from "@supabase/supabase-js";

export class ReportRepository extends BaseRepository<Report> {
  constructor(supabaseClient?: SupabaseClient) {
    super(supabaseClient || supabase, "reports");
  }

  /**
   * Buscar reportes por tipo
   */
  async findByType(type: string) {
    return this.db.from(this.tableName).select("*").eq("type", type);
  }

  /**
   * Buscar reportes por estado
   */
  async findByStatus(status: string) {
    return this.db.from(this.tableName).select("*").eq("status", status);
  }

  /**
   * Buscar reportes por usuario
   */
  async findByUser(userId: string) {
    return this.db.from(this.tableName).select("*").eq("user_id", userId);
  }

  /**
   * Buscar reportes por service point
   */
  async findByServicePoint(servicePointId: string) {
    return this.db
      .from(this.tableName)
      .select("*")
      .eq("service_point_id", servicePointId);
  }
}
