/**
 * Zod Validation Schemas for Ventas App
 * Sprint 4.1 - Sistema de Ventas desde App Móvil
 */

import { z } from "zod";
import { uuidSchema } from "./common.schema";

// =====================================================
// Enums y constantes
// =====================================================

export const ESTADOS_VENTA = [
  "borrador",
  "reservado",
  "pagado",
  "completado",
  "cancelado",
  "expirado",
] as const;

export const estadoVentaSchema = z.enum(ESTADOS_VENTA);

// Constantes de validación
export const MIN_CANTIDAD = 1;
export const MAX_CANTIDAD = 100;
export const MIN_PRECIO = 1; // 1 céntimo
export const MAX_PRECIO = 1000000; // 10,000€ en céntimos
export const MIN_TIEMPO_EXPIRACION = 1; // 1 minuto
export const MAX_TIEMPO_EXPIRACION = 1440; // 24 horas
export const CODIGO_RETIRO_REGEX = /^[A-Z0-9]{6,10}$/;

// =====================================================
// Schema para crear venta
// =====================================================

export const createVentaAppSchema = z.object({
  slot_id: uuidSchema,
  user_id: uuidSchema.optional(),
  producto_id: uuidSchema,
  cantidad: z
    .number()
    .int()
    .min(MIN_CANTIDAD, `La cantidad debe ser al menos ${MIN_CANTIDAD}`)
    .max(MAX_CANTIDAD, `La cantidad no puede exceder ${MAX_CANTIDAD}`)
    .default(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type CreateVentaAppInput = z.infer<typeof createVentaAppSchema>;

// =====================================================
// Schema para actualizar venta
// =====================================================

export const updateVentaAppSchema = z.object({
  id: uuidSchema,
  estado: estadoVentaSchema.optional(),
  payment_id: uuidSchema.optional(),
  notas: z
    .string()
    .max(1000, "Las notas no pueden exceder 1000 caracteres")
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type UpdateVentaAppInput = z.infer<typeof updateVentaAppSchema>;

// =====================================================
// Schema para eliminar venta
// =====================================================

export const deleteVentaAppSchema = z.object({
  id: uuidSchema,
});

export type DeleteVentaAppInput = z.infer<typeof deleteVentaAppSchema>;

// =====================================================
// Schema para reservar stock
// =====================================================

export const reservarStockSchema = z.object({
  venta_id: uuidSchema,
});

export type ReservarStockInput = z.infer<typeof reservarStockSchema>;

// =====================================================
// Schema para confirmar pago
// =====================================================

export const confirmarPagoSchema = z.object({
  venta_id: uuidSchema,
  payment_id: uuidSchema,
  tiempo_expiracion_minutos: z
    .number()
    .int()
    .min(
      MIN_TIEMPO_EXPIRACION,
      `El tiempo de expiración debe ser al menos ${MIN_TIEMPO_EXPIRACION} minuto`
    )
    .max(
      MAX_TIEMPO_EXPIRACION,
      `El tiempo de expiración no puede exceder ${MAX_TIEMPO_EXPIRACION} minutos`
    )
    .optional(),
});

export type ConfirmarPagoInput = z.infer<typeof confirmarPagoSchema>;

// =====================================================
// Schema para confirmar retiro
// =====================================================

export const confirmarRetiroSchema = z.object({
  venta_id: uuidSchema,
  codigo_retiro: z
    .string()
    .min(6, "El código de retiro debe tener al menos 6 caracteres")
    .max(10, "El código de retiro no puede exceder 10 caracteres")
    .regex(
      CODIGO_RETIRO_REGEX,
      "El código de retiro debe contener solo letras mayúsculas y números"
    )
    .transform((val) => val.toUpperCase()),
});

export type ConfirmarRetiroInput = z.infer<typeof confirmarRetiroSchema>;

// =====================================================
// Schema para cancelar venta
// =====================================================

export const cancelarVentaSchema = z.object({
  venta_id: uuidSchema,
  motivo: z
    .string()
    .max(500, "El motivo no puede exceder 500 caracteres")
    .optional(),
});

export type CancelarVentaInput = z.infer<typeof cancelarVentaSchema>;

// =====================================================
// Schema para crear y pagar venta (flujo rápido)
// =====================================================

export const crearYPagarVentaSchema = z.object({
  slot_id: uuidSchema,
  user_id: uuidSchema.optional(),
  producto_id: uuidSchema,
  cantidad: z.number().int().min(MIN_CANTIDAD).max(MAX_CANTIDAD).default(1),
  payment_id: uuidSchema,
  tiempo_expiracion_minutos: z
    .number()
    .int()
    .min(MIN_TIEMPO_EXPIRACION)
    .max(MAX_TIEMPO_EXPIRACION)
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type CrearYPagarVentaInput = z.infer<typeof crearYPagarVentaSchema>;

// =====================================================
// Schema para consultar ventas (GET con filtros)
// =====================================================

export const queryVentasSchema = z.object({
  // Paginación
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),

  // Ordenamiento
  sort_by: z
    .enum([
      "fecha_creacion",
      "fecha_pago",
      "fecha_retiro",
      "precio_total",
      "estado",
      "codigo_retiro",
    ])
    .default("fecha_creacion"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),

  // Filtros
  user_id: uuidSchema.optional(),
  slot_id: uuidSchema.optional(),
  machine_id: uuidSchema.optional(),
  service_point_id: uuidSchema.optional(),
  producto_id: uuidSchema.optional(),
  estado: estadoVentaSchema.optional(),
  codigo_retiro: z
    .string()
    .regex(CODIGO_RETIRO_REGEX, "Código de retiro inválido")
    .transform((val) => val.toUpperCase())
    .optional(),

  // Filtros de fecha (ISO 8601)
  fecha_desde: z.string().datetime().optional(),
  fecha_hasta: z.string().datetime().optional(),

  // Filtros de precio
  precio_min: z.coerce.number().int().min(0).optional(),
  precio_max: z.coerce.number().int().max(MAX_PRECIO).optional(),
});

export type QueryVentasInput = z.infer<typeof queryVentasSchema>;

// =====================================================
// Schema para obtener ventas activas de usuario
// =====================================================

export const getVentasActivasSchema = z.object({
  user_id: uuidSchema,
});

export type GetVentasActivasInput = z.infer<typeof getVentasActivasSchema>;

// =====================================================
// Schema para obtener ventas por expirar
// =====================================================

export const getVentasPorExpirarSchema = z.object({
  minutos: z.coerce.number().int().min(1).max(60).default(10),
});

export type GetVentasPorExpirarInput = z.infer<
  typeof getVentasPorExpirarSchema
>;

// =====================================================
// Schema para validar venta completa (al retornar)
// =====================================================

export const ventaAppResponseSchema = z.object({
  id: uuidSchema,
  slot_id: uuidSchema,
  user_id: uuidSchema.nullable(),
  payment_id: uuidSchema.nullable(),
  producto_id: uuidSchema,
  producto_nombre: z.string(),
  producto_sku: z.string().nullable(),
  cantidad: z.number().int().min(MIN_CANTIDAD).max(MAX_CANTIDAD),
  precio_unitario: z.number().int().min(MIN_PRECIO).max(MAX_PRECIO),
  precio_total: z.number().int().min(MIN_PRECIO),
  estado: estadoVentaSchema,
  codigo_retiro: z.string().regex(CODIGO_RETIRO_REGEX).nullable(),
  fecha_creacion: z.string().datetime(),
  fecha_reserva: z.string().datetime().nullable(),
  fecha_pago: z.string().datetime().nullable(),
  fecha_expiracion: z.string().datetime().nullable(),
  fecha_retiro: z.string().datetime().nullable(),
  fecha_cancelacion: z.string().datetime().nullable(),
  notas: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullable(),
});

export type VentaAppResponse = z.infer<typeof ventaAppResponseSchema>;

// =====================================================
// Schema para estadísticas de ventas
// =====================================================

export const estadisticasVentasResponseSchema = z.object({
  ventas_borrador: z.number().int().min(0),
  ventas_reservadas: z.number().int().min(0),
  ventas_pagadas: z.number().int().min(0),
  ventas_completadas: z.number().int().min(0),
  ventas_canceladas: z.number().int().min(0),
  ventas_expiradas: z.number().int().min(0),
  total_ventas: z.number().int().min(0),
  ingresos_completados: z.number().int().min(0),
  ingresos_pendientes: z.number().int().min(0),
  stock_actualmente_reservado: z.number().int().min(0),
  tiempo_promedio_retiro_minutos: z.number().nullable(),
  expiraciones_ultimas_24h: z.number().int().min(0),
});

export type EstadisticasVentasResponse = z.infer<
  typeof estadisticasVentasResponseSchema
>;

// =====================================================
// Validaciones personalizadas
// =====================================================

/**
 * Valida que fecha_hasta sea posterior a fecha_desde
 */
export const validateFechaRange = (data: {
  fecha_desde?: string;
  fecha_hasta?: string;
}) => {
  if (data.fecha_desde && data.fecha_hasta) {
    const desde = new Date(data.fecha_desde);
    const hasta = new Date(data.fecha_hasta);
    if (hasta <= desde) {
      throw new Error("fecha_hasta debe ser posterior a fecha_desde");
    }
  }
  return true;
};

/**
 * Valida que precio_max sea mayor que precio_min
 */
export const validatePrecioRange = (data: {
  precio_min?: number;
  precio_max?: number;
}) => {
  if (
    data.precio_min !== undefined &&
    data.precio_max !== undefined &&
    data.precio_max <= data.precio_min
  ) {
    throw new Error("precio_max debe ser mayor que precio_min");
  }
  return true;
};

/**
 * Valida que el estado de venta sea válido para la transición solicitada
 */
export const validateEstadoTransicion = (
  estadoActual: string,
  estadoNuevo: string
): boolean => {
  const transicionesValidas: Record<string, string[]> = {
    borrador: ["reservado", "cancelado"],
    reservado: ["pagado", "cancelado"],
    pagado: ["completado", "expirado", "cancelado"],
    completado: [], // Estado final, no permite transiciones
    cancelado: [], // Estado final, no permite transiciones
    expirado: [], // Estado final, no permite transiciones
  };

  const permitidas = transicionesValidas[estadoActual] || [];
  return permitidas.includes(estadoNuevo);
};

// =====================================================
// Schema compuesto para query con validaciones extras
// =====================================================

export const queryVentasSchemaWithValidations = queryVentasSchema
  .refine((data) => validateFechaRange(data), {
    message: "Rango de fechas inválido",
  })
  .refine((data) => validatePrecioRange(data), {
    message: "Rango de precios inválido",
  });
