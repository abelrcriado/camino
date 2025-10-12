import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface MarginConfig {
  id?: string;
  service_point_id: string;
  general_margin_percentage: number;
  product_specific_margins: Record<string, number>;
  apply_margin_to_stock_requests?: boolean;
  notes?: string;
}

export const marginController = {
  /**
   * Obtener configuración de márgenes de un punto de servicio
   */
  async getMarginConfig(servicePointId: string) {
    try {
      const { data, error } = await supabase
        .from("service_point_margins")
        .select("*")
        .eq("service_point_id", servicePointId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows
        throw error;
      }

      return {
        success: true,
        data: data || null,
      };
    } catch (error: any) {
      console.error("Error fetching margin config:", error);
      return {
        success: false,
        error: error.message || "Error al obtener configuración de márgenes",
      };
    }
  },

  /**
   * Crear o actualizar margen general
   */
  async upsertGeneralMargin(servicePointId: string, marginPercentage: number) {
    try {
      // Validar que el service point existe y es tipo service_point
      const { data: warehouse, error: warehouseError } = await supabase
        .from("warehouses")
        .select("id, warehouse_type")
        .eq("id", servicePointId)
        .single();

      if (warehouseError) {
        throw new Error("Punto de servicio no encontrado");
      }

      if (warehouse.warehouse_type !== "service_point") {
        throw new Error(
          "Solo se pueden configurar márgenes en puntos de servicio"
        );
      }

      // Upsert configuración
      const { data, error } = await supabase
        .from("service_point_margins")
        .upsert(
          {
            service_point_id: servicePointId,
            general_margin_percentage: marginPercentage,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "service_point_id",
          }
        )
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      console.error("Error upserting general margin:", error);
      return {
        success: false,
        error: error.message || "Error al actualizar margen general",
      };
    }
  },

  /**
   * Actualizar márgenes específicos por producto
   */
  async updateProductMargins(
    servicePointId: string,
    productMargins: Record<string, number>
  ) {
    try {
      // Verificar que existe configuración base
      const { data: existing } = await supabase
        .from("service_point_margins")
        .select("id")
        .eq("service_point_id", servicePointId)
        .single();

      if (!existing) {
        // Crear configuración base si no existe
        await supabase.from("service_point_margins").insert({
          service_point_id: servicePointId,
          general_margin_percentage: 0,
          product_specific_margins: productMargins,
        });
      } else {
        // Actualizar márgenes específicos
        const { error } = await supabase
          .from("service_point_margins")
          .update({
            product_specific_margins: productMargins,
            updated_at: new Date().toISOString(),
          })
          .eq("service_point_id", servicePointId);

        if (error) throw error;
      }

      return {
        success: true,
        data: {
          service_point_id: servicePointId,
          product_specific_margins: productMargins,
        },
      };
    } catch (error: any) {
      console.error("Error updating product margins:", error);
      return {
        success: false,
        error: error.message || "Error al actualizar márgenes por producto",
      };
    }
  },

  /**
   * Eliminar margen específico de un producto
   */
  async removeProductMargin(servicePointId: string, productId: string) {
    try {
      const { data: config } = await supabase
        .from("service_point_margins")
        .select("product_specific_margins")
        .eq("service_point_id", servicePointId)
        .single();

      if (!config) {
        return { success: true, data: null };
      }

      const margins = config.product_specific_margins as Record<string, number>;
      delete margins[productId];

      const { error } = await supabase
        .from("service_point_margins")
        .update({
          product_specific_margins: margins,
          updated_at: new Date().toISOString(),
        })
        .eq("service_point_id", servicePointId);

      if (error) throw error;

      return {
        success: true,
        data: { product_id: productId, removed: true },
      };
    } catch (error: any) {
      console.error("Error removing product margin:", error);
      return {
        success: false,
        error: error.message || "Error al eliminar margen de producto",
      };
    }
  },

  /**
   * Calcular precio con margen aplicado
   */
  async calculatePriceWithMargin(
    basePriceCents: number,
    servicePointId: string,
    productId: string
  ) {
    try {
      const { data, error } = await supabase.rpc(
        "calculate_price_with_margin",
        {
          p_base_price_cents: basePriceCents,
          p_service_point_id: servicePointId,
          p_product_id: productId,
        }
      );

      if (error) throw error;

      return {
        success: true,
        data: data[0] || {
          final_price_cents: basePriceCents,
          margin_applied: 0,
          margin_source: "no_margin",
        },
      };
    } catch (error: any) {
      console.error("Error calculating price:", error);
      return {
        success: false,
        error: error.message || "Error al calcular precio con margen",
      };
    }
  },

  /**
   * Obtener todos los productos con precios calculados para un service point
   */
  async getProductPricesWithMargins(servicePointId: string) {
    try {
      const { data, error } = await supabase
        .from("v_product_prices_with_margins")
        .select("*")
        .eq("service_point_id", servicePointId);

      if (error) throw error;

      return {
        success: true,
        data: data || [],
      };
    } catch (error: any) {
      console.error("Error fetching product prices:", error);
      return {
        success: false,
        error: error.message || "Error al obtener precios con márgenes",
      };
    }
  },
};
