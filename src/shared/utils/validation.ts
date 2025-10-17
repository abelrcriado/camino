// Utilidades para validación de datos
import type { NextApiResponse } from "next";

// Tipos de validación
export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: "string" | "number" | "boolean" | "uuid" | "date" | "email";
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  enum?: string[];
}

export interface ValidationError {
  field: string;
  message: string;
}

// Validar UUID
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Validar fecha ISO
export function isValidISODate(date: string): boolean {
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  if (!isoDateRegex.test(date)) return false;
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
}

// Validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validar datos según reglas
export function validate(
  data: Record<string, unknown>,
  rules: ValidationRule[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const rule of rules) {
    const value = data[rule.field];

    // Verificar campo requerido
    if (
      rule.required &&
      (value === undefined || value === null || value === "")
    ) {
      errors.push({
        field: rule.field,
        message: `El campo '${rule.field}' es requerido`,
      });
      continue;
    }

    // Si no es requerido y está vacío, saltar otras validaciones
    if (
      !rule.required &&
      (value === undefined || value === null || value === "")
    ) {
      continue;
    }

    // Validar tipo
    if (rule.type) {
      switch (rule.type) {
        case "string":
          if (typeof value !== "string") {
            errors.push({
              field: rule.field,
              message: `El campo '${rule.field}' debe ser una cadena de texto`,
            });
          }
          break;
        case "number":
          if (typeof value !== "number") {
            errors.push({
              field: rule.field,
              message: `El campo '${rule.field}' debe ser un número`,
            });
          }
          break;
        case "boolean":
          if (typeof value !== "boolean") {
            errors.push({
              field: rule.field,
              message: `El campo '${rule.field}' debe ser booleano`,
            });
          }
          break;
        case "uuid":
          if (typeof value !== "string" || !isValidUUID(value)) {
            errors.push({
              field: rule.field,
              message: `El campo '${rule.field}' debe ser un UUID válido`,
            });
          }
          break;
        case "date":
          if (typeof value !== "string" || !isValidISODate(value)) {
            errors.push({
              field: rule.field,
              message: `El campo '${rule.field}' debe ser una fecha ISO válida`,
            });
          }
          break;
        case "email":
          if (typeof value !== "string" || !isValidEmail(value)) {
            errors.push({
              field: rule.field,
              message: `El campo '${rule.field}' debe ser un email válido`,
            });
          }
          break;
      }
    }

    // Validar longitud mínima
    if (
      rule.minLength &&
      typeof value === "string" &&
      value.length < rule.minLength
    ) {
      errors.push({
        field: rule.field,
        message: `El campo '${rule.field}' debe tener al menos ${rule.minLength} caracteres`,
      });
    }

    // Validar longitud máxima
    if (
      rule.maxLength &&
      typeof value === "string" &&
      value.length > rule.maxLength
    ) {
      errors.push({
        field: rule.field,
        message: `El campo '${rule.field}' no puede tener más de ${rule.maxLength} caracteres`,
      });
    }

    // Validar patrón regex
    if (
      rule.pattern &&
      typeof value === "string" &&
      !rule.pattern.test(value)
    ) {
      errors.push({
        field: rule.field,
        message: `El campo '${rule.field}' tiene un formato inválido`,
      });
    }

    // Validar enum
    if (rule.enum && !rule.enum.includes(value as string)) {
      errors.push({
        field: rule.field,
        message: `El campo '${rule.field}' debe ser uno de: ${rule.enum.join(
          ", "
        )}`,
      });
    }
  }

  return errors;
}

// Responder con errores de validación
export function respondWithValidationErrors(
  res: NextApiResponse,
  errors: ValidationError[]
) {
  return res.status(400).json({
    error: "Errores de validación",
    details: errors,
  });
}

// Manejo de errores de Supabase
export function handleSupabaseError(
  res: NextApiResponse,
  error: { message: string; code?: string; details?: string }
) {
  logger.error("Supabase error:", error);

  // Mapear códigos de error comunes
  const statusCode = getStatusCodeFromError(error);

  return res.status(statusCode).json({
    error: error.message,
    code: error.code,
    details: error.details,
  });
}

function getStatusCodeFromError(error: { code?: string }): number {
  if (!error.code) return 500;

  // Códigos comunes de PostgreSQL
  const errorCodeMap: Record<string, number> = {
    "23505": 409, // unique_violation
    "23503": 400, // foreign_key_violation
    "23502": 400, // not_null_violation
    "23514": 400, // check_violation
    "42P01": 500, // undefined_table
    "42703": 500, // undefined_column
    PGRST116: 404, // not found
  };

  return errorCodeMap[error.code] || 500;
}
