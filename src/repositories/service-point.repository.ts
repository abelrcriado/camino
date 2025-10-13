/**
import logger from "@/config/logger";
 * Service Point Repository
 * Acceso a datos de service_points table
 */

import { createClient } from "../lib/supabase";
import {
  ServicePointDTO,
  CreateServicePointDTO,
  UpdateServicePointDTO,
  ServicePointFilters,
  ServicePointRevenueStats,
  NetworkDashboardStats,
  RevenueStreamType,
} from "../dto/service-point.dto";

export class ServicePointRepository {
  private supabase = createClient();

  /**
   * Buscar todos con filtros
   */
  async findAll(filters: ServicePointFilters = {}): Promise<ServicePointDTO[]> {
    let query = this.supabase
      .from("service_points")
      .select(
        `
        *,
        location:locations(*)
      `
      )
      .order("created_at", { ascending: false });

    // Aplicar filtros
    if (filters.type) {
      query = query.eq("type", filters.type);
    }

    if (filters.location_id) {
      query = query.eq("location_id", filters.location_id);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.has_vending !== undefined) {
      query = query.eq("has_vending", filters.has_vending);
    }

    if (filters.has_workshop_space !== undefined) {
      query = query.eq("has_workshop_space", filters.has_workshop_space);
    }

    if (filters.has_bike_wash !== undefined) {
      query = query.eq("has_bike_wash", filters.has_bike_wash);
    }

    if (filters.has_ebike_charging !== undefined) {
      query = query.eq("has_ebike_charging", filters.has_ebike_charging);
    }

    if (filters.has_professional_service !== undefined) {
      query = query.eq(
        "has_professional_service",
        filters.has_professional_service
      );
    }

    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,partner_name.ilike.%${filters.search}%,workshop_name.ilike.%${filters.search}%,address.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      logger.error("[ServicePointRepository] findAll error:", error);
      throw new Error(`Failed to fetch service points: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Buscar por ID
   */
  async findById(id: string): Promise<ServicePointDTO | null> {
    const { data, error } = await this.supabase
      .from("service_points")
      .select(
        `
        *,
        location:locations(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      logger.error("[ServicePointRepository] findById error:", error);
      throw new Error(`Failed to fetch service point: ${error.message}`);
    }

    return data;
  }

  /**
   * Crear service point
   */
  async create(data: CreateServicePointDTO): Promise<ServicePointDTO> {
    const { data: created, error } = await this.supabase
      .from("service_points")
      .insert(data)
      .select(
        `
        *,
        location:locations(*)
      `
      )
      .single();

    if (error) {
      logger.error("[ServicePointRepository] create error:", error);
      throw new Error(`Failed to create service point: ${error.message}`);
    }

    return created;
  }

  /**
   * Actualizar service point
   */
  async update(
    id: string,
    data: UpdateServicePointDTO
  ): Promise<ServicePointDTO | null> {
    const { data: updated, error } = await this.supabase
      .from("service_points")
      .update(data)
      .eq("id", id)
      .select(
        `
        *,
        location:locations(*)
      `
      )
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      logger.error("[ServicePointRepository] update error:", error);
      throw new Error(`Failed to update service point: ${error.message}`);
    }

    return updated;
  }

  /**
   * Eliminar service point
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("service_points")
      .delete()
      .eq("id", id);

    if (error) {
      logger.error("[ServicePointRepository] delete error:", error);
      throw new Error(`Failed to delete service point: ${error.message}`);
    }

    return true;
  }

  /**
   * Obtener estadísticas de revenue de un service point
   */
  async getRevenueStats(
    servicePointId: string,
    startDate?: string,
    endDate?: string
  ): Promise<ServicePointRevenueStats> {
    let query = this.supabase
      .from("revenue_streams")
      .select("*")
      .eq("service_point_id", servicePointId);

    if (startDate) {
      query = query.gte("transaction_date", startDate);
    }

    if (endDate) {
      query = query.lte("transaction_date", endDate);
    }

    const { data: revenues, error } = await query;

    if (error) {
      logger.error("[ServicePointRepository] getRevenueStats error:", error);
      throw new Error(`Failed to fetch revenue stats: ${error.message}`);
    }

    // Agrupar por stream type
    const streamTotals: Record<
      string,
      {
        gross_amount: number;
        partner_commission: number;
        network_revenue: number;
        count: number;
      }
    > = {};

    let totalGross = 0;
    let totalPartner = 0;
    let totalNetwork = 0;

    revenues?.forEach((rev: any) => {
      const streamType = rev.stream_type as RevenueStreamType;

      if (!streamTotals[streamType]) {
        streamTotals[streamType] = {
          gross_amount: 0,
          partner_commission: 0,
          network_revenue: 0,
          count: 0,
        };
      }

      streamTotals[streamType].gross_amount += Number(rev.gross_amount);
      streamTotals[streamType].partner_commission += Number(
        rev.partner_commission
      );
      streamTotals[streamType].network_revenue += Number(rev.network_revenue);
      streamTotals[streamType].count += 1;

      totalGross += Number(rev.gross_amount);
      totalPartner += Number(rev.partner_commission);
      totalNetwork += Number(rev.network_revenue);
    });

    return {
      service_point_id: servicePointId,
      total_gross_revenue: Number(totalGross.toFixed(2)),
      total_partner_commission: Number(totalPartner.toFixed(2)),
      total_network_revenue: Number(totalNetwork.toFixed(2)),
      revenue_by_stream: streamTotals as any,
      period_start: startDate || "",
      period_end: endDate || "",
    };
  }

  /**
   * Obtener estadísticas de toda la red
   */
  async getNetworkStats(
    startDate?: string,
    endDate?: string
  ): Promise<NetworkDashboardStats> {
    // Contar service points por tipo
    const { data: counts } = await this.supabase
      .from("service_points")
      .select("type");

    const totalCSP = counts?.filter((sp: any) => sp.type === "CSP").length || 0;
    const totalCSS = counts?.filter((sp: any) => sp.type === "CSS").length || 0;
    const totalCSH = counts?.filter((sp: any) => sp.type === "CSH").length || 0;

    // Obtener revenue streams
    let query = this.supabase.from("revenue_streams").select("*");

    if (startDate) {
      query = query.gte("transaction_date", startDate);
    }

    if (endDate) {
      query = query.lte("transaction_date", endDate);
    }

    const { data: revenues, error } = await query;

    if (error) {
      logger.error("[ServicePointRepository] getNetworkStats error:", error);
      throw new Error(`Failed to fetch network stats: ${error.message}`);
    }

    // Agrupar por stream type
    const streamTotals: Record<
      string,
      {
        gross_amount: number;
        partner_commission: number;
        network_revenue: number;
        count: number;
      }
    > = {};

    let totalGross = 0;
    let totalPartner = 0;
    let totalNetwork = 0;

    revenues?.forEach((rev: any) => {
      const streamType = rev.stream_type as RevenueStreamType;

      if (!streamTotals[streamType]) {
        streamTotals[streamType] = {
          gross_amount: 0,
          partner_commission: 0,
          network_revenue: 0,
          count: 0,
        };
      }

      streamTotals[streamType].gross_amount += Number(rev.gross_amount);
      streamTotals[streamType].partner_commission += Number(
        rev.partner_commission
      );
      streamTotals[streamType].network_revenue += Number(rev.network_revenue);
      streamTotals[streamType].count += 1;

      totalGross += Number(rev.gross_amount);
      totalPartner += Number(rev.partner_commission);
      totalNetwork += Number(rev.network_revenue);
    });

    return {
      total_service_points: totalCSP + totalCSS + totalCSH,
      total_csp: totalCSP,
      total_css: totalCSS,
      total_csh: totalCSH,
      total_gross_revenue: Number(totalGross.toFixed(2)),
      total_partner_commission: Number(totalPartner.toFixed(2)),
      total_network_revenue: Number(totalNetwork.toFixed(2)),
      revenue_by_stream: streamTotals as any,
      period_start: startDate || "",
      period_end: endDate || "",
    };
  }

  /**
   * Verificar si existe un service point por nombre
   */
  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    let query = this.supabase
      .from("service_points")
      .select("id")
      .eq("name", name);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data } = await query;

    return (data?.length || 0) > 0;
  }
}
