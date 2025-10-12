import { supabase } from "@/services/supabase";

// Types
export type StockRequestStatus =
  | "pending"
  | "preparing"
  | "in_transit"
  | "delivered"
  | "consolidated"
  | "cancelled";

export type StockRequestPriority = "low" | "normal" | "high" | "urgent";

export interface StockRequest {
  id: string;
  request_number: string;
  from_warehouse_id: string;
  to_warehouse_id: string;
  product_id: string;
  quantity_requested: number;
  status: StockRequestStatus;
  priority: StockRequestPriority;
  requested_date: string;
  prepared_date: string | null;
  shipped_date: string | null;
  delivered_date: string | null;
  consolidated_date: string | null;
  requested_by: string | null;
  delivered_by: string | null;
  notes: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockRequestDetail extends StockRequest {
  product_name: string;
  sku: string;
  unit_cost: number;
  total_value: number;
  from_warehouse_code: string;
  from_warehouse_name: string;
  from_warehouse_type: string;
  from_location_name: string;
  from_city: string;
  to_warehouse_code: string;
  to_warehouse_name: string;
  to_warehouse_type: string;
  to_location_name: string;
  to_city: string;
  requested_by_name: string | null;
  delivered_by_name: string | null;
  status_label: string;
  priority_label: string;
}

export interface CreateStockRequestDTO {
  from_warehouse_id: string;
  to_warehouse_id: string;
  product_id: string;
  quantity_requested: number;
  requested_by?: string;
  priority?: StockRequestPriority;
  notes?: string;
}

export interface UpdateStockRequestStatusDTO {
  status: StockRequestStatus;
  prepared_date?: string;
  shipped_date?: string;
  delivered_date?: string;
  consolidated_date?: string;
  delivered_by?: string;
}

export interface StockRequestFilters {
  status?: StockRequestStatus | StockRequestStatus[];
  priority?: StockRequestPriority;
  from_warehouse_id?: string;
  to_warehouse_id?: string;
  product_id?: string;
  location_id?: string;
  from_date?: string;
  to_date?: string;
}

export class StockRequestRepository {
  /**
   * Crear pedido de stock usando función de base de datos
   */
  async create(
    data: CreateStockRequestDTO
  ): Promise<{ success: boolean; request_id?: string; error?: string }> {
    try {
      const { data: result, error } = await supabase.rpc(
        "create_stock_request",
        {
          p_from_warehouse_id: data.from_warehouse_id,
          p_to_warehouse_id: data.to_warehouse_id,
          p_product_id: data.product_id,
          p_quantity: data.quantity_requested,
          p_requested_by: data.requested_by || null,
          p_priority: data.priority || "normal",
          p_notes: data.notes || null,
        }
      );

      if (error) {
        console.error("Error creating stock request:", error);
        return { success: false, error: error.message };
      }

      return { success: true, request_id: result };
    } catch (error) {
      console.error("Exception in create stock request:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener pedido por ID con detalles completos
   */
  async getById(id: string): Promise<StockRequestDetail | null> {
    try {
      const { data, error } = await supabase
        .from("v_stock_requests_detail")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching stock request:", error);
        return null;
      }

      return data as StockRequestDetail;
    } catch (error) {
      console.error("Exception in getById:", error);
      return null;
    }
  }

  /**
   * Obtener pedido por número de referencia
   */
  async getByRequestNumber(
    requestNumber: string
  ): Promise<StockRequestDetail | null> {
    try {
      const { data, error } = await supabase
        .from("v_stock_requests_detail")
        .select("*")
        .eq("request_number", requestNumber)
        .single();

      if (error) {
        console.error("Error fetching stock request by number:", error);
        return null;
      }

      return data as StockRequestDetail;
    } catch (error) {
      console.error("Exception in getByRequestNumber:", error);
      return null;
    }
  }

  /**
   * Listar pedidos con filtros
   */
  async list(filters?: StockRequestFilters): Promise<StockRequestDetail[]> {
    try {
      let query = supabase.from("v_stock_requests_detail").select("*");

      // Filtro por estado
      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          query = query.in("status", filters.status);
        } else {
          query = query.eq("status", filters.status);
        }
      }

      // Filtro por prioridad
      if (filters?.priority) {
        query = query.eq("priority", filters.priority);
      }

      // Filtro por almacén origen
      if (filters?.from_warehouse_id) {
        query = query.eq("from_warehouse_id", filters.from_warehouse_id);
      }

      // Filtro por almacén destino
      if (filters?.to_warehouse_id) {
        query = query.eq("to_warehouse_id", filters.to_warehouse_id);
      }

      // Filtro por producto
      if (filters?.product_id) {
        query = query.eq("product_id", filters.product_id);
      }

      // Filtro por rango de fechas
      if (filters?.from_date) {
        query = query.gte("requested_date", filters.from_date);
      }
      if (filters?.to_date) {
        query = query.lte("requested_date", filters.to_date);
      }

      // Ordenar por fecha de solicitud descendente
      query = query.order("requested_date", { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("Error listing stock requests:", error);
        return [];
      }

      return data as StockRequestDetail[];
    } catch (error) {
      console.error("Exception in list:", error);
      return [];
    }
  }

  /**
   * Actualizar estado del pedido
   */
  async updateStatus(
    id: string,
    statusData: UpdateStockRequestStatusDTO
  ): Promise<boolean> {
    try {
      const updateData: any = {
        status: statusData.status,
        updated_at: new Date().toISOString(),
      };

      // Añadir fechas según el estado
      if (statusData.prepared_date)
        updateData.prepared_date = statusData.prepared_date;
      if (statusData.shipped_date)
        updateData.shipped_date = statusData.shipped_date;
      if (statusData.delivered_date)
        updateData.delivered_date = statusData.delivered_date;
      if (statusData.consolidated_date)
        updateData.consolidated_date = statusData.consolidated_date;
      if (statusData.delivered_by)
        updateData.delivered_by = statusData.delivered_by;

      const { error } = await supabase
        .from("stock_requests")
        .update(updateData)
        .eq("id", id);

      if (error) {
        console.error("Error updating stock request status:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Exception in updateStatus:", error);
      return false;
    }
  }

  /**
   * Enviar pedido (usando función de BD)
   */
  async ship(
    id: string,
    shippedBy?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.rpc("ship_stock_request", {
        p_request_id: id,
        p_shipped_by: shippedBy || null,
      });

      if (error) {
        console.error("Error shipping stock request:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Exception in ship:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Consolidar pedido (usando función de BD)
   */
  async consolidate(
    id: string,
    deliveredBy?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.rpc("consolidate_stock_request", {
        p_request_id: id,
        p_delivered_by: deliveredBy || null,
      });

      if (error) {
        console.error("Error consolidating stock request:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Exception in consolidate:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Cancelar pedido (usando función de BD)
   */
  async cancel(
    id: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.rpc("cancel_stock_request", {
        p_request_id: id,
        p_reason: reason,
      });

      if (error) {
        console.error("Error cancelling stock request:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Exception in cancel:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener pedidos pendientes por ubicación de destino
   */
  async getPendingByLocation(
    locationId: string
  ): Promise<StockRequestDetail[]> {
    try {
      const { data, error } = await supabase
        .from("v_stock_requests_detail")
        .select("*")
        .in("status", ["pending", "preparing", "in_transit", "delivered"])
        .eq("to_location_id", locationId) // Necesitarás añadir esta columna a la vista
        .order("priority", { ascending: true })
        .order("requested_date", { ascending: true });

      if (error) {
        console.error("Error fetching pending requests by location:", error);
        return [];
      }

      return data as StockRequestDetail[];
    } catch (error) {
      console.error("Exception in getPendingByLocation:", error);
      return [];
    }
  }

  /**
   * Obtener pedidos en tránsito
   */
  async getInTransit(): Promise<StockRequestDetail[]> {
    return this.list({ status: "in_transit" });
  }

  /**
   * Obtener pedidos que requieren acción
   */
  async getRequiringAction(): Promise<StockRequestDetail[]> {
    return this.list({ status: ["pending", "preparing", "delivered"] });
  }

  /**
   * Estadísticas de pedidos
   */
  async getStats(filters?: {
    warehouse_id?: string;
    from_date?: string;
    to_date?: string;
  }) {
    try {
      let query = supabase
        .from("stock_requests")
        .select("status, priority, quantity_requested", { count: "exact" });

      if (filters?.warehouse_id) {
        query = query.or(
          `from_warehouse_id.eq.${filters.warehouse_id},to_warehouse_id.eq.${filters.warehouse_id}`
        );
      }

      if (filters?.from_date) {
        query = query.gte("requested_date", filters.from_date);
      }

      if (filters?.to_date) {
        query = query.lte("requested_date", filters.to_date);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching stats:", error);
        return null;
      }

      // Calcular estadísticas
      const stats = {
        total: count || 0,
        by_status: {} as Record<string, number>,
        by_priority: {} as Record<string, number>,
        total_units: 0,
      };

      data?.forEach((request: any) => {
        // Por estado
        stats.by_status[request.status] =
          (stats.by_status[request.status] || 0) + 1;

        // Por prioridad
        stats.by_priority[request.priority] =
          (stats.by_priority[request.priority] || 0) + 1;

        // Total unidades
        stats.total_units += request.quantity_requested;
      });

      return stats;
    } catch (error) {
      console.error("Exception in getStats:", error);
      return null;
    }
  }
}

export const stockRequestRepository = new StockRequestRepository();
