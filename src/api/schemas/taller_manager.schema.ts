/**
 * Schemas de validación Zod para Taller Manager
 */

import { z } from "zod";
import {
  uuidSchema,
  nameSchema,
  emailSchema,
  phoneSchema,
} from "./common.schema";

/**
 * Schema para crear taller manager (POST)
 */
export const createTallerManagerSchema = z
  .object({
    workshop_id: uuidSchema,
    user_id: uuidSchema,
    name: z.string().min(2).max(150),
    email: emailSchema,
    phone: phoneSchema,
    role: z.string().optional(),
  })
  .strict();

/**
 * Schema para actualizar taller manager (PUT)
 */
export const updateTallerManagerSchema = z
  .object({
    id: uuidSchema,
    workshop_id: uuidSchema.optional(),
    user_id: uuidSchema.optional(),
    name: nameSchema,
    email: emailSchema.optional(),
    phone: phoneSchema,
    role: z.string().optional(),
  })
  .strict();

/**
 * Schema para eliminar taller manager (DELETE)
 */
export const deleteTallerManagerSchema = z
  .object({
    id: uuidSchema,
  })
  .strict();

/**
 * Schema para query parameters de GET
 */
export const queryTallerManagerSchema = z
  .object({
    workshop_id: uuidSchema.optional(),
    user_id: uuidSchema.optional(),
  })
  .optional();

// Tipos TypeScript inferidos
export type CreateTallerManagerInput = z.infer<
  typeof createTallerManagerSchema
>;
export type UpdateTallerManagerInput = z.infer<
  typeof updateTallerManagerSchema
>;
export type DeleteTallerManagerInput = z.infer<
  typeof deleteTallerManagerSchema
>;
export type QueryTallerManagerInput = z.infer<typeof queryTallerManagerSchema>;
