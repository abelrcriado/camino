// Repository para Favorite
import { BaseRepository } from "./base.repository";
import { supabase } from "../services/supabase";
import type { Favorite } from "@/shared/dto/favorite.dto";
import type { SupabaseClient } from "@supabase/supabase-js";

export class FavoriteRepository extends BaseRepository<Favorite> {
  constructor(client?: SupabaseClient) {
    super(client || supabase, "favorites");
  }

  /**
   * Buscar favoritos por usuario
   */
  async findByUser(userId: string) {
    return this.db.from(this.tableName).select("*").eq("user_id", userId);
  }

  /**
   * Buscar favoritos por service point
   */
  async findByServicePoint(servicePointId: string) {
    return this.db
      .from(this.tableName)
      .select("*")
      .eq("service_point_id", servicePointId);
  }

  /**
   * Verificar si existe favorito duplicado
   */
  async findDuplicate(userId: string, servicePointId: string) {
    return this.db
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId)
      .eq("service_point_id", servicePointId)
      .single();
  }
}
