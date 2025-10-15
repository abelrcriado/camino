/**
 * Zod Validation Schemas for Vending Transactions
 * Sprint 6.5 - Sistema de Historial de Ventas
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

export const metodoPagoSchema = z.enum(METODOS_PAGO);

// Constantes de validación
export const MIN_CANTIDAD = 1;
export const MAX_CANTIDAD = 100;
export const MIN_PRECIO = 1; // 1 céntimo
export const MAX_PRECIO = 1000000; // 10,000€ en céntimos

// =====================================================
// Schema para crear transacción
// =====================================================

export const createVendingTransactionSchema = z.object({
  slot_id: uuidSchema,
  machine_id: uuidSchema,
  producto_id: uuidSchema,
  cantidad: z
    .number()
    .int()
    .min(MIN_CANTIDAD, `La cantidad debe ser al menos ${MIN_CANTIDAD}`)
    .max(MAX_CANTIDAD, `La cantidad no puede exceder ${MAX_CANTIDAD}`),
  precio_unitario: z
    .number()
    .int()
    .min(MIN_PRECIO, `El precio unitario debe ser al menos ${MIN_PRECIO} céntimos`)
    .max(MAX_PRECIO, `El precio unitario no puede exceder ${MAX_PRECIO} céntimos`),
  precio_total: z
    .number()
    .int()
    .min(MIN_PRECIO, `El precio total debe ser al menos ${MIN_PRECIO} céntimos`)
    .max(MAX_PRECIO * MAX_CANTIDAD, `El precio total no puede exceder ${MAX_PRECIO * MAX_CANTIDAD} céntimos`),
  metodo_pago: metodoPagoSchema,
  stock_antes: z
    .number()
    .int()
    .nonnegative("El stock antes debe ser un número no negativo")
    .optional(),
  stock_despues: z
    .number()
    .int()
    .nonnegative("El stock después debe ser un número no negativo")
    .optional(),
}).refine(
  (data) => data.precio_total === data.precio_unitario * data.cantidad,
  {
    message: "El precio_total debe ser igual a precio_unitario * cantidad",
    path: ["precio_total"],
  }
);

export type CreateVendingTransactionInput = z.infer<
  typeof createVendingTransactionSchema
>;

// =====================================================
// Schema para actualizar transacción
// =====================================================

export const updateVendingTransactionSchema = z.object({
  id: uuidSchema,
  metodo_pago: metodoPagoSchema.optional(),
});

export type UpdateVendingTransactionInput = z.infer<
  typeof updateVendingTransactionSchema
>;

// =====================================================
// Schema para eliminar transacción
// =====================================================

export const deleteVendingTransactionSchema = z.object({
  id: uuidSchema,
});

export type DeleteVendingTransactionInput = z.infer<
  typeof deleteVendingTransactionSchema
>;

// =====================================================
// Schema para consultar transacciones
// =====================================================

export const queryVendingTransactionsSchema = z.object({
  machine_id: uuidSchema.optional(),
  slot_id: uuidSchema.optional(),
  producto_id: uuidSchema.optional(),
  metodo_pago: metodoPagoSchema.optional(),
  start_date: z
    .string()
    .datetime({ message: "start_date debe ser una fecha ISO 8601 válida" })
    .optional(),
  end_date: z
    .string()
    .datetime({ message: "end_date debe ser una fecha ISO 8601 válida" })
    .optional(),
  precio_min: z
    .number()
    .int()
    .nonnegative("El precio mínimo debe ser un número no negativo")
    .optional(),
  precio_max: z
    .number()
    .int()
    .positive("El precio máximo debe ser un número positivo")
    .optional(),
  page: z.number().int().min(1, "La página debe ser al menos 1").default(1),
  limit: z
    .number()
    .int()
    .min(1, "El límite debe ser al menos 1")
    .max(100, "El límite no puede exceder 100")
    .default(10),
});

export type QueryVendingTransactionsInput = z.infer<
  typeof queryVendingTransactionsSchema
>;

// =====================================================
// Schema para estadísticas
// =====================================================

export const queryStatsSchema = z.object({
  machine_id: uuidSchema.optional(),
  start_date: z
    .string()
    .datetime({ message: "start_date debe ser una fecha ISO 8601 válida" })
    .optional(),
  end_date: z
    .string()
    .datetime({ message: "end_date debe ser una fecha ISO 8601 válida" })
    .optional(),
  period: z.enum(["today", "week", "month", "year", "all"]).optional(),
});

export type QueryStatsInput = z.infer<typeof queryStatsSchema>;

// =====================================================
// Schema para estadísticas por periodo
// =====================================================

export const queryStatsByPeriodSchema = z.object({
  machine_id: uuidSchema.optional(),
  start_date: z
    .string()
    .datetime({ message: "start_date debe ser una fecha ISO 8601 válida" })
    .optional(),
  end_date: z
    .string()
    .datetime({ message: "end_date debe ser una fecha ISO 8601 válida" })
    .optional(),
  group_by: z.enum(["day", "week", "month"]).default("day"),
});

export type QueryStatsByPeriodInput = z.infer<
  typeof queryStatsByPeriodSchema
>;
