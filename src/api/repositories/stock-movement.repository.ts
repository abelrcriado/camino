import { supabase } from "@/api/services/supabase";

export type MovementType =
  | "purchase"
  | "warehouse_to_point"
  | "point_to_service"
  | "service_sale"
  | "service_to_point"
  | "point_to_warehouse"
  | "adjustment"
  | "transfer"
  | "return";

export interface StockMovement {
  id: string;
  product_id: string;
  movement_type: MovementType;
  from_warehouse_id?: string;
  to_warehouse_id?: string;
  from_service_point_id?: string;
  to_service_point_id?: string;
  from_service_id?: string;
  to_service_id?: string;
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  reference_number?: string;
  notes?: string;
  movement_reason?: string;
  performed_by?: string;
  movement_date: string;
  created_at: string;
}

export interface CreateStockMovementDTO {
  product_id: string;
  movement_type: MovementType;
  from_warehouse_id?: string;
  to_warehouse_id?: string;
  from_service_point_id?: string;
  to_service_point_id?: string;
  from_service_id?: string;
  to_service_id?: string;
  quantity: number;
  unit_cost?: number;
  reference_number?: string;
  notes?: string;
  movement_reason?: string;
  performed_by?: string;
}

export class StockMovementRepository {
  /**
   * Obtener todos los movimientos con filtros
   */
  async findAll(filters?: {
    product_id?: string;
    movement_type?: MovementType;
    from_date?: string;
    to_date?: string;
    warehouse_id?: string;
    service_id?: string;
    limit?: number;
  }): Promise<any[]> {
    let query = supabase
      .from("v_stock_movements_detail")
      .select("*")
      .order("movement_date", { ascending: false });

    if (filters?.product_id) {
      query = query.eq("product_id", filters.product_id);
    }

    if (filters?.movement_type) {
      query = query.eq("movement_type", filters.movement_type);
    }

    if (filters?.from_date) {
      query = query.gte("movement_date", filters.from_date);
    }

    if (filters?.to_date) {
      query = query.lte("movement_date", filters.to_date);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching movements: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Obtener movimiento por ID
   */
  async findById(id: string): Promise<StockMovement | null> {
    const { data, error } = await supabase
      .from("stock_movements")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Error fetching movement: ${error.message}`);
    }

    return data;
  }

  /**
   * Crear nuevo movimiento de stock
   */
  async create(movementData: CreateStockMovementDTO): Promise<StockMovement> {
    const { data, error } = await supabase
      .from("stock_movements")
      .insert([movementData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating movement: ${error.message}`);
    }

    return data;
  }

  /**
   * Obtener movimientos de un producto
   */
  async findByProduct(productId: string, limit: number = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from("v_stock_movements_detail")
      .select("*")
      .eq("product_id", productId)
      .order("movement_date", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Error fetching product movements: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Obtener movimientos de un almacén
   */
  async findByWarehouse(
    warehouseId: string,
    direction?: "in" | "out" | "both",
    limit: number = 50
  ): Promise<any[]> {
    let query = supabase
      .from("stock_movements")
      .select(
        `
        *,
        product:service_products(*)
      `
      )
      .order("movement_date", { ascending: false })
      .limit(limit);

    if (direction === "in" || !direction) {
      query = query.eq("to_warehouse_id", warehouseId);
    } else if (direction === "out") {
      query = query.eq("from_warehouse_id", warehouseId);
    } else {
      // both
      query = query.or(
        `to_warehouse_id.eq.${warehouseId},from_warehouse_id.eq.${warehouseId}`
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching warehouse movements: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Obtener movimientos de un servicio
   */
  async findByService(serviceId: string, limit: number = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from("stock_movements")
      .select(
        `
        *,
        product:service_products(*)
      `
      )
      .or(`to_service_id.eq.${serviceId},from_service_id.eq.${serviceId}`)
      .order("movement_date", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Error fetching service movements: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Obtener estadísticas de movimientos
   */
  async getMovementStats(filters?: {
    from_date?: string;
    to_date?: string;
    warehouse_id?: string;
  }): Promise<any> {
    const { data, error } = await supabase.rpc("get_movement_statistics", {
      p_from_date: filters?.from_date || null,
      p_to_date: filters?.to_date || null,
      p_warehouse_id: filters?.warehouse_id || null,
    });

    if (error) {
      throw new Error(`Error fetching movement stats: ${error.message}`);
    }

    return data;
  }
}
