// Repository para Inventory
import { BaseRepository } from "./base.repository";
import { supabase } from "../services/supabase";
import type { Inventory } from "@/shared/dto/inventory.dto";
import type { SupabaseClient } from "@supabase/supabase-js";

export class InventoryRepository extends BaseRepository<Inventory> {
  constructor(client?: SupabaseClient) {
    super(client || supabase, "inventories");
  }

  /**
   * Buscar inventarios por service point
   */
  async findByServicePoint(servicePointId: string) {
    return this.db
      .from(this.tableName)
      .select("*")
      .eq("service_point_id", servicePointId);
  }

  /**
   * Buscar inventarios con stock bajo
   */
  async findLowStock() {
    return this.db
      .from(this.tableName)
      .select("*")
      .filter("quantity", "lte", "min_stock");
  }
}
