// Repository para Caminos
import { BaseRepository } from "./base.repository";
import { supabase } from "../services/supabase";
import type { Camino, CaminoStats, UbicacionFull } from "@/shared/dto/camino.dto";
import { SupabaseClient } from "@supabase/supabase-js";

export class CaminoRepository extends BaseRepository<Camino> {
  constructor(db?: SupabaseClient) {
    super(db || supabase, "caminos");
  }

  /**
   * Buscar camino por código (ej: 'CSF', 'CN', 'CP')
   */
  async findByCodigo(codigo: string) {
    return this.db
      .from(this.tableName)
      .select("*")
      .eq("codigo", codigo)
      .single();
  }

  /**
   * Buscar caminos por estado operativo
   */
  async findByEstado(estado: string) {
    return this.db
      .from(this.tableName)
      .select("*")
      .eq("estado_operativo", estado);
  }

  /**
   * Buscar caminos por región
   */
  async findByRegion(region: string) {
    return this.db.from(this.tableName).select("*").eq("region", region);
  }

  /**
   * Obtener estadísticas completas de un camino
   * Utiliza la función SQL get_camino_stats()
   */
  async getStats(
    caminoId: string
  ): Promise<{ data: CaminoStats | null; error: unknown }> {
    try {
      const { data, error } = await this.db.rpc("get_camino_stats", {
        p_camino_id: caminoId,
      });

      if (error) {
        return { data: null, error };
      }

      return { data: data as CaminoStats, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Obtener camino con sus ubicaciones
   * Utiliza la vista v_ubicaciones_full
   */
  async getWithUbicaciones(caminoId: string) {
    try {
      // Primero obtener el camino
      const { data: camino, error: caminoError } = await this.findById(
        caminoId
      );

      if (caminoError || !camino) {
        return { data: null, error: caminoError || "Camino no encontrado" };
      }

      // Obtener ubicaciones usando la vista
      const { data: ubicaciones, error: ubicacionesError } = await this.db
        .from("v_ubicaciones_full")
        .select("*")
        .eq("camino_id", caminoId);

      if (ubicacionesError) {
        return { data: null, error: ubicacionesError };
      }

      return {
        data: {
          camino,
          ubicaciones: ubicaciones as UbicacionFull[],
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Obtener resumen de todos los caminos
   * Utiliza la función SQL get_all_caminos_summary()
   */
  async getAllSummary() {
    try {
      const { data, error } = await this.db.rpc("get_all_caminos_summary");

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Verificar si un código ya existe (para validación de unicidad)
   */
  async codigoExists(codigo: string, excludeId?: string) {
    try {
      let query = this.db
        .from(this.tableName)
        .select("id")
        .eq("codigo", codigo);

      if (excludeId) {
        query = query.neq("id", excludeId);
      }

      const { data, error } = await query;

      if (error) {
        return { exists: false, error };
      }

      return { exists: (data?.length ?? 0) > 0, error: null };
    } catch (error) {
      return { exists: false, error };
    }
  }
}
