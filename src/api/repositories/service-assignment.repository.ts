import { supabase } from "@/api/services/supabase";

export interface ServiceAssignment {
  id: string;
  service_id: string;
  location_id: string;
  service_point_id?: string | null;
  warehouse_id?: string | null;
  status: "active" | "inactive" | "maintenance" | "removed";
  configuration?: Record<string, any>;
  assigned_at: string;
  assigned_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceAssignmentDetail {
  id: string;
  service_id: string;
  service_name: string;
  service_description?: string;
  service_type_name: string;
  service_type_code: string;
  location_id: string;
  location_city: string;
  location_province: string;
  location_postal_code?: string;
  location_country: string;
  service_point_id?: string;
  service_point_name?: string;
  warehouse_id?: string;
  warehouse_name?: string;
  warehouse_type?: string;
  status: string;
  configuration?: Record<string, any>;
  assigned_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceAssignmentDTO {
  service_id: string;
  location_id: string;
  service_point_id?: string | null;
  warehouse_id?: string | null;
  configuration?: Record<string, any>;
}

export interface ServiceAssignmentFilters {
  location_id?: string;
  service_id?: string;
  service_point_id?: string;
  status?: string;
}

export class ServiceAssignmentRepository {
  /**
   * Get all service assignments with details
   */
  async findAllWithDetails(
    filters?: ServiceAssignmentFilters
  ): Promise<ServiceAssignmentDetail[]> {
    let query = supabase.from("v_service_assignments_detail").select("*");

    if (filters?.location_id) {
      query = query.eq("location_id", filters.location_id);
    }

    if (filters?.service_id) {
      query = query.eq("service_id", filters.service_id);
    }

    if (filters?.service_point_id) {
      query = query.eq("service_point_id", filters.service_point_id);
    }

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching service assignments: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get single service assignment by ID
   */
  async findById(id: string): Promise<ServiceAssignment | null> {
    const { data, error } = await supabase
      .from("service_assignments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Error fetching service assignment: ${error.message}`);
    }

    return data;
  }

  /**
   * Create a new service assignment using the SQL function
   */
  async create(dto: CreateServiceAssignmentDTO): Promise<string> {
    const { data, error } = await supabase.rpc("assign_service_to_location", {
      p_service_id: dto.service_id,
      p_location_id: dto.location_id,
      p_service_point_id: dto.service_point_id || null,
      p_warehouse_id: dto.warehouse_id || null,
      p_configuration: dto.configuration || {},
    });

    if (error) {
      throw new Error(`Error creating service assignment: ${error.message}`);
    }

    return data;
  }

  /**
   * Update service assignment
   */
  async update(
    id: string,
    updates: Partial<ServiceAssignment>
  ): Promise<ServiceAssignment> {
    const { data, error } = await supabase
      .from("service_assignments")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating service assignment: ${error.message}`);
    }

    return data;
  }

  /**
   * Unassign service from location using SQL function
   */
  async unassign(
    service_id: string,
    location_id: string,
    service_point_id?: string | null
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc(
      "unassign_service_from_location",
      {
        p_service_id: service_id,
        p_location_id: location_id,
        p_service_point_id: service_point_id || null,
      }
    );

    if (error) {
      throw new Error(`Error unassigning service: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete service assignment (hard delete)
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("service_assignments")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Error deleting service assignment: ${error.message}`);
    }
  }

  /**
   * Get assignments for a specific location
   */
  async findByLocation(
    location_id: string
  ): Promise<ServiceAssignmentDetail[]> {
    return this.findAllWithDetails({ location_id });
  }

  /**
   * Get assignments for a specific service
   */
  async findByService(service_id: string): Promise<ServiceAssignmentDetail[]> {
    return this.findAllWithDetails({ service_id });
  }

  /**
   * Get assignments for a specific service point
   */
  async findByServicePoint(
    service_point_id: string
  ): Promise<ServiceAssignmentDetail[]> {
    return this.findAllWithDetails({ service_point_id });
  }

  /**
   * Check if a service is already assigned to a location
   */
  async exists(
    service_id: string,
    location_id: string,
    service_point_id?: string | null
  ): Promise<boolean> {
    let query = supabase
      .from("service_assignments")
      .select("id")
      .eq("service_id", service_id)
      .eq("location_id", location_id)
      .neq("status", "removed");

    if (service_point_id) {
      query = query.eq("service_point_id", service_point_id);
    } else {
      query = query.is("service_point_id", null);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw new Error(`Error checking service assignment: ${error.message}`);
    }

    return !!data;
  }
}

export const serviceAssignmentRepository = new ServiceAssignmentRepository();
