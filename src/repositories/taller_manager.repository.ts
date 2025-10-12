// Repository para Taller Manager
import { BaseRepository } from "./base.repository";
import { supabase } from "../services/supabase";
import type { TallerManager } from "../dto/taller_manager.dto";
import type { SupabaseClient } from "@supabase/supabase-js";

export class TallerManagerRepository extends BaseRepository<TallerManager> {
  constructor(client?: SupabaseClient) {
    super(client || supabase, "taller_managers");
  }

  /**
   * Buscar gestores por workshop
   */
  async findByWorkshop(workshopId: string) {
    return this.db
      .from(this.tableName)
      .select("*")
      .eq("workshop_id", workshopId);
  }

  /**
   * Buscar gestores por usuario
   */
  async findByUser(userId: string) {
    return this.db.from(this.tableName).select("*").eq("user_id", userId);
  }
}
