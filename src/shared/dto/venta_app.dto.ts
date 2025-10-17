/**
 * Data Transfer Objects for Ventas App
 * Sprint 4.1 - Sistema de Ventas desde App Móvil
 */

/**
 * Estado del flujo de venta
 */
export type EstadoVenta =
  | "borrador"
  | "reservado"
  | "pagado"
  | "completado"
  | "cancelado"
  | "expirado";

/**
 * Venta desde la aplicación móvil
 */
export interface VentaApp {
  id: string;
  slot_id: string;
  user_id?: string;
  payment_id?: string;
  producto_id: string;
  producto_nombre: string;
  producto_sku?: string;
  cantidad: number;
  precio_unitario: number; // en céntimos
  precio_total: number; // en céntimos
  estado: EstadoVenta;
  codigo_retiro?: string;
  fecha_creacion: string;
  fecha_reserva?: string;
  fecha_pago?: string;
  fecha_expiracion?: string;
  fecha_retiro?: string;
  fecha_cancelacion?: string;
  notas?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

/**
 * DTO para crear una venta (estado inicial: borrador)
 */
export interface CreateVentaAppDto {
  slot_id: string;
  user_id?: string;
  producto_id: string;
  cantidad?: number; // default 1
  metadata?: Record<string, unknown>;
}

/**
 * DTO para actualizar una venta
 */
export interface UpdateVentaAppDto {
  id: string;
  estado?: EstadoVenta;
  payment_id?: string;
  notas?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Filtros para búsqueda de ventas
 */
export interface VentaAppFilters {
  user_id?: string;
  slot_id?: string;
  machine_id?: string;
  service_point_id?: string;
  producto_id?: string;
  estado?: EstadoVenta;
  codigo_retiro?: string;
  fecha_desde?: string; // ISO 8601
  fecha_hasta?: string; // ISO 8601
  precio_min?: number;
  precio_max?: number;
}

/**
 * Venta con información completa (JOIN con slots, máquinas, etc)
 */
export interface VentaAppFull extends VentaApp {
  slot_number: number;
  machine_id: string;
  machine_name: string;
  service_point_id: string;
  service_point_name: string;
  minutos_restantes?: number;
  tiempo_retiro_minutos?: number;
}

/**
 * DTO para reservar stock de una venta
 */
export interface ReservarStockDto {
  venta_id: string;
}

/**
 * Response de reservar stock
 */
export interface ReservarStockResponse {
  venta_id: string;
  estado: EstadoVenta;
  fecha_reserva: string;
}

/**
 * DTO para confirmar pago de una venta
 */
export interface ConfirmarPagoDto {
  venta_id: string;
  payment_id: string;
  tiempo_expiracion_minutos?: number; // override del tiempo de la máquina
}

/**
 * Response de confirmar pago
 */
export interface ConfirmarPagoResponse {
  venta_id: string;
  estado: EstadoVenta;
  codigo_retiro: string;
  fecha_expiracion: string;
}

/**
 * DTO para confirmar retiro físico del producto
 */
export interface ConfirmarRetiroDto {
  venta_id: string;
  codigo_retiro: string;
}

/**
 * Response de confirmar retiro
 */
export interface ConfirmarRetiroResponse {
  venta_id: string;
  estado: EstadoVenta;
  fecha_retiro: string;
}

/**
 * DTO para cancelar una venta
 */
export interface CancelarVentaDto {
  venta_id: string;
  motivo?: string;
}

/**
 * Response de cancelar venta
 */
export interface CancelarVentaResponse {
  venta_id: string;
  estado: EstadoVenta;
  stock_liberado: number;
}

/**
 * Venta activa (reservada o pagada) de un usuario
 */
export interface VentaActiva {
  venta_id: string;
  slot_id: string;
  producto_nombre: string;
  cantidad: number;
  precio_total: number;
  estado: EstadoVenta;
  codigo_retiro?: string;
  fecha_expiracion?: string;
  tiempo_restante_minutos?: number;
}

/**
 * Venta próxima a expirar (para monitoreo)
 */
export interface VentaPorExpirar {
  venta_id: string;
  user_id?: string;
  slot_id: string;
  producto_nombre: string;
  cantidad: number;
  precio_total: number;
  codigo_retiro: string;
  fecha_pago: string;
  fecha_expiracion: string;
  minutos_restantes: number;
  machine_id: string;
  machine_name: string;
}

/**
 * Estadísticas agregadas de ventas
 */
export interface EstadisticasVentas {
  ventas_borrador: number;
  ventas_reservadas: number;
  ventas_pagadas: number;
  ventas_completadas: number;
  ventas_canceladas: number;
  ventas_expiradas: number;
  total_ventas: number;
  ingresos_completados: number; // en céntimos
  ingresos_pendientes: number; // en céntimos
  stock_actualmente_reservado: number;
  tiempo_promedio_retiro_minutos?: number;
  expiraciones_ultimas_24h: number;
}

/**
 * Response de liberar stock expirado (función automática)
 */
export interface LiberarStockExpiradoResponse {
  ventas_expiradas: number;
  stock_liberado: number;
}

/**
 * DTO para crear venta y procesar pago en un solo paso
 * (Para flujos de checkout rápido)
 */
export interface CrearYPagarVentaDto {
  slot_id: string;
  user_id?: string;
  producto_id: string;
  cantidad?: number;
  payment_id: string;
  tiempo_expiracion_minutos?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Response de crear y pagar venta
 */
export interface CrearYPagarVentaResponse {
  venta_id: string;
  producto_nombre: string;
  cantidad: number;
  precio_total: number;
  estado: EstadoVenta;
  codigo_retiro: string;
  fecha_expiracion: string;
  minutos_para_retirar: number;
}

/**
 * DTO para notificación de venta próxima a expirar
 */
export interface NotificacionVentaPorExpirar {
  venta_id: string;
  user_id?: string;
  minutos_restantes: number;
  codigo_retiro: string;
}
