// Repository para Inventory Items
import { BaseRepository } from "./base.repository";
import { supabase } from "../services/supabase";
import type { InventoryItem } from "../dto/inventory_item.dto";
import type { SupabaseClient } from "@supabase/supabase-js";

export class InventoryItemRepository extends BaseRepository<InventoryItem> {
  constructor(supabaseClient?: SupabaseClient) {
    super(supabaseClient || supabase, "inventory_items");
  }

  /**
   * Buscar items por inventario
   */
  async findByInventory(inventoryId: string) {
    return this.db
      .from(this.tableName)
      .select("*")
      .eq("inventory_id", inventoryId);
  }

  /**
   * Buscar items por tipo
   */
  async findByType(type: string) {
    return this.db.from(this.tableName).select("*").eq("type", type);
  }
}
