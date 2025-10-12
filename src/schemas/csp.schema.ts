/**
 * Schemas de validación Zod para CSP (Camino Service Point)
 */

import { z } from "zod";
import {
  uuidSchema,
  nameSchema,
  descriptionSchema,
  latitudeSchema,
  longitudeSchema,
  urlSchema,
} from "./common.schema";
import { CSP_TYPE_VALUES } from "../constants/enums";

/**
 * Tipo de Service Point
 * Usa enum centralizado para consistencia
 */
const servicePointTypeSchema = z
  .enum(CSP_TYPE_VALUES as [string, ...string[]], {
    message:
      "Tipo debe ser: bike_station, workshop, rest_area, info_point, water_point, charging_station, vending_machine, emergency_point o other",
  })
  .optional();

/**
 * Schema para crear CSP (POST)
 */
export const createCSPSchema = z
  .object({
    name: z.string().min(3).max(150),
    description: descriptionSchema,
    latitude: latitudeSchema.pipe(z.number()),
    longitude: longitudeSchema.pipe(z.number()),
    address: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    country: z
      .string()
      .length(2, "Country debe ser código de 2 letras (ej: ES, FR)")
      .optional(),
    postal_code: z.string().max(20).optional(),
    type: servicePointTypeSchema,
    image_url: urlSchema,
    contact_email: z.string().email().optional(),
    contact_phone: z.string().optional(),
    opening_hours: z.string().max(500).optional(),
  })
  .strict();

/**
 * Schema para actualizar CSP (PUT)
 */
export const updateCSPSchema = z
  .object({
    id: uuidSchema,
    name: nameSchema,
    description: descriptionSchema,
    latitude: latitudeSchema,
    longitude: longitudeSchema,
    address: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    country: z.string().length(2).optional(),
    postal_code: z.string().max(20).optional(),
    type: servicePointTypeSchema,
    image_url: urlSchema,
    contact_email: z.string().email().optional(),
    contact_phone: z.string().optional(),
    opening_hours: z.string().max(500).optional(),
  })
  .strict();

/**
 * Schema para eliminar CSP (DELETE)
 */
export const deleteCSPSchema = z
  .object({
    id: uuidSchema,
  })
  .strict();

/**
 * Schema para query parameters de GET
 */
export const queryCSPSchema = z
  .object({
    type: servicePointTypeSchema,
    city: z.string().optional(),
    country: z.string().optional(),
  })
  .optional();

// Tipos TypeScript inferidos
export type CreateCSPInput = z.infer<typeof createCSPSchema>;
export type UpdateCSPInput = z.infer<typeof updateCSPSchema>;
export type DeleteCSPInput = z.infer<typeof deleteCSPSchema>;
export type QueryCSPInput = z.infer<typeof queryCSPSchema>;
