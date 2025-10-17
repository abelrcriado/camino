/**
 * Service Assignment DTOs
 * Entidad de relación N:M entre Services y Service Points
 */

export interface ServiceAssignment {
  id: string;
  service_id: string;
  service_point_id: string;
  is_active: boolean;
  priority: number;
  configuracion: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface CreateServiceAssignmentDto {
  service_id: string;
  service_point_id: string;
  is_active?: boolean;
  priority?: number;
  configuracion?: Record<string, unknown>;
}

export interface UpdateServiceAssignmentDto {
  id: string;
  service_id?: string;
  service_point_id?: string;
  is_active?: boolean;
  priority?: number;
  configuracion?: Record<string, unknown>;
}

export interface ServiceAssignmentFilters {
  service_id?: string;
  service_point_id?: string;
  is_active?: boolean;
  priority_min?: number;
  priority_max?: number;
}

/**
 * DTO extendido con información relacionada de la vista
 */
export interface ServiceAssignmentFull {
  // Asignación
  assignment_id: string;
  assignment_active: boolean;
  assignment_priority: number;
  assignment_config: Record<string, unknown>;
  assignment_created_at: string;
  assignment_updated_at: string;

  // Servicio
  service_id: string;
  service_name: string;
  service_code?: string;
  service_description?: string;
  service_status: string;

  // Tipo de servicio
  service_type_id: string;
  service_type_code: string;
  service_type_name: string;
  service_type_category?: string;

  // Service Point
  service_point_id: string;
  service_point_name: string;
  service_point_type?: string;
  service_point_status: string;

  // Location
  location_id?: string;
  location_city?: string;
  location_province?: string;

  // Camino
  camino_id?: string;
  camino_nombre?: string;
  camino_codigo?: string;
}
