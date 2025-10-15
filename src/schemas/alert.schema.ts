// ============================================================================
// Sprint 7: Alerts System - Zod Validation Schemas
// ============================================================================

import { z } from "zod";

/**
 * Schema: AlertTipo
 * Validación de tipos de alertas
 */
export const alertTipoSchema = z.enum([
  "low_stock_vending",
  "low_stock_warehouse",
  "machine_offline",
  "machine_maintenance",
  "stock_critical",
  "restock_needed",
]);

/**
 * Schema: AlertSeveridad
 * Validación de severidad de alertas
 */
export const alertSeveridadSchema = z.enum(["info", "warning", "critical"]);

/**
 * Schema: createAlertSchema
 * Validación para crear una nueva alerta
 */
export const createAlertSchema = z.object({
  tipo: alertTipoSchema,
  severidad: alertSeveridadSchema,
  mensaje: z.string().min(1, "Mensaje es requerido").max(1000, "Mensaje muy largo"),
  entidad_tipo: z.string().max(50).optional().nullable(),
  entidad_id: z.string().uuid("UUID inválido para entidad_id").optional().nullable(),
  accion_requerida: z.boolean().optional().default(false),
});

/**
 * Schema: updateAlertSchema
 * Validación para actualizar una alerta
 */
export const updateAlertSchema = z.object({
  id: z.string().uuid("UUID inválido"),
  leida: z.boolean().optional(),
  mensaje: z.string().min(1).max(1000).optional(),
  severidad: alertSeveridadSchema.optional(),
});

/**
 * Schema: deleteAlertSchema
 * Validación para eliminar una alerta
 */
export const deleteAlertSchema = z.object({
  id: z.string().uuid("UUID inválido"),
});

/**
 * Schema: queryAlertSchema
 * Validación para filtros de consulta de alertas
 */
export const queryAlertSchema = z.object({
  tipo: alertTipoSchema.optional(),
  severidad: alertSeveridadSchema.optional(),
  leida: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .optional(),
  accion_requerida: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .optional(),
  entidad_tipo: z.string().max(50).optional(),
  entidad_id: z.string().uuid("UUID inválido").optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1))
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100))
    .optional(),
});

/**
 * Schema: marcarLeidaSchema
 * Validación para marcar alerta como leída/no leída
 */
export const marcarLeidaSchema = z.object({
  id: z.string().uuid("UUID inválido"),
  leida: z.boolean(),
});

/**
 * Type exports para TypeScript
 */
export type CreateAlertInput = z.infer<typeof createAlertSchema>;
export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;
export type DeleteAlertInput = z.infer<typeof deleteAlertSchema>;
export type QueryAlertInput = z.infer<typeof queryAlertSchema>;
export type MarcarLeidaInput = z.infer<typeof marcarLeidaSchema>;
