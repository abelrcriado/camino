/**
 * Service for Vending Transactions
 * Sistema de Historial de Ventas de Vending Machines
 * Business logic layer
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { BaseService } from "./base.service";
import { VendingTransactionRepository } from "../repositories/vending_transaction.repository";
import {
  VendingTransaction,
  CreateVendingTransactionDto,
  VendingTransactionFilters,
  VendingTransactionFull,
  VendingTransactionStats,
  ProductoVendido,
  MetodoPagoStats,
  VendingTransactionStatsByMachine,
  VendingTransactionDashboard,
  VendingTransactionTrend,
  MetodoPago,
} from "../dto/vending_transaction.dto";
import { PaginationParams, PaginatedResponse } from "../types/pagination";

export class VendingTransactionService extends BaseService<VendingTransaction> {
  private transactionRepo: VendingTransactionRepository;

  constructor(supabaseClient?: SupabaseClient) {
    const repository = new VendingTransactionRepository(supabaseClient);
    super(repository);
    this.transactionRepo = repository;
  }

  /**
   * Crear transacción manualmente
   * (Normalmente se crean automáticamente via trigger)
   */
  async createTransaction(
    dto: CreateVendingTransactionDto
  ): Promise<VendingTransaction> {
    // Validación de negocio: verificar que el slot y producto existen
    // (En producción, esto debería verificarse con el repositorio)
    
    return await this.transactionRepo.createTransaction(dto);
  }

  /**
   * Obtener transacciones con información completa y paginación
   */
  async findFullTransactionsPaginated(
    filters: VendingTransactionFilters = {},
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<VendingTransactionFull>> {
    const transactions = await this.transactionRepo.findFullTransactions(
      filters
    );
    const total = await this.transactionRepo.count(filters);

    const { page, limit } = pagination;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = transactions.slice(start, end);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener transacciones por máquina con paginación
   */
  async findByMachinePaginated(
    machineId: string,
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<VendingTransaction>> {
    const transactions = await this.transactionRepo.findByMachine(machineId);
    const total = transactions.length;

    const { page, limit } = pagination;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = transactions.slice(start, end);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener transacciones por slot
   */
  async findBySlot(slotId: string): Promise<VendingTransaction[]> {
    return await this.transactionRepo.findBySlot(slotId);
  }

  /**
   * Obtener transacciones por producto
   */
  async findByProduct(productId: string): Promise<VendingTransaction[]> {
    return await this.transactionRepo.findByProduct(productId);
  }

  /**
   * Obtener estadísticas generales
   */
  async getStats(filters: {
    period?: "today" | "week" | "month" | "year" | "all" | "custom";
    fecha_desde?: string;
    fecha_hasta?: string;
    machine_id?: string;
    producto_id?: string;
    metodo_pago?: MetodoPago;
    top_limit?: number;
  }): Promise<VendingTransactionStats> {
    // Calcular rango de fechas según período
    const dateRange = this.calculateDateRange(
      filters.period || "all",
      filters.fecha_desde,
      filters.fecha_hasta
    );

    return await this.transactionRepo.getStats({
      fecha_desde: dateRange.fecha_desde,
      fecha_hasta: dateRange.fecha_hasta,
      machine_id: filters.machine_id,
      producto_id: filters.producto_id,
      metodo_pago: filters.metodo_pago,
    });
  }

  /**
   * Obtener estadísticas por máquina
   */
  async getStatsByMachine(
    machineId: string,
    filters: {
      period?: "today" | "week" | "month" | "year" | "all" | "custom";
      fecha_desde?: string;
      fecha_hasta?: string;
      top_productos_limit?: number;
    } = {}
  ): Promise<VendingTransactionStatsByMachine> {
    const dateRange = this.calculateDateRange(
      filters.period || "all",
      filters.fecha_desde,
      filters.fecha_hasta
    );

    const transactions = await this.transactionRepo.findByMachine(machineId);

    // Filtrar por fechas
    const filteredTransactions = transactions.filter((t) => {
      const createdAt = new Date(t.created_at);
      if (
        dateRange.fecha_desde &&
        createdAt < new Date(dateRange.fecha_desde)
      ) {
        return false;
      }
      if (dateRange.fecha_hasta && createdAt > new Date(dateRange.fecha_hasta)) {
        return false;
      }
      return true;
    });

    // Calcular estadísticas
    const total_transacciones = filteredTransactions.length;
    const total_productos_vendidos = filteredTransactions.reduce(
      (sum, t) => sum + t.cantidad,
      0
    );
    const revenue_total = filteredTransactions.reduce(
      (sum, t) => sum + t.precio_total,
      0
    );
    const ticket_promedio =
      total_transacciones > 0 ? revenue_total / total_transacciones : 0;

    // Top productos
    const top_productos = await this.transactionRepo.getTopProducts(
      filters.top_productos_limit || 5,
      {
        machine_id: machineId,
        fecha_desde: dateRange.fecha_desde,
        fecha_hasta: dateRange.fecha_hasta,
      }
    );

    // Obtener nombre de la máquina (simplificado, debería venir del repositorio)
    const machine_name = "Vending Machine"; // TODO: Obtener del repositorio de máquinas

    return {
      machine_id: machineId,
      machine_name,
      total_transacciones,
      total_productos_vendidos,
      revenue_total,
      ticket_promedio,
      top_productos,
      fecha_desde: dateRange.fecha_desde,
      fecha_hasta: dateRange.fecha_hasta,
    };
  }

  /**
   * Obtener dashboard con métricas principales
   */
  async getDashboard(filters: {
    period?: "today" | "week" | "month" | "year" | "custom";
    fecha_desde?: string;
    fecha_hasta?: string;
    compare_previous?: boolean;
    top_productos_limit?: number;
    top_maquinas_limit?: number;
  } = {}): Promise<VendingTransactionDashboard> {
    const period = filters.period || "today";
    const topProductosLimit = filters.top_productos_limit || 5;
    const topMaquinasLimit = filters.top_maquinas_limit || 5;

    // Calcular rango de fechas actual
    const currentRange = this.calculateDateRange(
      period,
      filters.fecha_desde,
      filters.fecha_hasta
    );

    // Obtener estadísticas actuales
    const currentStats = await this.transactionRepo.getStats({
      fecha_desde: currentRange.fecha_desde,
      fecha_hasta: currentRange.fecha_hasta,
    });

    // Calcular cambio porcentual vs período anterior (si se solicita)
    let revenue_cambio_porcentaje: number | undefined;
    let transacciones_cambio_porcentaje: number | undefined;

    if (filters.compare_previous !== false) {
      const previousRange = this.calculatePreviousPeriodRange(
        period,
        currentRange
      );
      const previousStats = await this.transactionRepo.getStats({
        fecha_desde: previousRange.fecha_desde,
        fecha_hasta: previousRange.fecha_hasta,
      });

      revenue_cambio_porcentaje = this.calculatePercentageChange(
        previousStats.revenue_total,
        currentStats.revenue_total
      );
      transacciones_cambio_porcentaje = this.calculatePercentageChange(
        previousStats.total_transacciones,
        currentStats.total_transacciones
      );
    }

    // Top 5 productos
    const top_5_productos = currentStats.top_productos.slice(
      0,
      topProductosLimit
    );

    // Top 5 máquinas (simplificado)
    const top_5_maquinas: VendingTransactionDashboard["top_5_maquinas"] = [];
    // TODO: Implementar agrupación por máquina

    // Tendencia últimos 7 días
    const tendencia_7_dias = await this.getTrend({
      granularity: "day",
      fecha_desde: new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      fecha_hasta: new Date().toISOString(),
    });

    return {
      revenue_total: currentStats.revenue_total,
      num_transacciones: currentStats.total_transacciones,
      productos_vendidos: currentStats.total_productos_vendidos,
      ticket_promedio: currentStats.ticket_promedio,
      revenue_cambio_porcentaje,
      transacciones_cambio_porcentaje,
      top_5_productos,
      top_5_maquinas,
      tendencia_7_dias,
      por_metodo_pago: currentStats.por_metodo_pago,
    };
  }

  /**
   * Obtener tendencia de ventas por período
   */
  async getTrend(filters: {
    fecha_desde: string;
    fecha_hasta: string;
    granularity?: "hour" | "day" | "week" | "month";
    machine_id?: string;
    producto_id?: string;
  }): Promise<VendingTransactionTrend[]> {
    const granularity = filters.granularity || "day";

    // Obtener todas las transacciones del período
    let query: VendingTransactionFilters = {
      fecha_desde: filters.fecha_desde,
      fecha_hasta: filters.fecha_hasta,
    };

    if (filters.machine_id) {
      query.machine_id = filters.machine_id;
    }

    if (filters.producto_id) {
      query.producto_id = filters.producto_id;
    }

    const transactions = await this.transactionRepo.findFullTransactions(query);

    // Agrupar por granularidad
    const groupedData = new Map<
      string,
      { num_transacciones: number; revenue: number; productos_vendidos: number }
    >();

    transactions.forEach((t) => {
      const key = this.formatDateByGranularity(
        new Date(t.created_at),
        granularity
      );

      if (groupedData.has(key)) {
        const existing = groupedData.get(key)!;
        existing.num_transacciones += 1;
        existing.revenue += t.precio_total;
        existing.productos_vendidos += t.cantidad;
      } else {
        groupedData.set(key, {
          num_transacciones: 1,
          revenue: t.precio_total,
          productos_vendidos: t.cantidad,
        });
      }
    });

    // Convertir a array y ordenar por fecha
    return Array.from(groupedData.entries())
      .map(([fecha, stats]) => ({
        fecha,
        num_transacciones: stats.num_transacciones,
        revenue: stats.revenue,
        productos_vendidos: stats.productos_vendidos,
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  /**
   * Calcular rango de fechas según período
   */
  private calculateDateRange(
    period: "today" | "week" | "month" | "year" | "all" | "custom",
    fecha_desde?: string,
    fecha_hasta?: string
  ): { fecha_desde?: string; fecha_hasta?: string } {
    if (period === "custom") {
      return { fecha_desde, fecha_hasta };
    }

    if (period === "all") {
      return {};
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (period) {
      case "today":
        return {
          fecha_desde: today.toISOString(),
          fecha_hasta: new Date().toISOString(),
        };

      case "week":
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return {
          fecha_desde: weekAgo.toISOString(),
          fecha_hasta: new Date().toISOString(),
        };

      case "month":
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return {
          fecha_desde: monthAgo.toISOString(),
          fecha_hasta: new Date().toISOString(),
        };

      case "year":
        const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
        return {
          fecha_desde: yearAgo.toISOString(),
          fecha_hasta: new Date().toISOString(),
        };

      default:
        return {};
    }
  }

  /**
   * Calcular rango del período anterior
   */
  private calculatePreviousPeriodRange(
    period: "today" | "week" | "month" | "year" | "custom",
    currentRange: { fecha_desde?: string; fecha_hasta?: string }
  ): { fecha_desde?: string; fecha_hasta?: string } {
    if (!currentRange.fecha_desde || !currentRange.fecha_hasta) {
      return {};
    }

    const current_desde = new Date(currentRange.fecha_desde);
    const current_hasta = new Date(currentRange.fecha_hasta);
    const diff = current_hasta.getTime() - current_desde.getTime();

    const previous_hasta = new Date(current_desde.getTime() - 1);
    const previous_desde = new Date(previous_hasta.getTime() - diff);

    return {
      fecha_desde: previous_desde.toISOString(),
      fecha_hasta: previous_hasta.toISOString(),
    };
  }

  /**
   * Calcular cambio porcentual
   */
  private calculatePercentageChange(
    previous: number,
    current: number
  ): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
  }

  /**
   * Formatear fecha según granularidad
   */
  private formatDateByGranularity(
    date: Date,
    granularity: "hour" | "day" | "week" | "month"
  ): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");

    switch (granularity) {
      case "hour":
        return `${year}-${month}-${day} ${hour}:00`;
      case "day":
        return `${year}-${month}-${day}`;
      case "week":
        // Calcular número de semana del año
        const weekNumber = this.getWeekNumber(date);
        return `${year}-W${String(weekNumber).padStart(2, "0")}`;
      case "month":
        return `${year}-${month}`;
      default:
        return `${year}-${month}-${day}`;
    }
  }

  /**
   * Obtener número de semana del año
   */
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
}
