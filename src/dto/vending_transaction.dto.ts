/**
 * Data Transfer Objects for Vending Transactions
 * Sistema de Historial de Ventas de Vending Machines
 */

/**
 * Métodos de pago soportados
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
  precio_unitario: number; // en euros
  precio_total: number; // en euros
  metodo_pago: MetodoPago;
  stock_antes?: number;
  stock_despues?: number;
  created_at: string;
}

/**
 * DTO para crear una transacción manualmente
 * (Normalmente se crean automáticamente via trigger)
 */
export interface CreateVendingTransactionDto {
  slot_id: string;
  machine_id: string;
  producto_id: string;
  cantidad?: number; // default 1
  precio_unitario: number;
  metodo_pago?: MetodoPago; // default 'unknown'
  stock_antes?: number;
  stock_despues?: number;
}

/**
 * Filtros para búsqueda de transacciones
 */
export interface VendingTransactionFilters {
  machine_id?: string;
  slot_id?: string;
  producto_id?: string;
  metodo_pago?: MetodoPago;
  fecha_desde?: string; // ISO 8601
  fecha_hasta?: string; // ISO 8601
  precio_min?: number;
  precio_max?: number;
}

/**
 * Transacción con información completa (JOIN con slots, máquinas, productos)
 */
export interface VendingTransactionFull extends VendingTransaction {
  // Información del slot
  slot_number: number;
  slot_activo: boolean;
  
  // Información de la máquina
  machine_name: string;
  machine_codigo?: string;
  machine_ubicacion?: string;
  service_point_id?: string;
  
  // Información del producto
  producto_nombre: string;
  producto_sku?: string;
  producto_categoria?: string;
}

/**
 * Estadísticas agregadas de transacciones
 */
export interface VendingTransactionStats {
  // Estadísticas generales
  total_transacciones: number;
  total_productos_vendidos: number;
  revenue_total: number; // en euros
  ticket_promedio: number; // en euros
  
  // Por período
  transacciones_hoy: number;
  revenue_hoy: number;
  transacciones_semana: number;
  revenue_semana: number;
  transacciones_mes: number;
  revenue_mes: number;
  
  // Top productos
  top_productos: ProductoVendido[];
  
  // Por método de pago
  por_metodo_pago: MetodoPagoStats[];
  
  // Período consultado
  fecha_desde?: string;
  fecha_hasta?: string;
}

/**
 * Información de producto vendido para rankings
 */
export interface ProductoVendido {
  producto_id: string;
  producto_nombre: string;
  producto_sku?: string;
  cantidad_total: number;
  revenue_total: number;
  num_transacciones: number;
}

/**
 * Estadísticas por método de pago
 */
export interface MetodoPagoStats {
  metodo_pago: MetodoPago;
  num_transacciones: number;
  revenue_total: number;
  porcentaje_transacciones: number;
  porcentaje_revenue: number;
}

/**
 * Estadísticas de transacciones por máquina
 */
export interface VendingTransactionStatsByMachine {
  machine_id: string;
  machine_name: string;
  machine_codigo?: string;
  total_transacciones: number;
  total_productos_vendidos: number;
  revenue_total: number;
  ticket_promedio: number;
  top_productos: ProductoVendido[];
  fecha_desde?: string;
  fecha_hasta?: string;
}

/**
 * Estadísticas de transacciones por producto
 */
export interface VendingTransactionStatsByProduct {
  producto_id: string;
  producto_nombre: string;
  producto_sku?: string;
  total_vendido: number;
  revenue_total: number;
  num_transacciones: number;
  precio_promedio: number;
  maquinas_vendido: number; // número de máquinas donde se vendió
  fecha_desde?: string;
  fecha_hasta?: string;
}

/**
 * Tendencia de ventas por período (para gráficos)
 */
export interface VendingTransactionTrend {
  fecha: string; // YYYY-MM-DD o YYYY-MM-DD HH:00
  num_transacciones: number;
  revenue: number;
  productos_vendidos: number;
}

/**
 * Resumen de ventas para dashboard
 */
export interface VendingTransactionDashboard {
  // Métricas principales
  revenue_total: number;
  num_transacciones: number;
  productos_vendidos: number;
  ticket_promedio: number;
  
  // Comparación con período anterior
  revenue_cambio_porcentaje?: number;
  transacciones_cambio_porcentaje?: number;
  
  // Top 5
  top_5_productos: ProductoVendido[];
  top_5_maquinas: {
    machine_id: string;
    machine_name: string;
    revenue: number;
    num_transacciones: number;
  }[];
  
  // Tendencia últimos 7 días
  tendencia_7_dias: VendingTransactionTrend[];
  
  // Distribución por método de pago
  por_metodo_pago: MetodoPagoStats[];
}
