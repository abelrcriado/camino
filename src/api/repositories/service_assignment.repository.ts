/**
 * Repository para ServiceAssignment
 * Gestiona la relación N:M entre Services y Service Points
 */

import { BaseRepository } from "./base.repository";
import { supabase } from "../services/supabase";
import type {
  ServiceAssignment,
  ServiceAssignmentFilters,
} from "@/shared/dto/service_assignment.dto";
import type { PaginationParams, SortParams } from "@/shared/types/common.types";
import { SupabaseClient } from "@supabase/supabase-js";

export class ServiceAssignmentRepository extends BaseRepository<ServiceAssignment> {
  constructor(db?: SupabaseClient) {
    super(db || supabase, "servicio_service_point");
  }

  /**
   * Sobrescribe findAll para manejar filtros y sorting específicos
   */
  override async findAll(
    filters?: ServiceAssignmentFilters,
    pagination?: PaginationParams,
    sort?: SortParams
  ) {
    let query = this.db.from(this.tableName).select("*", { count: "exact" });

    // Aplicar filtros
    if (filters) {
      const {
        service_id,
        service_point_id,
        is_active,
        priority_min,
        priority_max,
      } = filters;

      if (service_id) {
        query = query.eq("service_id", service_id);
      }
      if (service_point_id) {
        query = query.eq("service_point_id", service_point_id);
      }
      if (is_active !== undefined) {
        query = query.eq("is_active", is_active);
      }
      if (priority_min !== undefined) {
        query = query.gte("priority", priority_min);
      }
      if (priority_max !== undefined) {
        query = query.lte("priority", priority_max);
      }
    }

    // Aplicar paginación
    if (pagination) {
      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;
      query = query.range(from, to);
    }

    // Aplicar ordenamiento
    const sortBy = sort?.field || "priority";
    const sortOrder = sort?.order === "asc";
    query = query.order(sortBy, { ascending: sortOrder });

    return query;
  }

  /**
   * Buscar asignación específica por service_id y service_point_id
   */
  async findByServiceAndPoint(
    service_id: string,
    service_point_id: string
  ): Promise<ServiceAssignment | null> {
    const { data, error } = await this.db
      .from(this.tableName)
      .select("*")
      .eq("service_id", service_id)
      .eq("service_point_id", service_point_id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar todas las asignaciones de un servicio
   */
  async findByService(service_id: string): Promise<ServiceAssignment[]> {
    const { data, error } = await this.db
      .from(this.tableName)
      .select("*")
      .eq("service_id", service_id)
      .order("priority", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Buscar todas las asignaciones de un service point
   */
  async findByServicePoint(
    service_point_id: string
  ): Promise<ServiceAssignment[]> {
    const { data, error } = await this.db
      .from(this.tableName)
      .select("*")
      .eq("service_point_id", service_point_id)
      .order("priority", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Obtener vista completa con información relacionada
   */
  async findFullAssignments(
    filters?: ServiceAssignmentFilters,
    pagination?: PaginationParams,
    sort?: SortParams
  ) {
    let query = this.db
      .from("v_service_assignments_full")
      .select("*", { count: "exact" });

    // Aplicar filtros
    if (filters) {
      const {
        service_id,
        service_point_id,
        is_active,
        priority_min,
        priority_max,
      } = filters;

      if (service_id) {
        query = query.eq("service_id", service_id);
      }
      if (service_point_id) {
        query = query.eq("service_point_id", service_point_id);
      }
      if (is_active !== undefined) {
        query = query.eq("assignment_active", is_active);
      }
      if (priority_min !== undefined) {
        query = query.gte("assignment_priority", priority_min);
      }
      if (priority_max !== undefined) {
        query = query.lte("assignment_priority", priority_max);
      }
    }

    // Aplicar paginación
    if (pagination) {
      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;
      query = query.range(from, to);
    }

    // Aplicar ordenamiento
    const sortBy = sort?.field || "priority";
    const sortColumn =
      sortBy === "priority"
        ? "assignment_priority"
        : sortBy === "created_at"
        ? "assignment_created_at"
        : "assignment_updated_at";
    const sortOrder = sort?.order === "asc";
    query = query.order(sortColumn, { ascending: sortOrder });

    return query;
  }

  /**
   * Verificar si existe asignación entre service y service_point
   */
  async assignmentExists(
    service_id: string,
    service_point_id: string
  ): Promise<boolean> {
    const { data, error } = await this.db
      .from(this.tableName)
      .select("id")
      .eq("service_id", service_id)
      .eq("service_point_id", service_point_id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      throw error;
    }

    return !!data;
  }

  /**
   * Obtener estadísticas de asignaciones
   */
  async getStats() {
    const { data, error } = await this.db.rpc("get_assignment_stats");
    if (error) throw error;
    return data;
  }
}
