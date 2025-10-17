/**
 * Repository para Productos
 * Extiende BaseRepository y agrega métodos específicos
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { BaseRepository } from "./base.repository";
import {
  Producto,
  ProductoFilters,
  ProductoInventario,
} from "@/shared/dto/producto.dto";
import { supabase as defaultSupabase } from "@/api/services/supabase";

export class ProductoRepository extends BaseRepository<Producto> {
  constructor(supabase?: SupabaseClient) {
    super(supabase || defaultSupabase, "productos");
  }

  /**
   * Buscar producto por SKU
   */
  async findBySku(sku: string): Promise<Producto | null> {
    try {
      const { data, error } = await this.db
        .from(this.tableName)
        .select("*")
        .eq("sku", sku)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // No encontrado
        }
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar si SKU ya existe
   */
  async skuExists(sku: string, excludeId?: string): Promise<boolean> {
    try {
      let query = this.db.from(this.tableName).select("id").eq("sku", sku);

      if (excludeId) {
        query = query.neq("id", excludeId);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === "PGRST116") {
          return false; // No existe
        }
        throw error;
      }

      return !!data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar productos con stock (usa vista)
   */
  async findConStock(filters?: ProductoFilters): Promise<ProductoInventario[]> {
    try {
      let query = this.db.from("v_productos_inventario").select("*");

      if (filters) {
        if (filters.sku) query = query.eq("sku", filters.sku);
        if (filters.nombre)
          query = query.ilike("nombre", `%${filters.nombre}%`);
        if (filters.category_id)
          query = query.eq("category_id", filters.category_id);
        if (filters.subcategory_id)
          query = query.eq("subcategory_id", filters.subcategory_id);
        if (filters.marca) query = query.eq("marca", filters.marca);
        if (filters.modelo) query = query.eq("modelo", filters.modelo);
        if (filters.unidad_medida)
          query = query.eq("unidad_medida", filters.unidad_medida);
        if (filters.is_active !== undefined)
          query = query.eq("is_active", filters.is_active);
        if (filters.perecedero !== undefined)
          query = query.eq("perecedero", filters.perecedero);
        if (filters.requiere_refrigeracion !== undefined)
          query = query.eq(
            "requiere_refrigeracion",
            filters.requiere_refrigeracion
          );
        if (filters.precio_min !== undefined)
          query = query.gte("precio_venta", filters.precio_min);
        if (filters.precio_max !== undefined)
          query = query.lte("precio_venta", filters.precio_max);

        // Búsqueda general
        if (filters.search) {
          query = query.or(
            `nombre.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,marca.ilike.%${filters.search}%`
          );
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar si producto está disponible (activo)
   */
  async checkDisponible(productoId: string): Promise<boolean> {
    try {
      const { data, error } = await this.db
        .from(this.tableName)
        .select("is_active")
        .eq("id", productoId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return false;
        }
        throw error;
      }

      return data?.is_active || false;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener productos perecederos próximos a caducar
   */
  async getProximosCaducar(diasUmbral: number = 30): Promise<Producto[]> {
    try {
      const { data, error } = await this.db
        .from(this.tableName)
        .select("*")
        .eq("perecedero", true)
        .eq("is_active", true)
        .or(
          `dias_caducidad.lte.${diasUmbral},meses_caducidad.lte.${Math.ceil(
            diasUmbral / 30
          )}`
        );

      if (error) throw error;

      return data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener categorías únicas de productos activos
   */
  async getCategorias(): Promise<
    Array<{ category_id: string; category_name: string }>
  > {
    try {
      const { data, error } = await this.db
        .from("v_productos_inventario")
        .select("category_id, category_name")
        .eq("is_active", true)
        .not("category_id", "is", null);

      if (error) throw error;

      // Eliminar duplicados
      const unique = Array.from(
        new Map(
          (data || []).map(
            (item: { category_id: string; category_name: string }) => [
              item.category_id,
              item,
            ]
          )
        ).values()
      );

      return unique as Array<{ category_id: string; category_name: string }>;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener marcas únicas de productos activos
   */
  async getMarcas(): Promise<string[]> {
    try {
      const { data, error } = await this.db
        .from(this.tableName)
        .select("marca")
        .eq("is_active", true)
        .not("marca", "is", null);

      if (error) throw error;

      // Eliminar duplicados y nulls
      const unique = [
        ...new Set(
          (data || [])
            .map((item: { marca: string }) => item.marca)
            .filter(Boolean)
        ),
      ];

      return unique as string[];
    } catch (error) {
      throw error;
    }
  }
}
