/**
 * Schemas de validación Zod para Inventory Items
 */

import { z } from "zod";
import {
  uuidSchema,
  nameSchema,
  descriptionSchema,
  priceSchema,
  quantitySchema,
} from "./common.schema";
import { INVENTORY_ITEM_TYPE_VALUES } from "@/shared/constants/enums";

/**
 * Tipo de item
 * Usa enum centralizado para consistencia
 */
const itemTypeSchema = z
  .enum(INVENTORY_ITEM_TYPE_VALUES as [string, ...string[]], {
    message: "Tipo debe ser: spare_part, tool, accessory, consumable o other",
  })
  .optional();

/**
 * Schema para crear item de inventario (POST)
 */
export const createInventoryItemSchema = z
  .object({
    inventory_id: uuidSchema,
    name: z.string().min(2).max(100),
    description: descriptionSchema,
    sku: z.string().optional(),
    price: priceSchema.optional(),
    quantity: quantitySchema,
    type: itemTypeSchema,
  })
  .strict();

/**
 * Schema para actualizar item de inventario (PUT)
 */
export const updateInventoryItemSchema = z
  .object({
    id: uuidSchema,
    inventory_id: uuidSchema.optional(),
    name: nameSchema,
    description: descriptionSchema,
    sku: z.string().optional(),
    price: priceSchema.optional(),
    quantity: quantitySchema.optional(),
    type: itemTypeSchema,
  })
  .strict();

/**
 * Schema para eliminar item (DELETE)
 */
export const deleteInventoryItemSchema = z
  .object({
    id: uuidSchema,
  })
  .strict();

/**
 * Schema para query parameters de GET
 */
export const queryInventoryItemSchema = z
  .object({
    inventory_id: uuidSchema.optional(),
    type: itemTypeSchema,
  })
  .optional();

// Tipos TypeScript inferidos
export type CreateInventoryItemInput = z.infer<
  typeof createInventoryItemSchema
>;
export type UpdateInventoryItemInput = z.infer<
  typeof updateInventoryItemSchema
>;
export type DeleteInventoryItemInput = z.infer<
  typeof deleteInventoryItemSchema
>;
export type QueryInventoryItemInput = z.infer<typeof queryInventoryItemSchema>;
