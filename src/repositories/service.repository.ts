import { supabase } from "@/services/supabase";

export interface Service {
  id: string;
  service_point_id?: string | null;
  service_type_id: string;
  name: string;
  code: string;
  description: string | null;
  configuration: Record<string, any> | null;
  custom_operating_hours: Record<string, any> | null;
  status: 'active' | 'inactive' | 'maintenance' | 'out_of_order';
  operational_since: string | null;
  last_maintenance_date: string | null;
  next_maintenance_date: string | null;
  total_uses: number;
  total_revenue: number;
  average_rating: number | null;
  max_capacity: number | null;
  current_capacity: number | null;
  requires_inventory: boolean;
  low_stock_threshold: number | null;
  initial_investment: number | null;
  monthly_maintenance_cost: number | null;
  electricity_cost_monthly: number | null;
  images: string[] | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceInsert {
  service_point_id?: string | null;
  service_type_id: string;
  name: string;
  code: string;
  description?: string | null;
  configuration?: Record<string, any>;
  custom_operating_hours?: Record<string, any> | null;
  status?: 'active' | 'inactive' | 'maintenance' | 'out_of_order';
  operational_since?: string | null;
  last_maintenance_date?: string | null;
  next_maintenance_date?: string | null;
  total_uses?: number;
  total_revenue?: number;
  average_rating?: number | null;
  max_capacity?: number | null;
  current_capacity?: number | null;
  requires_inventory?: boolean;
  low_stock_threshold?: number | null;
  initial_investment?: number | null;
  monthly_maintenance_cost?: number | null;
  electricity_cost_monthly?: number | null;
  images?: string[] | null;
  metadata?: Record<string, any> | null;
}

export interface ServiceUpdate {
  service_point_id?: string | null;
  service_type_id?: string;
  name?: string;
  code?: string;
  description?: string | null;
  configuration?: Record<string, any> | null;
  custom_operating_hours?: Record<string, any> | null;
  status?: 'active' | 'inactive' | 'maintenance' | 'out_of_order';
  operational_since?: string | null;
  last_maintenance_date?: string | null;
  next_maintenance_date?: string | null;
  total_uses?: number;
  total_revenue?: number;
  average_rating?: number | null;
  max_capacity?: number | null;
  current_capacity?: number | null;
  requires_inventory?: boolean;
  low_stock_threshold?: number | null;
  initial_investment?: number | null;
  monthly_maintenance_cost?: number | null;
  electricity_cost_monthly?: number | null;
  images?: string[] | null;
  metadata?: Record<string, any> | null;
}

export interface ServiceFilters {
  service_point_id?: string;
  service_type_id?: string;
  location_id?: string;
  status?: 'active' | 'inactive' | 'maintenance' | 'out_of_order';
  requires_inventory?: boolean;
  search?: string;
}
  status?: "active" | "inactive" | "maintenance" | "out_of_service";
  search?: string;
}

export class ServiceRepository {
  async findAll(filters?: ServiceFilters): Promise<Service[]> {
    let query = supabase
      .from("services")
      .select("*")
      .order("name", { ascending: true });

    if (filters?.service_point_id) {
      query = query.eq("service_point_id", filters.service_point_id);
    }

    if (filters?.service_type_id) {
      query = query.eq("service_type_id", filters.service_type_id);
    }

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching services: ${error.message}`);
    }

    return data as Service[];
  }

  async findAllWithDetails(filters?: ServiceFilters): Promise<any[]> {
    let query = supabase
      .from("v_services_full")
      .select("*")
      .order("service_name", { ascending: true });

    if (filters?.service_point_id) {
      query = query.eq("service_point_id", filters.service_point_id);
    }

    if (filters?.service_type_id) {
      query = query.eq("service_type_id", filters.service_type_id);
    }

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.search) {
      query = query.or(
        `service_name.ilike.%${filters.search}%,service_description.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching services with details: ${error.message}`);
    }

    // Si hay filtro de location_id, filtrar en memoria después de traer los datos
    // (porque la vista v_services_full no incluye location_id directamente)
    if (filters?.location_id && data) {
      // Obtener los service_point_ids que pertenecen a esta location
      const { data: servicePoints, error: spError } = await supabase
        .from("service_points")
        .select("id")
        .eq("location_id", filters.location_id);

      if (spError) {
        throw new Error(`Error fetching service points: ${spError.message}`);
      }

      const servicePointIds = servicePoints?.map((sp) => sp.id) || [];

      // Filtrar los servicios que pertenecen a esos service points
      return data.filter((service) =>
        servicePointIds.includes(service.service_point_id)
      );
    }

    return data;
  }

  async findById(id: string): Promise<Service | null> {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Error fetching service: ${error.message}`);
    }

    return data as Service;
  }

  async findByServicePoint(servicePointId: string): Promise<Service[]> {
  async findByCode(code: string): Promise<Service | null> {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("code", code)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Error fetching service: ${error.message}`);
    }

    return data as Service;
  }

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("service_point_id", servicePointId)
      .order("name", { ascending: true });

    if (error) {
      throw new Error(`Error fetching services: ${error.message}`);
    }

    return data as Service[];
  }

  async findByServiceType(serviceTypeId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("service_type_id", serviceTypeId)
      .order("name", { ascending: true });

    if (error) {
      throw new Error(`Error fetching services: ${error.message}`);
    }

    return data as Service[];
  }

  async create(service: ServiceInsert): Promise<Service> {
    const { data, error } = await supabase
      .from("services")
      .insert(service)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating service: ${error.message}`);
    }

    return data as Service;
  }

  async update(id: string, updates: ServiceUpdate): Promise<Service | null> {
    const { data, error } = await supabase
      .from("services")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Error updating service: ${error.message}`);
    }

    return data as Service;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("services").delete().eq("id", id);

    if (error) {
      throw new Error(`Error deleting service: ${error.message}`);
    }

    return true;
  }

  async updateStatus(
    id: string,
    status: "active" | "inactive" | "maintenance" | "out_of_service"
  ): Promise<Service | null> {
    return this.update(id, { status });
  }

  async getServicesByStatus(
    status: "active" | "inactive" | "maintenance" | "out_of_service"
  ): Promise<Service[]> {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("status", status)
      .order("name", { ascending: true });

    if (error) {
      throw new Error(`Error fetching services by status: ${error.message}`);
    }

    return data as Service[];
  }

  async getServicesNeedingMaintenance(): Promise<Service[]> {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .lte("next_maintenance_date", today)
      .eq("is_active", true)
      .order("next_maintenance_date", { ascending: true });

    if (error) {
      throw new Error(
        `Error fetching services needing maintenance: ${error.message}`
      );
    }

    return data as Service[];
  }
}
