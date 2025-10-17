/**
 * Middleware para validación automática de UUIDs en parámetros de API
 * 
 * Este middleware reduce el boilerplate de validación UUID que se repite
 * en ~40+ endpoints diferentes.
 * 
 * Patrón de uso:
 * ```typescript
 * import { validateUUID, validateUUIDs } from '@/api/middlewares/validate-uuid';
 * 
 * // Validar un solo parámetro
 * const error = validateUUID(id, 'id');
 * if (error) return res.status(400).json({ error });
 * 
 * // Validar múltiples parámetros
 * const error = validateUUIDs({ id, producto_id });
 * if (error) return res.status(400).json({ error });
 * ```
 */

import { ErrorMessages } from "@/shared/constants/error-messages";

/**
 * Regex para validar formato UUID v4
 * Patrón: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 */
export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Valida si un string tiene formato UUID válido
 * 
 * @param value - Valor a validar
 * @returns true si es UUID válido, false en caso contrario
 * 
 * @example
 * isValidUUID('123e4567-e89b-12d3-a456-426614174000') // true
 * isValidUUID('invalid-uuid') // false
 * isValidUUID(null) // false
 */
export function isValidUUID(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

/**
 * Valida un parámetro UUID individual
 * 
 * @param value - Valor del parámetro a validar
 * @param paramName - Nombre del parámetro para mensaje de error descriptivo
 * @returns Mensaje de error si validación falla, null si es válido
 * 
 * @example
 * const error = validateUUID(id, 'id');
 * if (error) return res.status(400).json({ error });
 */
export function validateUUID(
  value: unknown,
  paramName: string = "id"
): string | null {
  // Validar que el valor existe
  if (!value) {
    return ErrorMessages.REQUIRED_ID(paramName);
  }

  // Validar que es string
  if (typeof value !== "string") {
    return ErrorMessages.ID_MUST_BE_STRING;
  }

  // Validar formato UUID
  if (!UUID_REGEX.test(value)) {
    return ErrorMessages.INVALID_UUID_PARAM(paramName);
  }

  return null;
}

/**
 * Opciones de configuración para validateUUIDs
 */
interface ValidateUUIDsOptions {
  /**
   * Si true, permite que parámetros sean undefined (opcionales)
   * @default false
   */
  allowUndefined?: boolean;

  /**
   * Nombres personalizados para mensajes de error
   * @example { id: 'producto', machine_id: 'vending machine' }
   */
  customNames?: Record<string, string>;
}

/**
 * Valida múltiples parámetros UUID de una sola vez
 * 
 * @param params - Objeto con parámetros a validar { id, producto_id, etc }
 * @param options - Opciones de validación
 * @returns Mensaje de error del primer parámetro inválido, null si todos válidos
 * 
 * @example
 * // Validar múltiples parámetros obligatorios
 * const error = validateUUIDs({ id, slotId });
 * if (error) return res.status(400).json({ error });
 * 
 * @example
 * // Permitir parámetros opcionales
 * const error = validateUUIDs(
 *   { id, camino_id },
 *   { allowUndefined: true }
 * );
 * 
 * @example
 * // Nombres personalizados
 * const error = validateUUIDs(
 *   { id, machine_id },
 *   { customNames: { id: 'slot', machine_id: 'vending machine' } }
 * );
 */
export function validateUUIDs(
  params: Record<string, unknown>,
  options: ValidateUUIDsOptions = {}
): string | null {
  const { allowUndefined = false, customNames = {} } = options;

  for (const [key, value] of Object.entries(params)) {
    // Si undefined está permitido y el valor es undefined, skip
    if (allowUndefined && value === undefined) {
      continue;
    }

    // Usar nombre personalizado si existe, sino usar key
    const displayName = customNames[key] || key;

    // Validar el parámetro
    const error = validateUUID(value, displayName);
    if (error) {
      return error;
    }
  }

  return null;
}

/**
 * Helper para extraer y validar UUIDs de query params de Next.js
 * 
 * Next.js puede retornar string | string[] para query params.
 * Este helper extrae el primer valor si es array y valida.
 * 
 * @param queryParam - Valor de query parameter (string | string[] | undefined)
 * @param paramName - Nombre del parámetro para mensajes de error
 * @returns Objeto { value: string, error: null } si válido, { value: null, error: string } si inválido
 * 
 * @example
 * const { value: id, error } = extractAndValidateUUID(req.query.id, 'id');
 * if (error) return res.status(400).json({ error });
 * // Aquí id es garantizado string UUID válido
 */
export function extractAndValidateUUID(
  queryParam: string | string[] | undefined,
  paramName: string = "id"
): { value: string | null; error: string | null } {
  // Extraer string si es array
  const value = Array.isArray(queryParam) ? queryParam[0] : queryParam;

  // Validar
  const error = validateUUID(value, paramName);

  if (error) {
    return { value: null, error };
  }

  return { value: value as string, error: null };
}

/**
 * Type guard para arrays de UUIDs
 * 
 * @param values - Array de valores a validar
 * @returns true si todos los valores son UUIDs válidos
 * 
 * @example
 * if (!areValidUUIDs(productIds)) {
 *   return res.status(400).json({ error: 'Todos los IDs deben ser UUIDs válidos' });
 * }
 */
export function areValidUUIDs(values: unknown[]): values is string[] {
  return values.every((v) => isValidUUID(v));
}
