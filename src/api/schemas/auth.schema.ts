/**
 * Schemas Zod para validación de autenticación
 * 
 * Centraliza todas las validaciones de inputs para endpoints de auth
 */

import { z } from "zod";

/**
 * Schema para login
 */
export const loginSchema = z.object({
  email: z
    .string({ message: "Email es requerido" })
    .email("Email inválido")
    .toLowerCase()
    .trim(),
  password: z
    .string({ message: "Contraseña es requerida" })
    .min(6, "Contraseña debe tener al menos 6 caracteres"),
});

/**
 * Schema para registro de nuevo usuario
 */
export const registerSchema = z.object({
  email: z
    .string({ message: "Email es requerido" })
    .email("Email inválido")
    .toLowerCase()
    .trim(),
  password: z
    .string({ message: "Contraseña es requerida" })
    .min(8, "Contraseña debe tener al menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Contraseña debe contener al menos una mayúscula, una minúscula y un número"
    ),
  nombre: z
    .string({ message: "Nombre es requerido" })
    .min(2, "Nombre debe tener al menos 2 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres")
    .trim(),
  apellidos: z
    .string()
    .max(100, "Apellidos no pueden exceder 100 caracteres")
    .trim()
    .optional(),
  telefono: z
    .string()
    .regex(/^\+?[0-9]{9,15}$/, "Teléfono inválido")
    .optional(),
  rol: z
    .enum(["user", "partner", "admin"], {
      message: "Rol inválido. Debe ser: user, partner, admin",
    })
    .default("user")
    .optional(),
});

/**
 * Schema para actualizar perfil
 */
export const updateProfileSchema = z.object({
  nombre: z
    .string()
    .min(2, "Nombre debe tener al menos 2 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres")
    .trim()
    .optional(),
  apellidos: z
    .string()
    .max(100, "Apellidos no pueden exceder 100 caracteres")
    .trim()
    .optional(),
  telefono: z
    .string()
    .regex(/^\+?[0-9]{9,15}$/, "Teléfono inválido")
    .optional(),
  avatar_url: z
    .string()
    .url("URL de avatar inválida")
    .optional(),
  preferencias: z
    .record(z.string(), z.unknown())
    .optional(),
});

/**
 * Schema para reset de contraseña
 */
export const resetPasswordSchema = z.object({
  email: z
    .string({ message: "Email es requerido" })
    .email("Email inválido")
    .toLowerCase()
    .trim(),
});

/**
 * Schema para cambiar contraseña
 */
export const changePasswordSchema = z.object({
  current_password: z
    .string({ message: "Contraseña actual es requerida" })
    .min(6, "Contraseña actual debe tener al menos 6 caracteres"),
  new_password: z
    .string({ message: "Nueva contraseña es requerida" })
    .min(8, "Nueva contraseña debe tener al menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Nueva contraseña debe contener al menos una mayúscula, una minúscula y un número"
    ),
});

/**
 * Schema para verificar email
 */
export const verifyEmailSchema = z.object({
  token: z
    .string({ message: "Token es requerido" })
    .min(1, "Token no puede estar vacío"),
});

/**
 * Type inference exports
 */
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
