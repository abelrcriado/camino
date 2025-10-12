/**
 * Repository for Ventas App
 * Sprint 4.1 - Sistema de Ventas desde App Móvil
 * Data access layer with Supabase RPC calls
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { BaseRepository } from "./base.repository";
import {
  VentaApp,
  CreateVentaAppDto,
  UpdateVentaAppDto,
  VentaAppFilters,
  VentaAppFull,
  VentaActiva,
  VentaPorExpirar,
  EstadisticasVentas,
  ReservarStockResponse,
  ConfirmarPagoResponse,
  ConfirmarRetiroResponse,
  CancelarVentaResponse,
  LiberarStockExpiradoResponse,
  NotificacionVentaPorExpirar,
} from "../dto/venta_app.dto";

export class VentaAppRepository extends BaseRepository<VentaApp> {
  constructor(supabaseClient?: SupabaseClient) {
    super(supabaseClient!, "ventas_app");
  }

  /**
   * Crear venta usando función plpgsql (estado: borrador)
   */
  async crearVenta(dto: CreateVentaAppDto): Promise<VentaApp> {
    const { data, error } = await this.db.rpc("crear_venta_app", {
      p_slot_id: dto.slot_id,
      p_user_id: dto.user_id || null,
      p_producto_id: dto.producto_id,
      p_cantidad: dto.cantidad || 1,
      p_metadata: dto.metadata || null,
    });

    if (error) {
      throw new Error(`Error creating venta: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error("No data returned from crear_venta_app");
    }

    // La función retorna información parcial, necesitamos obtener la venta completa
    const ventaId = data[0].venta_id;
    const ventaResponse = await this.findById(ventaId);

    if (ventaResponse.error || !ventaResponse.data) {
      throw new Error("Venta created but not found");
    }

    return ventaResponse.data as VentaApp;
  }

  /**
   * Reservar stock de una venta (borrador → reservado)
   */
  async reservarStock(ventaId: string): Promise<ReservarStockResponse> {
    const { data, error } = await this.db.rpc("reservar_stock_venta", {
      p_venta_id: ventaId,
    });

    if (error) {
      throw new Error(`Error reserving stock: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error("No data returned from reservar_stock_venta");
    }

    return {
      venta_id: data[0].venta_id,
      estado: data[0].estado,
      fecha_reserva: data[0].fecha_reserva,
    };
  }

  /**
   * Confirmar pago de una venta (reservado → pagado)
   * Genera código de retiro y fecha de expiración
   */
  async confirmarPago(
    ventaId: string,
    paymentId: string,
    tiempoExpiracionMinutos?: number
  ): Promise<ConfirmarPagoResponse> {
    const { data, error } = await this.db.rpc("confirmar_pago_venta", {
      p_venta_id: ventaId,
      p_payment_id: paymentId,
      p_tiempo_expiracion_minutos: tiempoExpiracionMinutos || null,
    });

    if (error) {
      throw new Error(`Error confirming payment: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error("No data returned from confirmar_pago_venta");
    }

    return {
      venta_id: data[0].venta_id,
      estado: data[0].estado,
      codigo_retiro: data[0].codigo_retiro,
      fecha_expiracion: data[0].fecha_expiracion,
    };
  }

  /**
   * Confirmar retiro físico del producto (pagado → completado)
   */
  async confirmarRetiro(
    ventaId: string,
    codigoRetiro: string
  ): Promise<ConfirmarRetiroResponse> {
    const { data, error } = await this.db.rpc("confirmar_retiro_venta", {
      p_venta_id: ventaId,
      p_codigo_retiro: codigoRetiro.toUpperCase(),
    });

    if (error) {
      throw new Error(`Error confirming pickup: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error("No data returned from confirmar_retiro_venta");
    }

    return {
      venta_id: data[0].venta_id,
      estado: data[0].estado,
      fecha_retiro: data[0].fecha_retiro,
    };
  }

  /**
   * Cancelar venta y liberar stock si estaba reservado
   */
  async cancelarVenta(
    ventaId: string,
    motivo?: string
  ): Promise<CancelarVentaResponse> {
    const { data, error } = await this.db.rpc("cancelar_venta", {
      p_venta_id: ventaId,
      p_motivo: motivo || null,
    });

    if (error) {
      throw new Error(`Error canceling venta: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error("No data returned from cancelar_venta");
    }

    return {
      venta_id: data[0].venta_id,
      estado: data[0].estado,
      stock_liberado: data[0].stock_liberado,
    };
  }

  /**
   * Liberar stock de ventas expiradas (ejecutado por cron job)
   * También puede ser llamado manualmente por admin
   */
  async liberarStockExpirado(): Promise<LiberarStockExpiradoResponse> {
    const { data, error } = await this.db.rpc("liberar_stock_expirado");

    if (error) {
      throw new Error(`Error liberating expired stock: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return {
        ventas_expiradas: 0,
        stock_liberado: 0,
      };
    }

    return {
      ventas_expiradas: data[0].ventas_expiradas,
      stock_liberado: data[0].stock_liberado,
    };
  }

  /**
   * Obtener ventas activas (reservado/pagado) de un usuario
   */
  async getVentasActivasUsuario(userId: string): Promise<VentaActiva[]> {
    const { data, error } = await this.db.rpc("get_ventas_activas_usuario", {
      p_user_id: userId,
    });

    if (error) {
      throw new Error(`Error getting active ventas: ${error.message}`);
    }

    return (data || []).map((row: any) => ({
      venta_id: row.venta_id,
      slot_id: row.slot_id,
      producto_nombre: row.producto_nombre,
      cantidad: row.cantidad,
      precio_total: row.precio_total,
      estado: row.estado,
      codigo_retiro: row.codigo_retiro,
      fecha_expiracion: row.fecha_expiracion,
      tiempo_restante_minutos: row.tiempo_restante_minutos,
    }));
  }

  /**
   * Buscar venta por código de retiro
   */
  async findByCodigoRetiro(
    codigo: string
  ): Promise<{ data: VentaApp | null; error: unknown }> {
    try {
      const { data, error } = await this.db
        .from(this.tableName)
        .select("*")
        .eq("codigo_retiro", codigo)
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data: data as VentaApp, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Obtener ventas con información completa (JOIN con slots, máquinas, etc)
   */
  async findFullVentas(filters: VentaAppFilters = {}): Promise<VentaAppFull[]> {
    let query = this.db.from("v_ventas_full").select("*");

    // Aplicar filtros
    if (filters.user_id) {
      query = query.eq("user_id", filters.user_id);
    }

    if (filters.slot_id) {
      query = query.eq("slot_id", filters.slot_id);
    }

    if (filters.machine_id) {
      query = query.eq("machine_id", filters.machine_id);
    }

    if (filters.service_point_id) {
      query = query.eq("service_point_id", filters.service_point_id);
    }

    if (filters.producto_id) {
      query = query.eq("producto_id", filters.producto_id);
    }

    if (filters.estado) {
      query = query.eq("estado", filters.estado);
    }

    if (filters.codigo_retiro) {
      query = query.eq("codigo_retiro", filters.codigo_retiro.toUpperCase());
    }

    if (filters.fecha_desde) {
      query = query.gte("fecha_creacion", filters.fecha_desde);
    }

    if (filters.fecha_hasta) {
      query = query.lte("fecha_creacion", filters.fecha_hasta);
    }

    if (filters.precio_min !== undefined) {
      query = query.gte("precio_total", filters.precio_min);
    }

    if (filters.precio_max !== undefined) {
      query = query.lte("precio_total", filters.precio_max);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error finding full ventas: ${error.message}`);
    }

    return (data || []) as VentaAppFull[];
  }

  /**
   * Obtener ventas próximas a expirar
   */
  async getVentasPorExpirar(): Promise<VentaPorExpirar[]> {
    const { data, error } = await this.db
      .from("v_ventas_por_expirar")
      .select("*");

    if (error) {
      throw new Error(`Error getting ventas por expirar: ${error.message}`);
    }

    return (data || []) as VentaPorExpirar[];
  }

  /**
   * Obtener estadísticas agregadas de ventas
   */
  async getEstadisticas(): Promise<EstadisticasVentas> {
    const { data, error } = await this.db
      .from("v_estadisticas_ventas")
      .select("*")
      .single();

    if (error) {
      throw new Error(`Error getting estadisticas: ${error.message}`);
    }

    return data as EstadisticasVentas;
  }

  /**
   * Obtener notificaciones de ventas por expirar (< 5 minutos)
   */
  async getNotificacionesVentasPorExpirar(): Promise<
    NotificacionVentaPorExpirar[]
  > {
    const { data, error } = await this.db.rpc("notificar_ventas_por_expirar");

    if (error) {
      throw new Error(
        `Error getting notifications ventas por expirar: ${error.message}`
      );
    }

    return (data || []).map((row: any) => ({
      venta_id: row.venta_id,
      user_id: row.user_id,
      minutos_restantes: row.minutos_restantes,
      codigo_retiro: row.codigo_retiro,
    }));
  }

  /**
   * Contar ventas por estado
   */
  async countByEstado(estado: string): Promise<number> {
    const { count, error } = await this.db
      .from(this.tableName)
      .select("*", { count: "exact", head: true })
      .eq("estado", estado);

    if (error) {
      throw new Error(`Error counting ventas by estado: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Contar ventas por usuario
   */
  async countByUser(userId: string): Promise<number> {
    const { count, error } = await this.db
      .from(this.tableName)
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Error counting ventas by user: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Obtener ventas de un slot específico
   */
  async findBySlot(slotId: string): Promise<VentaApp[]> {
    const { data, error } = await this.db
      .from(this.tableName)
      .select("*")
      .eq("slot_id", slotId)
      .order("fecha_creacion", { ascending: false });

    if (error) {
      throw new Error(`Error finding ventas by slot: ${error.message}`);
    }

    return (data || []) as VentaApp[];
  }

  /**
   * Obtener ventas de una máquina específica (JOIN con slots)
   */
  async findByMachine(machineId: string): Promise<VentaAppFull[]> {
    return this.findFullVentas({ machine_id: machineId });
  }

  /**
   * Obtener ventas de un usuario específico
   */
  async findByUser(userId: string): Promise<VentaApp[]> {
    const { data, error } = await this.db
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId)
      .order("fecha_creacion", { ascending: false });

    if (error) {
      throw new Error(`Error finding ventas by user: ${error.message}`);
    }

    return (data || []) as VentaApp[];
  }

  /**
   * Validar si una venta existe por ID
   */
  async exists(id: string): Promise<boolean> {
    const result = await this.findById(id);
    return result.data !== null;
  }

  /**
   * Obtener ingresos totales por estado
   */
  async getIngresosByEstado(estado: string): Promise<number> {
    const { data, error } = await this.db
      .from(this.tableName)
      .select("precio_total")
      .eq("estado", estado);

    if (error) {
      throw new Error(`Error getting ingresos by estado: ${error.message}`);
    }

    const total = (data || []).reduce(
      (sum, venta) => sum + (venta.precio_total || 0),
      0
    );

    return total;
  }
}
