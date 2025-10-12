/**
 * Schemas de validación Zod para Partner
 */

import { z } from "zod";
import {
  uuidSchema,
  nameSchema,
  descriptionSchema,
  phoneSchema,
  emailSchema,
  urlSchema,
} from "./common.schema";
import { PARTNER_TYPE_VALUES } from "../constants/enums";

/**
 * Tipo de partner
 * Usa enum centralizado para consistencia
 */
const partnerTypeSchema = z
  .enum(PARTNER_TYPE_VALUES as [string, ...string[]], {
    message:
      "Tipo debe ser: sponsor, collaborator, supplier, service_provider o other",
  })
  .optional();

/**
 * Schema para crear partner (POST)
 */
export const createPartnerSchema = z
  .object({
    name: z.string().min(2).max(150),
    description: descriptionSchema,
    logo_url: urlSchema,
    website_url: urlSchema,
    contact_email: emailSchema.optional(),
    contact_phone: z
      .string()
      .regex(/^[\d\s\-\+\(\)]+$/, "Debe ser un número de teléfono válido")
      .min(7, "Debe tener al menos 7 dígitos")
      .max(20, "Debe tener máximo 20 caracteres"),
    type: partnerTypeSchema,
  })
  .strict();

/**
 * Schema para actualizar partner (PUT)
 */
export const updatePartnerSchema = z
  .object({
    id: uuidSchema,
    name: nameSchema,
    description: descriptionSchema,
    logo_url: urlSchema,
    website_url: urlSchema,
    contact_email: emailSchema.optional(),
    contact_phone: phoneSchema.optional(),
    type: partnerTypeSchema,
  })
  .strict();

/**
 * Schema para eliminar partner (DELETE)
 */
export const deletePartnerSchema = z
  .object({
    id: uuidSchema,
  })
  .strict();

/**
 * Schema para query parameters de GET
 */
export const queryPartnerSchema = z
  .object({
    type: partnerTypeSchema,
  })
  .optional();

// Tipos TypeScript inferidos
export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
export type UpdatePartnerInput = z.infer<typeof updatePartnerSchema>;
export type DeletePartnerInput = z.infer<typeof deletePartnerSchema>;
export type QueryPartnerInput = z.infer<typeof queryPartnerSchema>;
