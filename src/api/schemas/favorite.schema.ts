/**
 * Schemas de validación Zod para Favorite
 */

import { z } from "zod";
import { uuidSchema } from "./common.schema";

/**
 * Schema para crear un favorito (POST)
 */
export const createFavoriteSchema = z
  .object({
    user_id: uuidSchema,
    service_point_id: uuidSchema,
    workshop_id: uuidSchema.optional(),
  })
  .strict();

/**
 * Schema para actualizar un favorito (PUT)
 */
export const updateFavoriteSchema = z
  .object({
    id: uuidSchema,
    user_id: uuidSchema.optional(),
    service_point_id: uuidSchema.optional(),
    workshop_id: uuidSchema.optional(),
  })
  .strict();

/**
 * Schema para eliminar un favorito (DELETE)
 */
export const deleteFavoriteSchema = z
  .object({
    id: uuidSchema,
  })
  .strict();

/**
 * Schema para query parameters de GET
 */
export const queryFavoriteSchema = z
  .object({
    user_id: uuidSchema.optional(),
    service_point_id: uuidSchema.optional(),
  })
  .optional();

// Tipos TypeScript inferidos
export type CreateFavoriteInput = z.infer<typeof createFavoriteSchema>;
export type UpdateFavoriteInput = z.infer<typeof updateFavoriteSchema>;
export type DeleteFavoriteInput = z.infer<typeof deleteFavoriteSchema>;
export type QueryFavoriteInput = z.infer<typeof queryFavoriteSchema>;
