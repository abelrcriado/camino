/**
 * Utilidades para validación con Zod
 *
 * Proporciona funciones helper para integrar Zod con Next.js API routes
 */

import type { NextApiResponse } from "next";
import { z, ZodError, ZodSchema } from "zod";

/**
 * Estructura de error de validación compatible con el formato actual
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Convierte errores de Zod al formato de ValidationError
 *
 * @param error - ZodError de Zod
 * @returns Array de errores en formato estándar
 */
export function formatZodErrors(error: ZodError): ValidationError[] {
  return error.issues.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
}

/**
 * Valida datos usando un schema de Zod
 *
 * @param schema - Schema de Zod para validar
 * @param data - Datos a validar
 * @returns Objeto con success, data (si válido) o errors (si inválido)
 */
export function validateWithZod<T>(
  schema: ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: ValidationError[] } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, errors: formatZodErrors(error) };
    }
    // Error inesperado
    return {
      success: false,
      errors: [
        { field: "unknown", message: "Error de validación desconocido" },
      ],
    };
  }
}

/**
 * Valida datos y responde automáticamente con errores si fallan
 *
 * @param schema - Schema de Zod para validar
 * @param data - Datos a validar
 * @param res - Response object de Next.js
 * @returns Data validada o null si hay errores (también envía la respuesta)
 */
export function validateAndRespond<T>(
  schema: ZodSchema<T>,
  data: unknown,
  res: NextApiResponse
): T | null {
  const result = validateWithZod(schema, data);

  if (!result.success) {
    res.status(400).json({
      error: "Errores de validación",
      details: result.errors,
    });
    return null;
  }

  return result.data;
}

/**
 * Middleware-style validator que retorna función de validación
 * Útil para composición de validadores
 */
export function createValidator<T>(schema: ZodSchema<T>) {
  return (
    data: unknown
  ):
    | { success: true; data: T }
    | { success: false; errors: ValidationError[] } => {
    return validateWithZod(schema, data);
  };
}

/**
 * Valida parcialmente un objeto (útil para PATCH)
 * Convierte el schema en partial automáticamente
 */
export function validatePartial<T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
  data: unknown
):
  | { success: true; data: Partial<z.infer<T>> }
  | { success: false; errors: ValidationError[] } {
  const partialSchema = schema.partial();
  return validateWithZod(partialSchema, data) as
    | { success: true; data: Partial<z.infer<T>> }
    | { success: false; errors: ValidationError[] };
}
