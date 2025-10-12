/**
 * Schemas de validación Zod para Workshop
 */

import { z } from "zod";
import {
  uuidSchema,
  nameSchema,
  descriptionSchema,
  emailSchema,
  urlSchema,
} from "./common.schema";

/**
 * Schema para crear workshop (POST)
 */
export const createWorkshopSchema = z
  .object({
    service_point_id: uuidSchema,
    name: z.string().min(3).max(150),
    description: descriptionSchema,
    specialties: z.array(z.string()).optional(),
    contact_phone: z
      .string()
      .regex(/^[\d\s\-\+\(\)]+$/, "Debe ser un número de teléfono válido")
      .min(7, "Debe tener al menos 7 dígitos")
      .max(20, "Debe tener máximo 20 caracteres"),
    contact_email: emailSchema.optional(),
    website_url: urlSchema,
    capacity: z.number().int().positive().optional(),
    equipment: z.record(z.string(), z.unknown()).optional(),
    certifications: z.array(z.string()).optional(),
  })
  .strict();

/**
 * Schema para actualizar workshop (PUT)
 */
export const updateWorkshopSchema = z
  .object({
    id: uuidSchema,
    service_point_id: uuidSchema.optional(),
    name: nameSchema,
    description: descriptionSchema,
    specialties: z.array(z.string()).optional(),
    contact_phone: z
      .string()
      .regex(/^[\d\s\-\+\(\)]+$/, "Debe ser un número de teléfono válido")
      .min(7, "Debe tener al menos 7 dígitos")
      .max(20, "Debe tener máximo 20 caracteres")
      .optional(),
    contact_email: emailSchema.optional(),
    website_url: urlSchema,
    capacity: z.number().int().positive().optional(),
    equipment: z.record(z.string(), z.unknown()).optional(),
    certifications: z.array(z.string()).optional(),
  })
  .strict();

/**
 * Schema para eliminar workshop (DELETE)
 */
export const deleteWorkshopSchema = z
  .object({
    id: uuidSchema,
  })
  .strict();

/**
 * Schema para query parameters de GET
 */
export const queryWorkshopSchema = z
  .object({
    service_point_id: uuidSchema.optional(),
  })
  .optional();

// Tipos TypeScript inferidos
export type CreateWorkshopInput = z.infer<typeof createWorkshopSchema>;
export type UpdateWorkshopInput = z.infer<typeof updateWorkshopSchema>;
export type DeleteWorkshopInput = z.infer<typeof deleteWorkshopSchema>;
export type QueryWorkshopInput = z.infer<typeof queryWorkshopSchema>;
