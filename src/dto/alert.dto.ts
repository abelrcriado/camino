// ============================================================================
// Sprint 7: Alerts System - DTO Layer
// ============================================================================

/**
 * Interface: Alert
 * Representa una alerta del sistema
 */
export interface Alert {
  id: string;
  tipo: AlertTipo;
  severidad: AlertSeveridad;
  mensaje: string;
  entidad_tipo: string | null;
  entidad_id: string | null;
  leida: boolean;
  accion_requerida: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Enum: AlertTipo
 * Tipos de alertas soportados
 */
export type AlertTipo =
  | "low_stock_vending"
  | "low_stock_warehouse"
  | "machine_offline"
  | "machine_maintenance"
  | "stock_critical"
  | "restock_needed";

/**
 * Enum: AlertSeveridad
 * Niveles de severidad de alertas
 */
export type AlertSeveridad = "info" | "warning" | "critical";

/**
 * Interface: CreateAlertDto
 * DTO para crear una nueva alerta
 */
export interface CreateAlertDto {
  tipo: AlertTipo;
  severidad: AlertSeveridad;
  mensaje: string;
  entidad_tipo?: string | null;
  entidad_id?: string | null;
  accion_requerida?: boolean;
}

/**
 * Interface: UpdateAlertDto
 * DTO para actualizar una alerta existente
 */
export interface UpdateAlertDto {
  id: string;
  leida?: boolean;
  mensaje?: string;
  severidad?: AlertSeveridad;
}

/**
 * Interface: AlertFilters
 * Filtros para consultas de alertas
 */
export interface AlertFilters {
  tipo?: AlertTipo;
  severidad?: AlertSeveridad;
  leida?: boolean;
  accion_requerida?: boolean;
  entidad_tipo?: string;
  entidad_id?: string;
}

/**
 * Interface: AlertCountResponse
 * Respuesta para el endpoint de conteo de alertas
 */
export interface AlertCountResponse {
  total: number;
  no_leidas: number;
  por_severidad: {
    info: number;
    warning: number;
    critical: number;
  };
  por_tipo: {
    low_stock_vending: number;
    low_stock_warehouse: number;
    machine_offline: number;
    machine_maintenance: number;
    stock_critical: number;
    restock_needed: number;
  };
}

/**
 * Interface: MarcarLeidaDto
 * DTO para marcar alerta como leída
 */
export interface MarcarLeidaDto {
  id: string;
  leida: boolean;
}
