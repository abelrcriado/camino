/**
 * Schemas de validación Zod para User/Profile
 */

import { z } from "zod";
import {
  uuidSchema,
  emailSchema,
  nameSchema,
  phoneSchema,
  urlSchema,
  languageSchema,
  userRoleSchema,
} from "./common.schema";

/**
 * Schema para crear un nuevo usuario/perfil (POST)
 */
export const createUserSchema = z
  .object({
    id: uuidSchema,
    email: z.string().email({ message: "Debe ser un email válido" }),
    full_name: nameSchema.optional(),
    avatar_url: urlSchema.optional(),
    phone: phoneSchema.optional(),
    preferred_language: languageSchema.optional(),
    role: userRoleSchema.optional(),
  })
  .strict();

/**
 * Schema para actualizar un usuario/perfil (PUT)
 */
export const updateUserSchema = z
  .object({
    id: uuidSchema,
    email: emailSchema.optional(),
    full_name: nameSchema.optional(),
    avatar_url: urlSchema.optional(),
    phone: phoneSchema.optional(),
    preferred_language: languageSchema.optional(),
    role: userRoleSchema.optional(),
  })
  .strict();

/**
 * Schema para eliminar un usuario (DELETE)
 */
export const deleteUserSchema = z
  .object({
    id: uuidSchema,
  })
  .strict();

/**
 * Schema para query parameters de GET
 */
export const queryUserSchema = z
  .object({
    email: emailSchema.optional(),
    role: userRoleSchema,
  })
  .optional();

// Tipos TypeScript inferidos
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
export type QueryUserInput = z.infer<typeof queryUserSchema>;
