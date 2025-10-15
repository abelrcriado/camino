/**
 * Repository Layer: VendingTransaction
 * Data access for vending transactions
 */

import { BaseRepository } from "./base.repository";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  VendingTransaction,
  CreateVendingTransactionDto,
  VendingTransactionFilters,
  VendingTransactionStats,
  VendingTransactionStatsByPeriod,
  VendingTransactionFull,
} from "../dto/vending_transaction.dto";
import { supabase } from "../services/supabase";

export class VendingTransactionRepository extends BaseRepository<VendingTransaction> {
  constructor(supabaseClient?: SupabaseClient) {
    super(supabaseClient || supabase, "vending_transactions");
  }

  /**
   * Buscar transacciones con filtros
   */
  async findByFilters(
    filters: VendingTransactionFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: VendingTransaction[]; count: number }> {
    let query = this.db
      .from(this.tableName)
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Aplicar filtros
    if (filters.machine_id) {
      query = query.eq("machine_id", filters.machine_id);
    }
    if (filters.slot_id) {
      query = query.eq("slot_id", filters.slot_id);
    }
    if (filters.producto_id) {
      query = query.eq("producto_id", filters.producto_id);
    }
    if (filters.metodo_pago) {
      query = query.eq("metodo_pago", filters.metodo_pago);
    }
    if (filters.start_date) {
      query = query.gte("created_at", filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte("created_at", filters.end_date);
    }
    if (filters.precio_min) {
      query = query.gte("precio_total", filters.precio_min);
    }
    if (filters.precio_max) {
      query = query.lte("precio_total", filters.precio_max);
    }

    // Aplicar paginación
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Error fetching transactions: ${error.message}`);
    }

    return { data: data || [], count: count || 0 };
  }

  /**
   * Buscar transacciones con información completa (JOIN)
   */
  async findByFiltersWithDetails(
    filters: VendingTransactionFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: VendingTransactionFull[]; count: number }> {
    let query = this.db
      .from(this.tableName)
      .select(
        `
        *,
        vending_machine_slots!slot_id (
          slot_number,
          machine_id,
          vending_machines!machine_id (
            name
          )
        ),
        productos!producto_id (
          nombre,
          sku
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    // Aplicar filtros (mismo código que findByFilters)
    if (filters.machine_id) {
      query = query.eq("machine_id", filters.machine_id);
    }
    if (filters.slot_id) {
      query = query.eq("slot_id", filters.slot_id);
    }
    if (filters.producto_id) {
      query = query.eq("producto_id", filters.producto_id);
    }
    if (filters.metodo_pago) {
      query = query.eq("metodo_pago", filters.metodo_pago);
    }
    if (filters.start_date) {
      query = query.gte("created_at", filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte("created_at", filters.end_date);
    }
    if (filters.precio_min) {
      query = query.gte("precio_total", filters.precio_min);
    }
    if (filters.precio_max) {
      query = query.lte("precio_total", filters.precio_max);
    }

    // Aplicar paginación
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Error fetching transactions with details: ${error.message}`);
    }

    // Transformar datos anidados a estructura plana
    const flatData = (data || []).map((item: any) => ({
      ...item,
      slot_number: item.vending_machine_slots?.slot_number,
      machine_name: item.vending_machine_slots?.vending_machines?.name,
      producto_nombre: item.productos?.nombre,
      producto_sku: item.productos?.sku,
      // Remover objetos anidados
      vending_machine_slots: undefined,
      productos: undefined,
    }));

    return { data: flatData, count: count || 0 };
  }

  /**
   * Buscar transacciones por máquina
   */
  async findByMachineId(
    machineId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: VendingTransaction[]; count: number }> {
    return this.findByFilters({ machine_id: machineId }, page, limit);
  }

  /**
   * Buscar transacciones por slot
   */
  async findBySlotId(
    slotId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: VendingTransaction[]; count: number }> {
    return this.findByFilters({ slot_id: slotId }, page, limit);
  }

  /**
   * Buscar transacciones por producto
   */
  async findByProductoId(
    productoId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: VendingTransaction[]; count: number }> {
    return this.findByFilters({ producto_id: productoId }, page, limit);
  }

  /**
   * Obtener estadísticas de ventas
   */
  async getStats(
    filters: VendingTransactionFilters
  ): Promise<VendingTransactionStats> {
    // Query base para filtros
    let query = this.db.from(this.tableName).select("*");

    if (filters.machine_id) {
      query = query.eq("machine_id", filters.machine_id);
    }
    if (filters.start_date) {
      query = query.gte("created_at", filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte("created_at", filters.end_date);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching stats: ${error.message}`);
    }

    const transactions = data || [];

    // Calcular totales
    const revenue_total = transactions.reduce(
      (sum, t) => sum + t.precio_total,
      0
    );
    const num_transactions = transactions.length;
    const cantidad_total = transactions.reduce((sum, t) => sum + t.cantidad, 0);
    const revenue_promedio =
      num_transactions > 0 ? Math.round(revenue_total / num_transactions) : 0;

    // Top productos
    const productoMap = new Map<
      string,
      { cantidad_vendida: number; revenue: number }
    >();
    transactions.forEach((t) => {
      const current = productoMap.get(t.producto_id) || {
        cantidad_vendida: 0,
        revenue: 0,
      };
      productoMap.set(t.producto_id, {
        cantidad_vendida: current.cantidad_vendida + t.cantidad,
        revenue: current.revenue + t.precio_total,
      });
    });

    // Obtener nombres de productos
    const topProductsData = Array.from(productoMap.entries())
      .sort((a, b) => b[1].cantidad_vendida - a[1].cantidad_vendida)
      .slice(0, 5);

    // Obtener nombres de productos desde la base de datos
    const productIds = topProductsData.map(([id]) => id);
    const { data: productos } = await this.db
      .from("productos")
      .select("id, nombre")
      .in("id", productIds);

    const productNamesMap = new Map(
      (productos || []).map((p: any) => [p.id, p.nombre])
    );

    const top_products = topProductsData.map(([producto_id, stats]) => ({
      producto_id,
      producto_nombre: productNamesMap.get(producto_id) || "Desconocido",
      cantidad_vendida: stats.cantidad_vendida,
      revenue: stats.revenue,
    }));

    // Por método de pago
    const metodoPagoMap = new Map<
      string,
      { num_transactions: number; revenue: number }
    >();
    transactions.forEach((t) => {
      const current = metodoPagoMap.get(t.metodo_pago) || {
        num_transactions: 0,
        revenue: 0,
      };
      metodoPagoMap.set(t.metodo_pago, {
        num_transactions: current.num_transactions + 1,
        revenue: current.revenue + t.precio_total,
      });
    });

    const by_metodo_pago = Array.from(metodoPagoMap.entries()).map(
      ([metodo_pago, stats]) => ({
        metodo_pago: metodo_pago as any,
        num_transactions: stats.num_transactions,
        revenue: stats.revenue,
      })
    );

    // Por máquina
    const machineMap = new Map<
      string,
      { num_transactions: number; revenue: number }
    >();
    transactions.forEach((t) => {
      const current = machineMap.get(t.machine_id) || {
        num_transactions: 0,
        revenue: 0,
      };
      machineMap.set(t.machine_id, {
        num_transactions: current.num_transactions + 1,
        revenue: current.revenue + t.precio_total,
      });
    });

    // Obtener nombres de máquinas
    const machineIds = Array.from(machineMap.keys());
    const { data: machines } = await this.db
      .from("vending_machines")
      .select("id, name")
      .in("id", machineIds);

    const machineNamesMap = new Map(
      (machines || []).map((m: any) => [m.id, m.name])
    );

    const by_machine = Array.from(machineMap.entries()).map(
      ([machine_id, stats]) => ({
        machine_id,
        machine_name: machineNamesMap.get(machine_id) || "Desconocido",
        num_transactions: stats.num_transactions,
        revenue: stats.revenue,
      })
    );

    return {
      revenue_total,
      num_transactions,
      cantidad_total,
      revenue_promedio,
      top_products,
      by_metodo_pago,
      by_machine,
    };
  }

  /**
   * Obtener estadísticas por periodo
   */
  async getStatsByPeriod(
    filters: VendingTransactionFilters,
    groupBy: "day" | "week" | "month" = "day"
  ): Promise<VendingTransactionStatsByPeriod[]> {
    // Query base
    let query = this.db.from(this.tableName).select("*");

    if (filters.machine_id) {
      query = query.eq("machine_id", filters.machine_id);
    }
    if (filters.start_date) {
      query = query.gte("created_at", filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte("created_at", filters.end_date);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching stats by period: ${error.message}`);
    }

    const transactions = data || [];

    // Agrupar por periodo
    const periodMap = new Map<
      string,
      { num_transactions: number; revenue: number; cantidad_total: number }
    >();

    transactions.forEach((t) => {
      const date = new Date(t.created_at);
      let periodo: string;

      if (groupBy === "day") {
        periodo = date.toISOString().split("T")[0]; // YYYY-MM-DD
      } else if (groupBy === "week") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        periodo = weekStart.toISOString().split("T")[0];
      } else {
        // month
        periodo = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      }

      const current = periodMap.get(periodo) || {
        num_transactions: 0,
        revenue: 0,
        cantidad_total: 0,
      };
      periodMap.set(periodo, {
        num_transactions: current.num_transactions + 1,
        revenue: current.revenue + t.precio_total,
        cantidad_total: current.cantidad_total + t.cantidad,
      });
    });

    // Convertir a array y ordenar por periodo
    return Array.from(periodMap.entries())
      .map(([periodo, stats]) => ({
        periodo,
        ...stats,
      }))
      .sort((a, b) => a.periodo.localeCompare(b.periodo));
  }
}
