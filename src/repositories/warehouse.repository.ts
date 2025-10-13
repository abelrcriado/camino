import { supabase } from "@/services/supabase";
import logger from "@/config/logger";

export type WarehouseType =
  | "physical_warehouse"
  | "vending_machine"
  | "workshop"
  | "service_point";

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  warehouse_type?: WarehouseType;
  location_id?: string;
  description?: string;
  address?: string;
  specific_address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  max_stock_capacity?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WarehouseFull extends Warehouse {
  location_name?: string;
  province?: string;
  location_latitude?: number;
  location_longitude?: number;
  type_label?: string;
  total_products?: number;
  total_stock_units?: number;
  total_reserved_units?: number;
  total_available_units?: number;
}

export interface CreateWarehouseDTO {
  code: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  is_active?: boolean;
}

export interface UpdateWarehouseDTO {
  code?: string;
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  is_active?: boolean;
}

export class WarehouseRepository {
  /**
   * Obtener todos los almacenes
   */
  async findAll(filters?: { is_active?: boolean }): Promise<Warehouse[]> {
    let query = supabase
      .from("warehouses")
      .select("*")
      .order("name", { ascending: true });

    if (filters?.is_active !== undefined) {
      query = query.eq("is_active", filters.is_active);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching warehouses: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Obtener almacén por ID
   */
  async findById(id: string): Promise<Warehouse | null> {
    const { data, error } = await supabase
      .from("warehouses")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Error fetching warehouse: ${error.message}`);
    }

    return data;
  }

  /**
   * Obtener almacén por código
   */
  async findByCode(code: string): Promise<Warehouse | null> {
    const { data, error } = await supabase
      .from("warehouses")
      .select("*")
      .eq("code", code)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Error fetching warehouse by code: ${error.message}`);
    }

    return data;
  }

  /**
   * Crear nuevo almacén
   */
  async create(warehouseData: CreateWarehouseDTO): Promise<Warehouse> {
    const { data, error } = await supabase
      .from("warehouses")
      .insert([warehouseData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating warehouse: ${error.message}`);
    }

    return data;
  }

  /**
   * Actualizar almacén
   */
  async update(
    id: string,
    warehouseData: UpdateWarehouseDTO
  ): Promise<Warehouse> {
    const { data, error } = await supabase
      .from("warehouses")
      .update(warehouseData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating warehouse: ${error.message}`);
    }

    return data;
  }

  /**
   * Eliminar almacén (hard delete)
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("warehouses").delete().eq("id", id);

    if (error) {
      throw new Error(`Error deleting warehouse: ${error.message}`);
    }

    return true;
  }

  /**
   * Alternar estado activo/inactivo
   */
  async toggleActive(id: string): Promise<Warehouse> {
    const warehouse = await this.findById(id);
    if (!warehouse) {
      throw new Error("Warehouse not found");
    }

    return this.update(id, { is_active: !warehouse.is_active });
  }

  /**
   * Obtener warehouses con detalles completos (usando vista v_warehouse_full)
   */
  async listFull(filters?: {
    warehouse_type?: WarehouseType;
    location_id?: string;
    is_active?: boolean;
  }): Promise<WarehouseFull[]> {
    try {
      let query = supabase.from("v_warehouse_full").select("*");

      if (filters?.warehouse_type) {
        query = query.eq("warehouse_type", filters.warehouse_type);
      }

      if (filters?.location_id) {
        query = query.eq("location_id", filters.location_id);
      }

      if (filters?.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
      }

      query = query.order("name", { ascending: true });

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error fetching full warehouses: ${error.message}`);
      }

      return data as WarehouseFull[];
    } catch (error) {
      logger.error("Error in listFull:", error);
      return [];
    }
  }

  /**
   * Obtener warehouse por ID con detalles completos
   */
  async findByIdFull(id: string): Promise<WarehouseFull | null> {
    const { data, error } = await supabase
      .from("v_warehouse_full")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      logger.error("Error fetching full warehouse:", error);
      return null;
    }

    return data as WarehouseFull;
  }

  /**
   * Obtener warehouses por tipo
   */
  async findByType(type: WarehouseType): Promise<WarehouseFull[]> {
    return this.listFull({ warehouse_type: type });
  }

  /**
   * Obtener warehouses por ubicación
   */
  async findByLocation(locationId: string): Promise<WarehouseFull[]> {
    return this.listFull({ location_id: locationId });
  }

  /**
   * Obtener máquinas de vending
   */
  async getVendingMachines(locationId?: string): Promise<WarehouseFull[]> {
    const filters: any = { warehouse_type: "vending_machine" as WarehouseType };
    if (locationId) filters.location_id = locationId;
    return this.listFull(filters);
  }

  /**
   * Obtener talleres
   */
  async getWorkshops(locationId?: string): Promise<WarehouseFull[]> {
    const filters: any = { warehouse_type: "workshop" as WarehouseType };
    if (locationId) filters.location_id = locationId;
    return this.listFull(filters);
  }

  /**
   * Obtener almacenes físicos
   */
  async getPhysicalWarehouses(locationId?: string): Promise<WarehouseFull[]> {
    const filters: any = {
      warehouse_type: "physical_warehouse" as WarehouseType,
    };
    if (locationId) filters.location_id = locationId;
    return this.listFull(filters);
  }

  /**
   * Obtener almacén con estadísticas de stock
   */
  async findByIdWithStats(id: string): Promise<any> {
    const { data, error } = await supabase.rpc("get_warehouse_with_stats", {
      warehouse_id: id,
    });

    if (error) {
      throw new Error(`Error fetching warehouse stats: ${error.message}`);
    }

    return data;
  }
}
