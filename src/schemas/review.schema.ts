/**
 * Schemas de validación Zod para Review
 */

import { z } from "zod";
import { uuidSchema } from "./common.schema";

/**
 * Schema de rating (1-5 estrellas)
 */
const ratingSchema = z
  .number()
  .int("El rating debe ser un número entero")
  .min(1, "El rating mínimo es 1")
  .max(5, "El rating máximo es 5");

/**
 * Schema para crear review (POST)
 */
export const createReviewSchema = z
  .object({
    user_id: uuidSchema,
    service_point_id: uuidSchema.optional(),
    workshop_id: uuidSchema.optional(),
    booking_id: uuidSchema.optional(),
    rating: ratingSchema,
    comment: z.string().max(5000, "Debe tener máximo 5000 caracteres").trim(),
  })
  .strict();

/**
 * Schema para actualizar review (PUT)
 */
export const updateReviewSchema = z
  .object({
    id: uuidSchema,
    rating: ratingSchema.optional(),
    comment: z
      .string()
      .max(5000, "Debe tener máximo 5000 caracteres")
      .trim()
      .optional(),
  })
  .strict();

/**
 * Schema para eliminar review (DELETE)
 */
export const deleteReviewSchema = z
  .object({
    id: uuidSchema,
  })
  .strict();

/**
 * Schema para query parameters de GET
 */
export const queryReviewSchema = z
  .object({
    user_id: uuidSchema.optional(),
    service_point_id: uuidSchema.optional(),
    workshop_id: uuidSchema.optional(),
    rating: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined))
      .pipe(ratingSchema.optional()),
  })
  .optional();

// Tipos TypeScript inferidos
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type DeleteReviewInput = z.infer<typeof deleteReviewSchema>;
export type QueryReviewInput = z.infer<typeof queryReviewSchema>;
