// Repository para Partner
import { BaseRepository } from "./base.repository";
import { supabase } from "../services/supabase";
import type { Partner } from "../dto/partner.dto";
import type { SupabaseClient } from "@supabase/supabase-js";

export class PartnerRepository extends BaseRepository<Partner> {
  constructor(client?: SupabaseClient) {
    super(client || supabase, "partners");
  }

  /**
   * Buscar partners por tipo
   */
  async findByType(type: string) {
    return this.db.from(this.tableName).select("*").eq("type", type);
  }
}
