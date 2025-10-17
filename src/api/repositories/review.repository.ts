// Repository para Review
import { BaseRepository } from "./base.repository";
import { supabase } from "../services/supabase";
import type { Review } from "@/shared/dto/review.dto";
import type { SupabaseClient } from "@supabase/supabase-js";

export class ReviewRepository extends BaseRepository<Review> {
  constructor(client?: SupabaseClient) {
    super(client || supabase, "reviews");
  }

  /**
   * Buscar reviews por usuario
   */
  async findByUser(userId: string) {
    return this.db.from(this.tableName).select("*").eq("user_id", userId);
  }

  /**
   * Buscar reviews por service point
   */
  async findByServicePoint(servicePointId: string) {
    return this.db
      .from(this.tableName)
      .select("*")
      .eq("service_point_id", servicePointId);
  }

  /**
   * Buscar reviews por workshop
   */
  async findByWorkshop(workshopId: string) {
    return this.db
      .from(this.tableName)
      .select("*")
      .eq("workshop_id", workshopId);
  }

  /**
   * Buscar reviews por rating
   */
  async findByRating(rating: number) {
    return this.db.from(this.tableName).select("*").eq("rating", rating);
  }
}
