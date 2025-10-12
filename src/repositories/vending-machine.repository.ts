import { supabase } from "../services/supabase";

export interface VendingMachine {
  id: string;
  service_point_id: string;
  machine_code: string;
  name: string;
  model?: string;
  location_description?: string;
  status: "active" | "inactive" | "maintenance" | "out_of_stock";
  total_slots: number;
  occupied_slots: number;
  last_refill_date?: string;
  next_maintenance_date?: string;
  total_sales: number;
  total_revenue: number;
  created_at: string;
  updated_at: string;
  // JOINs
  service_point_name?: string;
  service_point?: {
    id: string;
    name: string;
    type: "CSP" | "CSS" | "CSH";
    partner_name?: string;
    commission_model?: any;
    city?: string;
    province?: string;
  };
  inventory_count?: number;
}

export interface CreateVendingMachineDTO {
  service_point_id: string;
  machine_code: string;
  name: string;
  model?: string;
  location_description?: string;
  status?: "active" | "inactive" | "maintenance" | "out_of_stock";
  total_slots?: number;
}

export interface UpdateVendingMachineDTO {
  service_point_id?: string;
  machine_code?: string;
  name?: string;
  model?: string;
  location_description?: string;
  status?: "active" | "inactive" | "maintenance" | "out_of_stock";
  total_slots?: number;
  occupied_slots?: number;
  last_refill_date?: string;
  next_maintenance_date?: string;
}

export class VendingMachineRepository {
  async findAll(filters?: {
    status?: string;
    service_point_id?: string;
  }): Promise<VendingMachine[]> {
    console.log("[VendingMachineRepository] findAll", { filters });

    let query = supabase.from("vending_machines").select(`
        *,
        service_point:service_points!service_point_id (
          id,
          name,
          type,
          partner_name,
          commission_model,
          location:locations (
            city,
            province
          )
        )
      `);

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.service_point_id) {
      query = query.eq("service_point_id", filters.service_point_id);
    }

    const { data, error } = await query.order("machine_code", {
      ascending: true,
    });

    if (error) {
      console.error("[VendingMachineRepository] findAll error:", error);
      throw new Error(`Failed to fetch vending machines: ${error.message}`);
    }

    // Get inventory counts
    const machinesWithInventory = await Promise.all(
      (data || []).map(async (machine: any) => {
        const { count } = await supabase
          .from("inventory_items")
          .select("*", { count: "exact", head: true })
          .eq("vending_machine_id", machine.id);

        return {
          ...machine,
          service_point_name: machine.service_point?.name,
          inventory_count: count || 0,
          service_point: machine.service_point
            ? {
                id: machine.service_point.id,
                name: machine.service_point.name,
                type: machine.service_point.type,
                partner_name: machine.service_point.partner_name,
                commission_model: machine.service_point.commission_model,
                city: machine.service_point.location?.city,
                province: machine.service_point.location?.province,
              }
            : undefined,
        };
      })
    );

    return machinesWithInventory;
  }

  async findById(id: string): Promise<VendingMachine | null> {
    console.log("[VendingMachineRepository] findById", { id });

    const { data, error } = await supabase
      .from("vending_machines")
      .select(
        `
        *,
        service_point:service_points!service_point_id (
          id,
          name,
          type,
          partner_name,
          commission_model,
          location:locations (
            city,
            province
          )
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("[VendingMachineRepository] findById error:", error);
      throw new Error(`Failed to fetch vending machine: ${error.message}`);
    }

    // Get inventory count
    const { count } = await supabase
      .from("inventory_items")
      .select("*", { count: "exact", head: true })
      .eq("vending_machine_id", data.id);

    return {
      ...data,
      service_point_name: data.service_point?.name,
      inventory_count: count || 0,
      service_point: data.service_point
        ? {
            id: data.service_point.id,
            name: data.service_point.name,
            type: data.service_point.type,
            partner_name: data.service_point.partner_name,
            commission_model: data.service_point.commission_model,
            city: data.service_point.location?.city,
            province: data.service_point.location?.province,
          }
        : undefined,
    };
  }

  async create(machineData: CreateVendingMachineDTO): Promise<VendingMachine> {
    console.log("[VendingMachineRepository] create", { machineData });

    const { data, error } = await supabase
      .from("vending_machines")
      .insert({
        ...machineData,
        status: machineData.status || "active",
        total_slots: machineData.total_slots || 0,
        occupied_slots: 0,
        total_sales: 0,
        total_revenue: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("[VendingMachineRepository] create error:", error);
      throw new Error(`Failed to create vending machine: ${error.message}`);
    }

    // Fetch full data with relations
    const machine = await this.findById(data.id);
    return machine!;
  }

  async update(
    id: string,
    machineData: UpdateVendingMachineDTO
  ): Promise<VendingMachine> {
    console.log("[VendingMachineRepository] update", { id, machineData });

    const { data, error } = await supabase
      .from("vending_machines")
      .update(machineData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[VendingMachineRepository] update error:", error);
      throw new Error(`Failed to update vending machine: ${error.message}`);
    }

    // Fetch full data with relations
    const machine = await this.findById(data.id);
    return machine!;
  }

  async delete(id: string): Promise<void> {
    console.log("[VendingMachineRepository] delete", { id });

    const { error } = await supabase
      .from("vending_machines")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[VendingMachineRepository] delete error:", error);
      throw new Error(`Failed to delete vending machine: ${error.message}`);
    }
  }
}
