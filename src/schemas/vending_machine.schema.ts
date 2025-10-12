/**
 * Schemas de validación Zod para Vending Machine
 */

import { z } from "zod";
import { uuidSchema, nameSchema, descriptionSchema } from "./common.schema";
import { VENDING_MACHINE_STATUS_VALUES } from "../constants/enums";

/**
 * Estado de la vending machine
 * Usa enum centralizado para consistencia
 */
const vendingMachineStatusSchema = z
  .enum(VENDING_MACHINE_STATUS_VALUES as [string, ...string[]], {
    message:
      "Status debe ser: operational, maintenance, out_of_service o low_stock",
  })
  .optional();

/**
 * Schema para crear vending machine (POST)
 */
export const createVendingMachineSchema = z
  .object({
    service_point_id: uuidSchema,
    name: z.string().min(2).max(150),
    description: descriptionSchema,
    model: z.string().optional(),
    serial_number: z.string().optional(),
    status: vendingMachineStatusSchema.default("operational"),
    capacity: z.number().int().positive().optional(),
    current_stock: z.number().int().nonnegative().optional(),
    last_refill_date: z.string().datetime().optional(),
    next_maintenance_date: z.string().datetime().optional(),
    total_sales: z.number().int().nonnegative().optional(),
    total_revenue: z.number().nonnegative().optional(),
    configuration: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

/**
 * Schema para actualizar vending machine (PUT)
 */
export const updateVendingMachineSchema = z
  .object({
    id: uuidSchema,
    service_point_id: uuidSchema.optional(),
    name: nameSchema,
    description: descriptionSchema,
    model: z.string().optional(),
    serial_number: z.string().optional(),
    status: vendingMachineStatusSchema,
    capacity: z.number().int().positive().optional(),
    current_stock: z.number().int().nonnegative().optional(),
    last_refill_date: z.string().datetime().optional(),
    next_maintenance_date: z.string().datetime().optional(),
    total_sales: z.number().int().nonnegative().optional(),
    total_revenue: z.number().nonnegative().optional(),
    configuration: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

/**
 * Schema para eliminar vending machine (DELETE)
 */
export const deleteVendingMachineSchema = z
  .object({
    id: uuidSchema,
  })
  .strict();

/**
 * Schema para query parameters de GET
 */
export const queryVendingMachineSchema = z
  .object({
    service_point_id: uuidSchema.optional(),
    status: vendingMachineStatusSchema,
  })
  .optional();

// Tipos TypeScript inferidos
export type CreateVendingMachineInput = z.infer<
  typeof createVendingMachineSchema
>;
export type UpdateVendingMachineInput = z.infer<
  typeof updateVendingMachineSchema
>;
export type DeleteVendingMachineInput = z.infer<
  typeof deleteVendingMachineSchema
>;
export type QueryVendingMachineInput = z.infer<
  typeof queryVendingMachineSchema
>;
