// Repository para Vending Machine
import { BaseRepository } from "./base.repository";
import { supabase } from "../services/supabase";
import type { VendingMachine } from "@/shared/dto/vending_machine.dto";
import type { SupabaseClient } from "@supabase/supabase-js";

export class VendingMachineRepository extends BaseRepository<VendingMachine> {
  constructor(client?: SupabaseClient) {
    super(client || supabase, "vending_machines");
  }

  /**
   * Buscar máquinas por service point
   */
  async findByServicePoint(servicePointId: string) {
    return this.db
      .from(this.tableName)
      .select("*")
      .eq("service_point_id", servicePointId);
  }

  /**
   * Buscar máquinas por estado
   */
  async findByStatus(status: string) {
    return this.db.from(this.tableName).select("*").eq("status", status);
  }
}
