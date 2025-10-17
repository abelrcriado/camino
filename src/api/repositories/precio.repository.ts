/**
 * SPRINT 4.2: SISTEMA DE PRECIOS JERÁRQUICO
 * Repository Layer - Acceso a datos para el sistema de precios
 *
 * Extiende BaseRepository y añade métodos específicos para:
 * - Resolución de precios jerárquicos
 * - Consulta de precios vigentes
 * - Filtrado por nivel y entidad
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { BaseRepository } from "./base.repository";
import { supabase } from "@/api/services/supabase";
import {
  Precio,
  PrecioResuelto,
  PrecioVigente,
  PrecioFilters,
  NivelPrecio,
  EntidadTipo,
  PrecioStats,
} from "@/shared/dto/precio.dto";

export class PrecioRepository extends BaseRepository<Precio> {
  constructor(db?: SupabaseClient) {
    super(db || supabase, "precios");
  }

  /**
   * Resuelve el precio aplicable según jerarquía (SP > Ubicación > Base)
   * Usa la función SQL resolver_precio() para máximo rendimiento
   */
  async resolverPrecio(
    entidadTipo: EntidadTipo,
    entidadId: string,
    ubicacionId?: string,
    servicePointId?: string,
    fecha?: string
  ): Promise<PrecioResuelto | null> {
    try {
      const { data, error } = await this.db.rpc("resolver_precio", {
        p_entidad_tipo: entidadTipo,
        p_entidad_id: entidadId,
        p_ubicacion_id: ubicacionId || null,
        p_service_point_id: servicePointId || null,
        p_fecha: fecha || new Date().toISOString().split("T")[0],
      });

      if (error) {
        throw new Error(`Error al resolver precio: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return null;
      }

      const result = data[0];
      return {
        precio_id: result.precio_id,
        precio: result.precio,
        precio_euros: result.precio / 100,
        nivel: result.nivel as NivelPrecio,
        ubicacion_id: result.ubicacion_id,
        service_point_id: result.service_point_id,
        fecha_inicio: result.fecha_inicio,
        fecha_fin: result.fecha_fin,
        activo_hoy: true, // Si lo retorna la función, está activo
      };
    } catch (error) {
      throw new Error(
        `Error al resolver precio: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  /**
   * Obtiene solo el precio aplicable (INTEGER) usando función SQL
   * Útil cuando solo necesitas el monto, no el detalle completo
   */
  async getPrecioAplicable(
    entidadTipo: EntidadTipo,
    entidadId: string,
    ubicacionId?: string,
    servicePointId?: string,
    fecha?: string
  ): Promise<number | null> {
    try {
      const { data, error } = await this.db.rpc("get_precio_aplicable", {
        p_entidad_tipo: entidadTipo,
        p_entidad_id: entidadId,
        p_ubicacion_id: ubicacionId || null,
        p_service_point_id: servicePointId || null,
        p_fecha: fecha || new Date().toISOString().split("T")[0],
      });

      if (error) {
        throw new Error(`Error al obtener precio aplicable: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw new Error(
        `Error al obtener precio aplicable: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  /**
   * Obtiene precios vigentes con datos desnormalizados
   * Usa la vista v_precios_vigentes para máximo rendimiento
   */
  async getPreciosVigentes(
    filters?: Partial<PrecioFilters>
  ): Promise<{ data: PrecioVigente[]; total: number }> {
    try {
      let query = this.db
        .from("v_precios_vigentes")
        .select("*", { count: "exact" });

      // Aplicar filtros
      if (filters?.nivel) {
        query = query.eq("nivel", filters.nivel);
      }
      if (filters?.entidad_tipo) {
        query = query.eq("entidad_tipo", filters.entidad_tipo);
      }
      if (filters?.entidad_id) {
        query = query.eq("entidad_id", filters.entidad_id);
      }
      if (filters?.ubicacion_id) {
        query = query.eq("ubicacion_id", filters.ubicacion_id);
      }
      if (filters?.service_point_id) {
        query = query.eq("service_point_id", filters.service_point_id);
      }

      // Ordenamiento
      const orderBy = filters?.order_by || "created_at";
      const orderDirection = filters?.order_direction || "desc";
      query = query.order(orderBy, { ascending: orderDirection === "asc" });

      // Paginación
      if (filters?.page && filters?.limit) {
        const offset = (filters.page - 1) * filters.limit;
        query = query.range(offset, offset + filters.limit - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Error al obtener precios vigentes: ${error.message}`);
      }

      return {
        data: (data as PrecioVigente[]) || [],
        total: count || 0,
      };
    } catch (error) {
      throw new Error(
        `Error al obtener precios vigentes: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  /**
   * Obtiene precios filtrados por nivel
   */
  async getPreciosByNivel(
    nivel: NivelPrecio,
    vigente?: boolean
  ): Promise<Precio[]> {
    try {
      let query = this.db.from(this.tableName).select("*").eq("nivel", nivel);

      // Si solo queremos vigentes
      if (vigente) {
        const hoy = new Date().toISOString().split("T")[0];
        query = query
          .lte("fecha_inicio", hoy)
          .or(`fecha_fin.is.null,fecha_fin.gte.${hoy}`);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error al obtener precios por nivel: ${error.message}`);
      }

      return (data as Precio[]) || [];
    } catch (error) {
      throw new Error(
        `Error al obtener precios por nivel: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  /**
   * Obtiene precios filtrados por entidad
   */
  async getPreciosByEntidad(
    entidadTipo: EntidadTipo,
    entidadId: string,
    vigente?: boolean
  ): Promise<Precio[]> {
    try {
      let query = this.db
        .from(this.tableName)
        .select("*")
        .eq("entidad_tipo", entidadTipo)
        .eq("entidad_id", entidadId);

      // Si solo queremos vigentes
      if (vigente) {
        const hoy = new Date().toISOString().split("T")[0];
        query = query
          .lte("fecha_inicio", hoy)
          .or(`fecha_fin.is.null,fecha_fin.gte.${hoy}`);
      }

      query = query.order("nivel", { ascending: false }); // service_point > ubicacion > base

      const { data, error } = await query;

      if (error) {
        throw new Error(
          `Error al obtener precios por entidad: ${error.message}`
        );
      }

      return (data as Precio[]) || [];
    } catch (error) {
      throw new Error(
        `Error al obtener precios por entidad: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  /**
   * Obtiene todos los precios con filtros aplicados
   * Método personalizado que no sobrescribe el del base
   */
  async getPreciosWithFilters(
    filters?: PrecioFilters
  ): Promise<{ data: Precio[]; total: number }> {
    try {
      let query = this.db.from(this.tableName).select("*", { count: "exact" });

      // Aplicar filtros específicos
      if (filters?.nivel) {
        query = query.eq("nivel", filters.nivel);
      }
      if (filters?.entidad_tipo) {
        query = query.eq("entidad_tipo", filters.entidad_tipo);
      }
      if (filters?.entidad_id) {
        query = query.eq("entidad_id", filters.entidad_id);
      }
      if (filters?.ubicacion_id) {
        query = query.eq("ubicacion_id", filters.ubicacion_id);
      }
      if (filters?.service_point_id) {
        query = query.eq("service_point_id", filters.service_point_id);
      }

      // Filtro de vigencia
      if (filters?.vigente !== undefined) {
        const fecha = filters.fecha || new Date().toISOString().split("T")[0];
        query = query
          .lte("fecha_inicio", fecha)
          .or(`fecha_fin.is.null,fecha_fin.gte.${fecha}`);
      }

      // Ordenamiento
      const orderBy = filters?.order_by || "created_at";
      const orderDirection = filters?.order_direction || "desc";
      query = query.order(orderBy, { ascending: orderDirection === "asc" });

      // Paginación
      if (filters?.page && filters?.limit) {
        const offset = (filters.page - 1) * filters.limit;
        query = query.range(offset, offset + filters.limit - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Error al obtener precios: ${error.message}`);
      }

      return {
        data: (data as Precio[]) || [],
        total: count || 0,
      };
    } catch (error) {
      throw new Error(
        `Error al obtener precios: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  /**
   * Verifica si existe un precio vigente para una entidad en un nivel específico
   * Útil para evitar duplicados
   */
  async existsPrecioVigente(
    entidadTipo: EntidadTipo,
    entidadId: string,
    nivel: NivelPrecio,
    ubicacionId?: string,
    servicePointId?: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      const hoy = new Date().toISOString().split("T")[0];

      let query = this.db
        .from(this.tableName)
        .select("id")
        .eq("entidad_tipo", entidadTipo)
        .eq("entidad_id", entidadId)
        .eq("nivel", nivel)
        .lte("fecha_inicio", hoy)
        .or(`fecha_fin.is.null,fecha_fin.gte.${hoy}`);

      // Filtros por ubicación según nivel
      if (nivel === NivelPrecio.UBICACION && ubicacionId) {
        query = query.eq("ubicacion_id", ubicacionId);
      }
      if (
        nivel === NivelPrecio.SERVICE_POINT &&
        ubicacionId &&
        servicePointId
      ) {
        query = query
          .eq("ubicacion_id", ubicacionId)
          .eq("service_point_id", servicePointId);
      }

      // Excluir un ID específico (útil para updates)
      if (excludeId) {
        query = query.neq("id", excludeId);
      }

      const { data, error } = await query.limit(1);

      if (error) {
        throw new Error(`Error al verificar precio vigente: ${error.message}`);
      }

      return data !== null && data.length > 0;
    } catch (error) {
      throw new Error(
        `Error al verificar precio vigente: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  /**
   * Obtiene estadísticas de precios
   * Útil para dashboard y reporting
   */
  async getStats(): Promise<PrecioStats> {
    try {
      const hoy = new Date().toISOString().split("T")[0];

      // Total de precios
      const { count: totalPrecios } = await this.db
        .from(this.tableName)
        .select("*", { count: "exact", head: true });

      // Precios vigentes
      const { count: preciosVigentes } = await this.db
        .from(this.tableName)
        .select("*", { count: "exact", head: true })
        .lte("fecha_inicio", hoy)
        .or(`fecha_fin.is.null,fecha_fin.gte.${hoy}`);

      // Por nivel
      const { count: preciosBase } = await this.db
        .from(this.tableName)
        .select("*", { count: "exact", head: true })
        .eq("nivel", NivelPrecio.BASE);

      const { count: preciosUbicacion } = await this.db
        .from(this.tableName)
        .select("*", { count: "exact", head: true })
        .eq("nivel", NivelPrecio.UBICACION);

      const { count: preciosServicePoint } = await this.db
        .from(this.tableName)
        .select("*", { count: "exact", head: true })
        .eq("nivel", NivelPrecio.SERVICE_POINT);

      // Por entidad
      const { count: preciosProductos } = await this.db
        .from(this.tableName)
        .select("*", { count: "exact", head: true })
        .eq("entidad_tipo", EntidadTipo.PRODUCTO);

      const { count: preciosServicios } = await this.db
        .from(this.tableName)
        .select("*", { count: "exact", head: true })
        .eq("entidad_tipo", EntidadTipo.SERVICIO);

      // Rangos de precio (solo vigentes)
      const { data: rangos } = await this.db
        .from(this.tableName)
        .select("precio")
        .lte("fecha_inicio", hoy)
        .or(`fecha_fin.is.null,fecha_fin.gte.${hoy}`);

      const precios = rangos?.map((r: { precio: number }) => r.precio) || [];
      const precioMin = precios.length > 0 ? Math.min(...precios) : 0;
      const precioMax = precios.length > 0 ? Math.max(...precios) : 0;
      const precioPromedio =
        precios.length > 0
          ? Math.round(
              precios.reduce((a: number, b: number) => a + b, 0) /
                precios.length
            )
          : 0;

      return {
        total_precios: totalPrecios || 0,
        precios_vigentes: preciosVigentes || 0,
        precios_expirados: (totalPrecios || 0) - (preciosVigentes || 0),
        precios_base: preciosBase || 0,
        precios_ubicacion: preciosUbicacion || 0,
        precios_service_point: preciosServicePoint || 0,
        precios_productos: preciosProductos || 0,
        precios_servicios: preciosServicios || 0,
        precio_min: precioMin,
        precio_max: precioMax,
        precio_promedio: precioPromedio,
      };
    } catch (error) {
      throw new Error(
        `Error al obtener estadísticas de precios: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  /**
   * Obtiene el historial de precios de una entidad
   * Útil para tracking de cambios de precio
   */
  async getHistorial(
    entidadTipo: EntidadTipo,
    entidadId: string,
    nivel?: NivelPrecio
  ): Promise<Precio[]> {
    try {
      let query = this.db
        .from(this.tableName)
        .select("*")
        .eq("entidad_tipo", entidadTipo)
        .eq("entidad_id", entidadId);

      if (nivel) {
        query = query.eq("nivel", nivel);
      }

      query = query.order("fecha_inicio", { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw new Error(
          `Error al obtener historial de precios: ${error.message}`
        );
      }

      return (data as Precio[]) || [];
    } catch (error) {
      throw new Error(
        `Error al obtener historial de precios: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }
}
