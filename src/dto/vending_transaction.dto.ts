/**
 * Data Transfer Objects for Vending Transactions
 * Sprint 6.5 - Sistema de Historial de Ventas
 */

/**
 * Método de pago utilizado en la transacción
 */
export type MetodoPago = "efectivo" | "tarjeta" | "qr" | "app" | "unknown";

/**
 * Transacción de venta en vending machine
 */
export interface VendingTransaction {
  id: string;
  slot_id: string;
  machine_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number; // en céntimos
  precio_total: number; // en céntimos
  metodo_pago: MetodoPago;
  stock_antes?: number;
  stock_despues?: number;
  created_at: string;
}

/**
 * DTO para crear una transacción manualmente
 */
export interface CreateVendingTransactionDto {
  slot_id: string;
  machine_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
  metodo_pago: MetodoPago;
  stock_antes?: number;
  stock_despues?: number;
}

/**
 * DTO para actualizar una transacción
 */
export interface UpdateVendingTransactionDto {
  id: string;
  metodo_pago?: MetodoPago;
}

/**
 * Filtros para búsqueda de transacciones
 */
export interface VendingTransactionFilters {
  machine_id?: string;
  slot_id?: string;
  producto_id?: string;
  metodo_pago?: MetodoPago;
  start_date?: string; // ISO 8601
  end_date?: string; // ISO 8601
  precio_min?: number;
  precio_max?: number;
}

/**
 * Transacción con información expandida (JOIN con otras tablas)
 */
export interface VendingTransactionFull extends VendingTransaction {
  slot_number?: number;
  machine_name?: string;
  producto_nombre?: string;
  producto_sku?: string;
  service_point_id?: string;
  service_point_name?: string;
}

/**
 * Estadísticas de ventas
 */
export interface VendingTransactionStats {
  revenue_total: number; // en céntimos
  num_transactions: number;
  cantidad_total: number;
  revenue_promedio: number; // en céntimos
  top_products: Array<{
    producto_id: string;
    producto_nombre: string;
    cantidad_vendida: number;
    revenue: number; // en céntimos
  }>;
  by_metodo_pago: Array<{
    metodo_pago: MetodoPago;
    num_transactions: number;
    revenue: number; // en céntimos
  }>;
  by_machine: Array<{
    machine_id: string;
    machine_name: string;
    num_transactions: number;
    revenue: number; // en céntimos
  }>;
}

/**
 * Estadísticas por periodo
 */
export interface VendingTransactionStatsByPeriod {
  periodo: string; // '2025-10-15' para día, '2025-10' para mes
  num_transactions: number;
  revenue: number; // en céntimos
  cantidad_total: number;
}
