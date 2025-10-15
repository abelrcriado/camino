/**
 * Zod Validation Schemas for Vending Transactions
 * Sistema de Historial de Ventas de Vending Machines
 */

import { z } from "zod";
import { uuidSchema } from "./common.schema";

// =====================================================
// Enums y constantes
// =====================================================

export const METODOS_PAGO = [
  "efectivo",
  "tarjeta",
  "qr",
  "app",
  "unknown",
] as const;

export const metodoPagoSchema = z.enum(METODOS_PAGO, {
  message: "Método de pago debe ser: efectivo, tarjeta, qr, app, unknown",
});

// Constantes de validación
export const MIN_CANTIDAD = 1;
export const MAX_CANTIDAD = 100;
export const MIN_PRECIO = 0.01; // 1 céntimo en euros
export const MAX_PRECIO = 10000; // 10,000€

// =====================================================
// Schema para crear transacción
// =====================================================

export const createVendingTransactionSchema = z
  .object({
    slot_id: uuidSchema,
    machine_id: uuidSchema,
    producto_id: uuidSchema,
    cantidad: z
      .number()
      .int()
      .min(MIN_CANTIDAD, `La cantidad debe ser al menos ${MIN_CANTIDAD}`)
      .max(MAX_CANTIDAD, `La cantidad no puede exceder ${MAX_CANTIDAD}`)
      .default(1),
    precio_unitario: z
      .number()
      .min(MIN_PRECIO, `El precio unitario debe ser al menos ${MIN_PRECIO}€`)
      .max(MAX_PRECIO, `El precio unitario no puede exceder ${MAX_PRECIO}€`),
    metodo_pago: metodoPagoSchema.default("unknown"),
    stock_antes: z
      .number()
      .int()
      .min(0, "Stock antes no puede ser negativo")
      .optional(),
    stock_despues: z
      .number()
      .int()
      .min(0, "Stock después no puede ser negativo")
      .optional(),
  })
  .strict()
  .refine(
    (data) => {
      if (data.stock_antes !== undefined && data.stock_despues !== undefined) {
        return data.stock_despues <= data.stock_antes;
      }
      return true;
    },
    {
      message: "Stock después debe ser menor o igual a stock antes",
    }
  );

export type CreateVendingTransactionInput = z.infer<
  typeof createVendingTransactionSchema
>;

// =====================================================
// Schema para consultar transacciones (GET con filtros)
// =====================================================

export const queryVendingTransactionsSchema = z.object({
  // Paginación
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),

  // Ordenamiento
  sort_by: z
    .enum([
      "created_at",
      "precio_total",
      "cantidad",
      "metodo_pago",
      "producto_nombre",
      "machine_name",
    ])
    .default("created_at"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),

  // Filtros
  machine_id: uuidSchema.optional(),
  slot_id: uuidSchema.optional(),
  producto_id: uuidSchema.optional(),
  metodo_pago: metodoPagoSchema.optional(),

  // Filtros de fecha (ISO 8601)
  fecha_desde: z.string().datetime().optional(),
  fecha_hasta: z.string().datetime().optional(),

  // Filtros de precio (en euros)
  precio_min: z.coerce.number().min(0).optional(),
  precio_max: z.coerce.number().max(MAX_PRECIO).optional(),
});

export type QueryVendingTransactionsInput = z.infer<
  typeof queryVendingTransactionsSchema
>;

// =====================================================
// Schema para estadísticas
// =====================================================

export const queryStatsSchema = z.object({
  // Período para estadísticas
  period: z
    .enum(["today", "week", "month", "year", "all", "custom"])
    .default("all"),

  // Fechas para período custom
  fecha_desde: z.string().datetime().optional(),
  fecha_hasta: z.string().datetime().optional(),

  // Filtros opcionales
  machine_id: uuidSchema.optional(),
  producto_id: uuidSchema.optional(),
  metodo_pago: metodoPagoSchema.optional(),

  // Límite para top productos
  top_limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type QueryStatsInput = z.infer<typeof queryStatsSchema>;

// =====================================================
// Schema para estadísticas por máquina
// =====================================================

export const queryStatsByMachineSchema = z.object({
  machine_id: uuidSchema,
  period: z
    .enum(["today", "week", "month", "year", "all", "custom"])
    .default("all"),
  fecha_desde: z.string().datetime().optional(),
  fecha_hasta: z.string().datetime().optional(),
  top_productos_limit: z.coerce.number().int().min(1).max(20).default(5),
});

export type QueryStatsByMachineInput = z.infer<
  typeof queryStatsByMachineSchema
>;

// =====================================================
// Schema para tendencias
// =====================================================

export const queryTrendSchema = z.object({
  // Período
  fecha_desde: z.string().datetime(),
  fecha_hasta: z.string().datetime(),

  // Granularidad: 'hour', 'day', 'week', 'month'
  granularity: z.enum(["hour", "day", "week", "month"]).default("day"),

  // Filtros opcionales
  machine_id: uuidSchema.optional(),
  producto_id: uuidSchema.optional(),
});

export type QueryTrendInput = z.infer<typeof queryTrendSchema>;

// =====================================================
// Schema para dashboard
// =====================================================

export const queryDashboardSchema = z.object({
  // Período actual
  period: z
    .enum(["today", "week", "month", "year", "custom"])
    .default("today"),
  fecha_desde: z.string().datetime().optional(),
  fecha_hasta: z.string().datetime().optional(),

  // Comparar con período anterior
  compare_previous: z.coerce.boolean().default(true),

  // Límites para tops
  top_productos_limit: z.coerce.number().int().min(1).max(10).default(5),
  top_maquinas_limit: z.coerce.number().int().min(1).max(10).default(5),
});

export type QueryDashboardInput = z.infer<typeof queryDashboardSchema>;

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

// =====================================================
// Schema compuesto para query con validaciones extras
// =====================================================

export const queryVendingTransactionsSchemaWithValidations =
  queryVendingTransactionsSchema
    .refine((data) => validateFechaRange(data), {
      message: "Rango de fechas inválido",
    })
    .refine((data) => validatePrecioRange(data), {
      message: "Rango de precios inválido",
    });

export const queryStatsSchemaWithValidations = queryStatsSchema.refine(
  (data) => {
    if (data.period === "custom") {
      if (!data.fecha_desde || !data.fecha_hasta) {
        throw new Error(
          "fecha_desde y fecha_hasta son requeridas para período custom"
        );
      }
    }
    return validateFechaRange(data);
  },
  {
    message: "Configuración de período inválida",
  }
);
