import { supabase } from "@/api/services/supabase";

export interface WarehouseStock {
  id: string;
  warehouse_id: string;
  product_id: string;
  total_stock: number;
  reserved_stock: number;
  available_stock: number;
  min_stock_alert: number;
  max_stock_capacity?: number;
  reorder_point: number;
  reorder_quantity: number;
  unit_cost?: number;
  average_cost?: number;
  shelf_location?: string;
  last_restock_date?: string;
  last_stock_count_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWarehouseStockDTO {
  warehouse_id: string;
  product_id: string;
  total_stock?: number;
  min_stock_alert?: number;
  max_stock_capacity?: number;
  reorder_point?: number;
  reorder_quantity?: number;
  unit_cost?: number;
  average_cost?: number;
  shelf_location?: string;
}

export interface UpdateWarehouseStockDTO {
  total_stock?: number;
  reserved_stock?: number;
  min_stock_alert?: number;
  max_stock_capacity?: number;
  reorder_point?: number;
  reorder_quantity?: number;
  unit_cost?: number;
  average_cost?: number;
  shelf_location?: string;
}

export class WarehouseStockRepository {
  /**
   * Obtener todo el stock de un almacén
   */
  async findByWarehouse(
    warehouseId: string,
    filters?: {
      product_id?: string;
      low_stock?: boolean;
    }
  ): Promise<any[]> {
    let query = supabase
      .from("warehouse_stock")
      .select(
        `
        *,
        warehouse:warehouses(*),
        product:service_products(*)
      `
      )
      .eq("warehouse_id", warehouseId);

    if (filters?.product_id) {
      query = query.eq("product_id", filters.product_id);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching warehouse stock: ${error.message}`);
    }

    let result = data || [];

    // Filtrar stock bajo en memoria
    if (filters?.low_stock) {
      result = result.filter(
        (item) => item.available_stock <= item.min_stock_alert
      );
    }

    return result;
  }

  /**
   * Obtener stock de un producto en un almacén
   */
  async findByWarehouseAndProduct(
    warehouseId: string,
    productId: string
  ): Promise<WarehouseStock | null> {
    const { data, error } = await supabase
      .from("warehouse_stock")
      .select("*")
      .eq("warehouse_id", warehouseId)
      .eq("product_id", productId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Error fetching stock: ${error.message}`);
    }

    return data;
  }

  /**
   * Obtener todo el stock de un producto (en todos los almacenes)
   */
  async findByProduct(productId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("warehouse_stock")
      .select(
        `
        *,
        warehouse:warehouses(*)
      `
      )
      .eq("product_id", productId);

    if (error) {
      throw new Error(`Error fetching product stock: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Crear registro de stock
   */
  async create(stockData: CreateWarehouseStockDTO): Promise<WarehouseStock> {
    const { data, error } = await supabase
      .from("warehouse_stock")
      .insert([stockData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating stock: ${error.message}`);
    }

    return data;
  }

  /**
   * Actualizar stock
   */
  async update(
    warehouseId: string,
    productId: string,
    stockData: UpdateWarehouseStockDTO
  ): Promise<WarehouseStock> {
    const { data, error } = await supabase
      .from("warehouse_stock")
      .update(stockData)
      .eq("warehouse_id", warehouseId)
      .eq("product_id", productId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating stock: ${error.message}`);
    }

    return data;
  }

  /**
   * Eliminar registro de stock
   */
  async delete(warehouseId: string, productId: string): Promise<boolean> {
    const { error } = await supabase
      .from("warehouse_stock")
      .delete()
      .eq("warehouse_id", warehouseId)
      .eq("product_id", productId);

    if (error) {
      throw new Error(`Error deleting stock: ${error.message}`);
    }

    return true;
  }

  /**
   * Obtener productos con stock bajo
   */
  async findLowStock(warehouseId?: string): Promise<any[]> {
    const { data, error } = await supabase.rpc("get_low_stock_products", {
      p_warehouse_id: warehouseId || null,
    });

    if (error) {
      throw new Error(`Error fetching low stock: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Obtener resumen de stock consolidado
   */
  async getStockSummary(): Promise<any[]> {
    const { data, error } = await supabase
      .from("v_product_stock_summary")
      .select("*");

    if (error) {
      throw new Error(`Error fetching stock summary: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Obtener stock por ubicación
   */
  async getStockByLocation(filters?: {
    location_type?: string;
    product_id?: string;
  }): Promise<any[]> {
    let query = supabase.from("v_stock_by_location").select("*");

    if (filters?.location_type) {
      query = query.eq("location_type", filters.location_type);
    }

    if (filters?.product_id) {
      query = query.eq("product_id", filters.product_id);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching stock by location: ${error.message}`);
    }

    return data || [];
  }
}

export const warehouseStockRepository = new WarehouseStockRepository();
