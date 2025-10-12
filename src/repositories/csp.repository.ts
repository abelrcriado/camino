// Repository para CSP (Camino Service Point)
import { BaseRepository } from "./base.repository";
import { supabase } from "../services/supabase";
import type { CSP } from "../dto/csp.dto";
import type { SupabaseClient } from "@supabase/supabase-js";

export class CSPRepository extends BaseRepository<CSP> {
  constructor(client?: SupabaseClient) {
    super(client || supabase, "csps");
  }

  /**
   * Métodos específicos de CSP se pueden agregar aquí
   * Por ejemplo: buscar CSPs cercanos a una ubicación
   */
  async findNearby(_latitude: number, _longitude: number, _radiusKm: number) {
    // Implementación de búsqueda geoespacial si es necesaria
    // Por ahora retornamos todos y filtramos en el servicio si es necesario
    return this.findAll();
  }

  /**
   * Buscar CSPs por tipo
   */
  async findByType(type: string) {
    return this.db.from(this.tableName).select("*").eq("type", type);
  }

  /**
   * Buscar CSPs activos
   */
  async findActive() {
    return this.db.from(this.tableName).select("*").eq("status", "active");
  }
}
