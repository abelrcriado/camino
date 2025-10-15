/**
 * Repository for Vending Transactions
 * Sistema de Historial de Ventas de Vending Machines
 * Data access layer with Supabase queries
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { BaseRepository } from "./base.repository";
import {
  VendingTransaction,
  CreateVendingTransactionDto,
  VendingTransactionFilters,
  VendingTransactionFull,
  VendingTransactionStats,
  ProductoVendido,
  MetodoPagoStats,
  VendingTransactionStatsByMachine,
  VendingTransactionStatsByProduct,
  VendingTransactionTrend,
  VendingTransactionDashboard,
  MetodoPago,
} from "../dto/vending_transaction.dto";

export class VendingTransactionRepository extends BaseRepository<VendingTransaction> {
  constructor(supabaseClient?: SupabaseClient) {
    super(supabaseClient!, "vending_transactions");
  }

  /**
   * Crear transacción manualmente
   * (Normalmente se crean automáticamente via trigger)
   */
  async createTransaction(
    dto: CreateVendingTransactionDto
  ): Promise<VendingTransaction> {
    const precio_total =
      dto.precio_unitario * (dto.cantidad !== undefined ? dto.cantidad : 1);

    const { data, error } = await this.db
      .from(this.tableName)
      .insert({
        slot_id: dto.slot_id,
        machine_id: dto.machine_id,
        producto_id: dto.producto_id,
        cantidad: dto.cantidad || 1,
        precio_unitario: dto.precio_unitario,
        precio_total,
        metodo_pago: dto.metodo_pago || "unknown",
        stock_antes: dto.stock_antes || null,
        stock_despues: dto.stock_despues || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating transaction: ${error.message}`);
    }

    return data as VendingTransaction;
  }

  /**
   * Obtener transacciones con información completa (JOIN)
   */
  async findFullTransactions(
    filters: VendingTransactionFilters = {}
  ): Promise<VendingTransactionFull[]> {
    let query = this.db
      .from(this.tableName)
      .select(
        `
        *,
        vending_machine_slots!inner (
          slot_number,
          activo,
          machine_id
        ),
        vending_machines!inner (
          name,
          codigo,
          ubicacion,
          service_point_id
        ),
        productos!inner (
          nombre,
          sku,
          categoria
        )
      `
      )
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

    if (filters.fecha_desde) {
      query = query.gte("created_at", filters.fecha_desde);
    }

    if (filters.fecha_hasta) {
      query = query.lte("created_at", filters.fecha_hasta);
    }

    if (filters.precio_min !== undefined) {
      query = query.gte("precio_total", filters.precio_min);
    }

    if (filters.precio_max !== undefined) {
      query = query.lte("precio_total", filters.precio_max);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error finding full transactions: ${error.message}`);
    }

    // Transformar resultado del JOIN
    return (data || []).map((row: any) => ({
      id: row.id,
      slot_id: row.slot_id,
      machine_id: row.machine_id,
      producto_id: row.producto_id,
      cantidad: row.cantidad,
      precio_unitario: parseFloat(row.precio_unitario),
      precio_total: parseFloat(row.precio_total),
      metodo_pago: row.metodo_pago,
      stock_antes: row.stock_antes,
      stock_despues: row.stock_despues,
      created_at: row.created_at,
      slot_number: row.vending_machine_slots.slot_number,
      slot_activo: row.vending_machine_slots.activo,
      machine_name: row.vending_machines.name,
      machine_codigo: row.vending_machines.codigo,
      machine_ubicacion: row.vending_machines.ubicacion,
      service_point_id: row.vending_machines.service_point_id,
      producto_nombre: row.productos.nombre,
      producto_sku: row.productos.sku,
      producto_categoria: row.productos.categoria,
    }));
  }

  /**
   * Obtener transacciones por máquina
   */
  async findByMachine(machineId: string): Promise<VendingTransaction[]> {
    const { data, error } = await this.db
      .from(this.tableName)
      .select("*")
      .eq("machine_id", machineId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Error finding transactions by machine: ${error.message}`);
    }

    return (data || []).map((row) => ({
      ...row,
      precio_unitario: parseFloat(row.precio_unitario),
      precio_total: parseFloat(row.precio_total),
    }));
  }

  /**
   * Obtener transacciones por slot
   */
  async findBySlot(slotId: string): Promise<VendingTransaction[]> {
    const { data, error } = await this.db
      .from(this.tableName)
      .select("*")
      .eq("slot_id", slotId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Error finding transactions by slot: ${error.message}`);
    }

    return (data || []).map((row) => ({
      ...row,
      precio_unitario: parseFloat(row.precio_unitario),
      precio_total: parseFloat(row.precio_total),
    }));
  }

  /**
   * Obtener transacciones por producto
   */
  async findByProduct(productId: string): Promise<VendingTransaction[]> {
    const { data, error } = await this.db
      .from(this.tableName)
      .select("*")
      .eq("producto_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Error finding transactions by product: ${error.message}`);
    }

    return (data || []).map((row) => ({
      ...row,
      precio_unitario: parseFloat(row.precio_unitario),
      precio_total: parseFloat(row.precio_total),
    }));
  }

  /**
   * Obtener estadísticas generales
   */
  async getStats(filters: {
    fecha_desde?: string;
    fecha_hasta?: string;
    machine_id?: string;
    producto_id?: string;
    metodo_pago?: MetodoPago;
  }): Promise<VendingTransactionStats> {
    // Construir query base
    let query = this.db.from(this.tableName).select("*");

    // Aplicar filtros
    if (filters.fecha_desde) {
      query = query.gte("created_at", filters.fecha_desde);
    }

    if (filters.fecha_hasta) {
      query = query.lte("created_at", filters.fecha_hasta);
    }

    if (filters.machine_id) {
      query = query.eq("machine_id", filters.machine_id);
    }

    if (filters.producto_id) {
      query = query.eq("producto_id", filters.producto_id);
    }

    if (filters.metodo_pago) {
      query = query.eq("metodo_pago", filters.metodo_pago);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error getting stats: ${error.message}`);
    }

    const transactions = data || [];

    // Calcular estadísticas básicas
    const total_transacciones = transactions.length;
    const total_productos_vendidos = transactions.reduce(
      (sum, t) => sum + t.cantidad,
      0
    );
    const revenue_total = transactions.reduce(
      (sum, t) => sum + parseFloat(t.precio_total),
      0
    );
    const ticket_promedio =
      total_transacciones > 0 ? revenue_total / total_transacciones : 0;

    // Estadísticas por período
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const transacciones_hoy = transactions.filter(
      (t) => new Date(t.created_at) >= today
    ).length;
    const revenue_hoy = transactions
      .filter((t) => new Date(t.created_at) >= today)
      .reduce((sum, t) => sum + parseFloat(t.precio_total), 0);

    const transacciones_semana = transactions.filter(
      (t) => new Date(t.created_at) >= weekAgo
    ).length;
    const revenue_semana = transactions
      .filter((t) => new Date(t.created_at) >= weekAgo)
      .reduce((sum, t) => sum + parseFloat(t.precio_total), 0);

    const transacciones_mes = transactions.filter(
      (t) => new Date(t.created_at) >= monthAgo
    ).length;
    const revenue_mes = transactions
      .filter((t) => new Date(t.created_at) >= monthAgo)
      .reduce((sum, t) => sum + parseFloat(t.precio_total), 0);

    // Top productos
    const top_productos = await this.getTopProducts(10, filters);

    // Por método de pago
    const por_metodo_pago = await this.getStatsByPaymentMethod(filters);

    return {
      total_transacciones,
      total_productos_vendidos,
      revenue_total,
      ticket_promedio,
      transacciones_hoy,
      revenue_hoy,
      transacciones_semana,
      revenue_semana,
      transacciones_mes,
      revenue_mes,
      top_productos,
      por_metodo_pago,
      fecha_desde: filters.fecha_desde,
      fecha_hasta: filters.fecha_hasta,
    };
  }

  /**
   * Obtener top productos vendidos
   */
  async getTopProducts(
    limit: number = 10,
    filters: {
      fecha_desde?: string;
      fecha_hasta?: string;
      machine_id?: string;
    } = {}
  ): Promise<ProductoVendido[]> {
    let query = this.db
      .from(this.tableName)
      .select(
        `
        producto_id,
        cantidad,
        precio_total,
        productos!inner (nombre, sku)
      `
      );

    if (filters.fecha_desde) {
      query = query.gte("created_at", filters.fecha_desde);
    }

    if (filters.fecha_hasta) {
      query = query.lte("created_at", filters.fecha_hasta);
    }

    if (filters.machine_id) {
      query = query.eq("machine_id", filters.machine_id);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error getting top products: ${error.message}`);
    }

    // Agrupar por producto
    const productMap = new Map<
      string,
      {
        producto_id: string;
        producto_nombre: string;
        producto_sku?: string;
        cantidad_total: number;
        revenue_total: number;
        num_transacciones: number;
      }
    >();

    (data || []).forEach((row: any) => {
      const key = row.producto_id;
      if (productMap.has(key)) {
        const existing = productMap.get(key)!;
        existing.cantidad_total += row.cantidad;
        existing.revenue_total += parseFloat(row.precio_total);
        existing.num_transacciones += 1;
      } else {
        productMap.set(key, {
          producto_id: row.producto_id,
          producto_nombre: row.productos.nombre,
          producto_sku: row.productos.sku,
          cantidad_total: row.cantidad,
          revenue_total: parseFloat(row.precio_total),
          num_transacciones: 1,
        });
      }
    });

    // Convertir a array y ordenar por cantidad vendida
    return Array.from(productMap.values())
      .sort((a, b) => b.cantidad_total - a.cantidad_total)
      .slice(0, limit);
  }

  /**
   * Obtener estadísticas por método de pago
   */
  async getStatsByPaymentMethod(filters: {
    fecha_desde?: string;
    fecha_hasta?: string;
    machine_id?: string;
  } = {}): Promise<MetodoPagoStats[]> {
    let query = this.db.from(this.tableName).select("metodo_pago, precio_total");

    if (filters.fecha_desde) {
      query = query.gte("created_at", filters.fecha_desde);
    }

    if (filters.fecha_hasta) {
      query = query.lte("created_at", filters.fecha_hasta);
    }

    if (filters.machine_id) {
      query = query.eq("machine_id", filters.machine_id);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error getting payment method stats: ${error.message}`);
    }

    const transactions = data || [];
    const totalTransacciones = transactions.length;
    const totalRevenue = transactions.reduce(
      (sum, t) => sum + parseFloat(t.precio_total),
      0
    );

    // Agrupar por método de pago
    const methodMap = new Map<
      string,
      { num_transacciones: number; revenue_total: number }
    >();

    transactions.forEach((t) => {
      const method = t.metodo_pago;
      if (methodMap.has(method)) {
        const existing = methodMap.get(method)!;
        existing.num_transacciones += 1;
        existing.revenue_total += parseFloat(t.precio_total);
      } else {
        methodMap.set(method, {
          num_transacciones: 1,
          revenue_total: parseFloat(t.precio_total),
        });
      }
    });

    // Convertir a array con porcentajes
    return Array.from(methodMap.entries()).map(([method, stats]) => ({
      metodo_pago: method as MetodoPago,
      num_transacciones: stats.num_transacciones,
      revenue_total: stats.revenue_total,
      porcentaje_transacciones:
        totalTransacciones > 0
          ? (stats.num_transacciones / totalTransacciones) * 100
          : 0,
      porcentaje_revenue:
        totalRevenue > 0 ? (stats.revenue_total / totalRevenue) * 100 : 0,
    }));
  }

  /**
   * Contar transacciones totales
   */
  async count(filters: VendingTransactionFilters = {}): Promise<number> {
    let query = this.db
      .from(this.tableName)
      .select("*", { count: "exact", head: true });

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

    if (filters.fecha_desde) {
      query = query.gte("created_at", filters.fecha_desde);
    }

    if (filters.fecha_hasta) {
      query = query.lte("created_at", filters.fecha_hasta);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Error counting transactions: ${error.message}`);
    }

    return count || 0;
  }
}
