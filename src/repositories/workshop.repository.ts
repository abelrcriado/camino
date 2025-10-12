// Repository para Workshop
import { BaseRepository } from "./base.repository";
import { supabase } from "../services/supabase";
import type { Workshop } from "../dto/workshop.dto";
import type { SupabaseClient } from "@supabase/supabase-js";

export class WorkshopRepository extends BaseRepository<Workshop> {
  constructor(client?: SupabaseClient) {
    super(client || supabase, "workshops");
  }

  /**
   * Buscar workshops por service point
   */
  async findByServicePoint(servicePointId: string) {
    return this.db
      .from(this.tableName)
      .select("*")
      .eq("service_point_id", servicePointId);
  }
}
