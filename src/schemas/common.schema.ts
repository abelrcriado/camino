/**
 * Schemas comunes reutilizables con Zod
 *
 * Define validaciones estándar para usar en todos los endpoints
 */

import { z } from "zod";
import { USER_ROLE_VALUES, LANGUAGE_VALUES } from "../constants/enums";

// ============================================================================
// SCHEMAS DE TIPOS BÁSICOS
// ============================================================================

/**
 * Schema para UUID v4
 */
export const uuidSchema = z.string().uuid({
  message: "Debe ser un UUID válido",
});

/**
 * Schema para email
 */
export const emailSchema = z.string().email({
  message: "Debe ser un email válido",
});

/**
 * Schema para fechas ISO 8601
 */
export const isoDateSchema = z.string().datetime({
  message: "Debe ser una fecha en formato ISO 8601",
});

/**
 * Schema para URLs
 */
export const urlSchema = z
  .string()
  .url({
    message: "Debe ser una URL válida",
  })
  .optional();

/**
 * Schema para números de teléfono (formato flexible)
 */
export const phoneSchema = z
  .string()
  .regex(/^[\d\s\-\+\(\)]+$/, "Debe ser un número de teléfono válido")
  .min(7, "Debe tener al menos 7 dígitos")
  .max(20, "Debe tener máximo 20 caracteres")
  .optional();

// ============================================================================
// SCHEMAS DE PAGINACIÓN
// ============================================================================

/**
 * Schema para parámetros de paginación en query strings
 */
export const paginationSchema = z
  .object({
    page: z
      .string()
      .regex(/^\d+$/, "page debe ser un número")
      .transform(Number)
      .pipe(z.number().int().min(1))
      .optional(),
    limit: z
      .string()
      .regex(/^\d+$/, "limit debe ser un número")
      .transform(Number)
      .pipe(z.number().int().min(1).max(100))
      .optional(),
  })
  .optional();

// ============================================================================
// SCHEMAS DE TIMESTAMPS
// ============================================================================

/**
 * Schema para timestamps (created_at, updated_at)
 * Acepta tanto strings ISO como Date objects
 */
export const timestampSchema = z
  .union([z.string().datetime(), z.date()])
  .optional();

// ============================================================================
// SCHEMAS DE ENUMS COMUNES
// ============================================================================

/**
 * Roles de usuario comunes
 * Usa enum centralizado para consistencia
 */
export const userRoleSchema = z
  .enum(USER_ROLE_VALUES as [string, ...string[]], {
    message: "Rol debe ser: admin, manager, user, guest o mechanic",
  })
  .optional();

/**
 * Estados comunes (activo/inactivo)
 */
export const statusSchema = z
  .enum(["active", "inactive", "pending", "suspended"], {
    message: "Status debe ser: active, inactive, pending o suspended",
  })
  .optional();

/**
 * Idiomas soportados
 * Usa enum centralizado para consistencia
 */
export const languageSchema = z
  .enum(LANGUAGE_VALUES as [string, ...string[]], {
    message: "Idioma debe ser: es, en, fr, de o pt",
  })
  .optional();

// ============================================================================
// SCHEMAS DE VALIDACIÓN DE DATOS
// ============================================================================

/**
 * Schema para nombres (mín 2 caracteres, máx 100)
 */
export const nameSchema = z
  .string()
  .min(2, "Debe tener al menos 2 caracteres")
  .max(100, "Debe tener máximo 100 caracteres")
  .trim()
  .optional();

/**
 * Schema para descripciones (máx 1000 caracteres)
 */
export const descriptionSchema = z
  .string()
  .max(1000, "Debe tener máximo 1000 caracteres")
  .trim()
  .optional();

/**
 * Schema para campos de texto largo (máx 5000 caracteres)
 */
export const longTextSchema = z
  .string()
  .max(5000, "Debe tener máximo 5000 caracteres")
  .trim()
  .optional();

/**
 * Schema para precios (números positivos con 2 decimales)
 */
export const priceSchema = z
  .number()
  .nonnegative("El precio debe ser positivo")
  .multipleOf(0.01, "El precio debe tener máximo 2 decimales");

/**
 * Schema para cantidades (enteros positivos)
 */
export const quantitySchema = z
  .number()
  .int("La cantidad debe ser un número entero")
  .nonnegative("La cantidad debe ser positiva");

// ============================================================================
// SCHEMAS DE COORDENADAS GEOGRÁFICAS
// ============================================================================

/**
 * Schema para latitud
 */
export const latitudeSchema = z
  .number()
  .min(-90, "La latitud debe estar entre -90 y 90")
  .max(90, "La latitud debe estar entre -90 y 90")
  .optional();

/**
 * Schema para longitud
 */
export const longitudeSchema = z
  .number()
  .min(-180, "La longitud debe estar entre -180 y 180")
  .max(180, "La longitud debe estar entre -180 y 180")
  .optional();

/**
 * Schema para coordenadas completas
 */
export const coordinatesSchema = z
  .object({
    latitude: latitudeSchema,
    longitude: longitudeSchema,
  })
  .optional();

// ============================================================================
// HELPERS DE VALIDACIÓN
// ============================================================================

/**
 * Helper para validar que un campo existe en query params
 */
export const requiredQueryParam = (fieldName: string) =>
  z.string().min(1, `El parámetro '${fieldName}' es requerido`);

/**
 * Helper para validar arrays de UUIDs
 */
export const uuidArraySchema = z.array(uuidSchema).optional();

/**
 * Helper para validar objetos JSON
 */
export const jsonSchema = z.record(z.string(), z.unknown()).optional();

// ============================================================================
// TIPOS INFERIDOS
// ============================================================================

export type Pagination = z.infer<typeof paginationSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type Status = z.infer<typeof statusSchema>;
export type Language = z.infer<typeof languageSchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;
