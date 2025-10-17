// ============================================================================
// Sprint 3.2: Vending Machine Slots - Schema Layer (Zod Validation)
// ============================================================================

import { z } from "zod";
import { uuidSchema } from "./common.schema";

// ============================================================================
// CONSTANTS
// ============================================================================

export const POLITICAS_RESERVA = [
  "hard_reservation",
  "soft_reservation",
  "no_reservation",
] as const;

export const MAX_SLOTS_PER_MACHINE = 100;
export const MIN_CAPACIDAD = 1;
export const MAX_CAPACIDAD = 1000;
export const DEFAULT_CAPACIDAD = 10;
export const MIN_TIEMPO_EXPIRACION = 1;
export const MAX_TIEMPO_EXPIRACION = 1440; // 24 horas

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema: createVendingMachineSlotSchema
 * Validación para creación de slot individual
 */
export const createVendingMachineSlotSchema = z
  .object({
    machine_id: uuidSchema,

    slot_number: z
      .number()
      .int("Número de slot debe ser un entero")
      .positive("Número de slot debe ser positivo"),

    producto_id: uuidSchema.nullable().optional(),

    capacidad_maxima: z
      .number()
      .int("Capacidad máxima debe ser un entero")
      .min(MIN_CAPACIDAD, `Capacidad mínima es ${MIN_CAPACIDAD}`)
      .max(MAX_CAPACIDAD, `Capacidad máxima es ${MAX_CAPACIDAD}`)
      .default(DEFAULT_CAPACIDAD)
      .optional(),

    stock_disponible: z
      .number()
      .int("Stock disponible debe ser un entero")
      .min(0, "Stock disponible no puede ser negativo")
      .default(0)
      .optional(),

    stock_reservado: z
      .number()
      .int("Stock reservado debe ser un entero")
      .min(0, "Stock reservado no puede ser negativo")
      .default(0)
      .optional(),

    precio_override: z
      .number()
      .int("Precio override debe ser un entero (centavos)")
      .positive("Precio override debe ser positivo")
      .nullable()
      .optional(),

    activo: z.boolean().default(true).optional(),

    notas: z
      .string()
      .max(500, "Notas no pueden exceder 500 caracteres")
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      const capacidad = data.capacidad_maxima ?? DEFAULT_CAPACIDAD;
      const disponible = data.stock_disponible ?? 0;
      const reservado = data.stock_reservado ?? 0;
      return disponible + reservado <= capacidad;
    },
    {
      message:
        "Stock total (disponible + reservado) no puede exceder capacidad máxima",
      path: ["stock_disponible"],
    }
  );

/**
 * Schema: updateVendingMachineSlotSchema
 * Validación para actualización de slot
 */
export const updateVendingMachineSlotSchema = z.object({
  id: uuidSchema,

  producto_id: uuidSchema.nullable().optional(),

  capacidad_maxima: z
    .number()
    .int("Capacidad máxima debe ser un entero")
    .min(MIN_CAPACIDAD, `Capacidad mínima es ${MIN_CAPACIDAD}`)
    .max(MAX_CAPACIDAD, `Capacidad máxima es ${MAX_CAPACIDAD}`)
    .optional(),

  stock_disponible: z
    .number()
    .int("Stock disponible debe ser un entero")
    .min(0, "Stock disponible no puede ser negativo")
    .optional(),

  stock_reservado: z
    .number()
    .int("Stock reservado debe ser un entero")
    .min(0, "Stock reservado no puede ser negativo")
    .optional(),

  precio_override: z
    .number()
    .int("Precio override debe ser un entero (centavos)")
    .positive("Precio override debe ser positivo")
    .nullable()
    .optional(),

  activo: z.boolean().optional(),

  notas: z
    .string()
    .max(500, "Notas no pueden exceder 500 caracteres")
    .nullable()
    .optional(),
});

/**
 * Schema: deleteVendingMachineSlotSchema
 * Validación para eliminación de slot
 */
export const deleteVendingMachineSlotSchema = z.object({
  id: uuidSchema,
});

/**
 * Schema: queryVendingMachineSlotSchema
 * Validación para consultas de slots
 */
export const queryVendingMachineSlotSchema = z.object({
  machine_id: uuidSchema.optional(),

  slot_number: z
    .number()
    .int("Número de slot debe ser un entero")
    .positive("Número de slot debe ser positivo")
    .optional(),

  producto_id: uuidSchema.optional(),

  activo: z.boolean().optional(),

  stock_bajo: z.boolean().optional(),

  sin_producto: z.boolean().optional(),

  page: z
    .number()
    .int("Página debe ser un entero")
    .positive("Página debe ser positiva")
    .default(1)
    .optional(),

  limit: z
    .number()
    .int("Límite debe ser un entero")
    .positive("Límite debe ser positivo")
    .max(100, "Límite máximo es 100")
    .default(20)
    .optional(),

  sort_by: z
    .enum(["slot_number", "stock_disponible", "created_at"])
    .default("slot_number")
    .optional(),

  sort_order: z.enum(["asc", "desc"]).default("asc").optional(),
});

/**
 * Schema: createSlotsForMachineSchema
 * Validación para creación masiva de slots
 */
export const createSlotsForMachineSchema = z.object({
  machine_id: uuidSchema,

  num_slots: z
    .number()
    .int("Número de slots debe ser un entero")
    .min(1, "Debe crear al menos 1 slot")
    .max(
      MAX_SLOTS_PER_MACHINE,
      `Máximo ${MAX_SLOTS_PER_MACHINE} slots por máquina`
    ),

  capacidad_maxima: z
    .number()
    .int("Capacidad máxima debe ser un entero")
    .min(MIN_CAPACIDAD, `Capacidad mínima es ${MIN_CAPACIDAD}`)
    .max(MAX_CAPACIDAD, `Capacidad máxima es ${MAX_CAPACIDAD}`)
    .default(DEFAULT_CAPACIDAD)
    .optional(),
});

/**
 * Schema: assignProductToSlotSchema
 * Validación para asignación de producto a slot
 */
export const assignProductToSlotSchema = z.object({
  slot_id: uuidSchema,

  producto_id: uuidSchema,

  stock_inicial: z
    .number()
    .int("Stock inicial debe ser un entero")
    .min(0, "Stock inicial no puede ser negativo"),
});

/**
 * Schema: slotReservationSchema
 * Validación para reserva de stock
 */
export const slotReservationSchema = z.object({
  slot_id: uuidSchema,

  cantidad: z
    .number()
    .int("Cantidad debe ser un entero")
    .positive("Cantidad debe ser positiva"),
});

/**
 * Schema: slotStockUpdateSchema
 * Validación para actualización de stock
 */
export const slotStockUpdateSchema = z
  .object({
    slot_id: uuidSchema,

    stock_disponible: z
      .number()
      .int("Stock disponible debe ser un entero")
      .min(0, "Stock disponible no puede ser negativo")
      .optional(),

    stock_reservado: z
      .number()
      .int("Stock reservado debe ser un entero")
      .min(0, "Stock reservado no puede ser negativo")
      .optional(),
  })
  .refine(
    (data) =>
      data.stock_disponible !== undefined || data.stock_reservado !== undefined,
    {
      message: "Debe especificar al menos stock_disponible o stock_reservado",
      path: ["stock_disponible"],
    }
  );

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateVendingMachineSlotInput = z.infer<
  typeof createVendingMachineSlotSchema
>;
export type UpdateVendingMachineSlotInput = z.infer<
  typeof updateVendingMachineSlotSchema
>;
export type DeleteVendingMachineSlotInput = z.infer<
  typeof deleteVendingMachineSlotSchema
>;
export type QueryVendingMachineSlotInput = z.infer<
  typeof queryVendingMachineSlotSchema
>;
export type CreateSlotsForMachineInput = z.infer<
  typeof createSlotsForMachineSchema
>;
export type AssignProductToSlotInput = z.infer<
  typeof assignProductToSlotSchema
>;
export type SlotReservationInput = z.infer<typeof slotReservationSchema>;
export type SlotStockUpdateInput = z.infer<typeof slotStockUpdateSchema>;
