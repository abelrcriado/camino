/**
 * Schemas de validación Zod para Inventory
 */

import { z } from "zod";
import {
  uuidSchema,
  nameSchema,
  descriptionSchema,
  quantitySchema,
} from "./common.schema";

/**
 * Schema para crear inventario (POST)
 */
export const createInventorySchema = z
  .object({
    service_point_id: uuidSchema,
    name: z.string().min(2).max(100),
    description: descriptionSchema,
    quantity: quantitySchema,
    min_stock: quantitySchema,
    max_stock: quantitySchema.optional(),
  })
  .strict();

/**
 * Schema para actualizar inventario (PUT)
 */
export const updateInventorySchema = z
  .object({
    id: uuidSchema,
    service_point_id: uuidSchema.optional(),
    name: nameSchema,
    description: descriptionSchema,
    quantity: quantitySchema.optional(),
    min_stock: quantitySchema.optional(),
    max_stock: quantitySchema.optional(),
  })
  .strict();

/**
 * Schema para eliminar inventario (DELETE)
 */
export const deleteInventorySchema = z
  .object({
    id: uuidSchema,
  })
  .strict();

/**
 * Schema para query parameters de GET
 */
export const queryInventorySchema = z
  .object({
    service_point_id: uuidSchema.optional(),
  })
  .optional();

// Tipos TypeScript inferidos
export type CreateInventoryInput = z.infer<typeof createInventorySchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
export type DeleteInventoryInput = z.infer<typeof deleteInventorySchema>;
export type QueryInventoryInput = z.infer<typeof queryInventorySchema>;
