/**
 * Utilidades para validación de ownership en recursos anidados
 * 
 * En arquitecturas REST, es común tener recursos anidados donde un recurso
 * debe pertenecer a un padre específico. Por ejemplo:
 * - /vending-machines/[id]/slots/[slotId] → slot debe pertenecer a VM
 * - /caminos/[id]/ubicaciones/[ubicacionId] → ubicación debe pertenecer a camino
 * 
 * Este archivo centraliza la lógica de validación de pertenencia para evitar
 * duplicación en endpoints.
 * 
 * Patrón de uso:
 * ```typescript
 * import { validateOwnership } from '@/shared/validate-ownership';
 * 
 * const slot = await service.findById(slotId);
 * const ownershipError = validateOwnership(
 *   slot,
 *   'Slot',
 *   slot?.machine_id,
 *   machineId,
 *   'vending machine'
 * );
 * if (ownershipError) {
 *   return res.status(ownershipError.status).json({ error: ownershipError.message });
 * }
 * ```
 */

import { ErrorMessages } from "@/shared/constants/error-messages";

/**
 * Resultado de validación de ownership
 */
export interface OwnershipValidationError {
  /**
   * HTTP status code a retornar (404 para not found/ownership fail)
   */
  status: number;

  /**
   * Mensaje de error
   */
  message: string;
}

/**
 * Valida que un recurso existe y pertenece a la entidad padre especificada
 * 
 * @param resource - El recurso a validar (puede ser null/undefined si no existe)
 * @param resourceName - Nombre del recurso para mensajes de error (ej: 'Slot', 'Ubicación')
 * @param actualOwnerId - ID del owner actual del recurso (ej: slot.machine_id)
 * @param expectedOwnerId - ID del owner esperado (ej: machineId del path)
 * @param ownerName - Nombre del owner para mensajes de error (ej: 'vending machine', 'camino')
 * @returns OwnershipValidationError si falla, null si validación pasa
 * 
 * @example
 * // Validar que slot pertenece a vending machine
 * const slot = await service.findById(slotId);
 * const error = validateOwnership(
 *   slot,
 *   'Slot',
 *   slot?.machine_id,
 *   machineId,
 *   'vending machine'
 * );
 * if (error) {
 *   return res.status(error.status).json({ error: error.message });
 * }
 * 
 * @example
 * // Validar que ubicación pertenece a camino
 * const ubicacion = await service.findById(ubicacionId);
 * const error = validateOwnership(
 *   ubicacion,
 *   'Ubicación',
 *   ubicacion?.camino_id,
 *   caminoId,
 *   'camino'
 * );
 */
export function validateOwnership<T>(
  resource: T | null | undefined,
  resourceName: string,
  actualOwnerId: string | undefined | null,
  expectedOwnerId: string,
  ownerName: string
): OwnershipValidationError | null {
  // 1. Verificar que el recurso existe
  if (!resource) {
    return {
      status: 404,
      message: ErrorMessages.NOT_FOUND(resourceName),
    };
  }

  // 2. Verificar que pertenece al owner esperado
  if (actualOwnerId !== expectedOwnerId) {
    return {
      status: 404,
      message: `${resourceName} no encontrado en este ${ownerName}`,
    };
  }

  // Validación pasó
  return null;
}

/**
 * Configuración para validación batch de ownership
 */
interface BatchOwnershipValidation {
  /**
   * Recurso a validar
   */
  resource: unknown;

  /**
   * Nombre del recurso para mensajes
   */
  resourceName: string;

  /**
   * ID del owner actual
   */
  actualOwnerId: string | undefined | null;

  /**
   * ID del owner esperado
   */
  expectedOwnerId: string;

  /**
   * Nombre del owner para mensajes
   */
  ownerName: string;
}

/**
 * Valida ownership para múltiples recursos de una sola vez
 * 
 * Útil cuando un endpoint necesita validar pertenencia de varios recursos
 * anidados simultáneamente.
 * 
 * @param validations - Array de validaciones a ejecutar
 * @returns Primer error encontrado, null si todas las validaciones pasan
 * 
 * @example
 * const error = validateBatchOwnership([
 *   {
 *     resource: slot,
 *     resourceName: 'Slot',
 *     actualOwnerId: slot?.machine_id,
 *     expectedOwnerId: machineId,
 *     ownerName: 'vending machine'
 *   },
 *   {
 *     resource: producto,
 *     resourceName: 'Producto',
 *     actualOwnerId: producto?.categoria_id,
 *     expectedOwnerId: categoriaId,
 *     ownerName: 'categoría'
 *   }
 * ]);
 * if (error) {
 *   return res.status(error.status).json({ error: error.message });
 * }
 */
export function validateBatchOwnership(
  validations: BatchOwnershipValidation[]
): OwnershipValidationError | null {
  for (const validation of validations) {
    const error = validateOwnership(
      validation.resource,
      validation.resourceName,
      validation.actualOwnerId,
      validation.expectedOwnerId,
      validation.ownerName
    );

    if (error) {
      return error;
    }
  }

  return null;
}

/**
 * Helper específico para validación de slots de vending machines
 * 
 * Patrón tan común que merece helper dedicado.
 * 
 * @param slot - Slot a validar
 * @param machineId - ID de la vending machine esperada
 * @returns Error si validación falla, null si pasa
 * 
 * @example
 * const slot = await service.findById(slotId);
 * const error = validateSlotOwnership(slot, machineId);
 * if (error) {
 *   return res.status(error.status).json({ error: error.message });
 * }
 */
export function validateSlotOwnership(
  slot: { machine_id?: string } | null | undefined,
  machineId: string
): OwnershipValidationError | null {
  return validateOwnership(
    slot,
    "Slot",
    slot?.machine_id,
    machineId,
    "vending machine"
  );
}

/**
 * Helper específico para validación de ubicaciones en caminos
 * 
 * @param ubicacion - Ubicación a validar
 * @param caminoId - ID del camino esperado
 * @returns Error si validación falla, null si pasa
 * 
 * @example
 * const ubicacion = await service.findById(ubicacionId);
 * const error = validateUbicacionOwnership(ubicacion, caminoId);
 * if (error) {
 *   return res.status(error.status).json({ error: error.message });
 * }
 */
export function validateUbicacionOwnership(
  ubicacion: { camino_id?: string | null } | null | undefined,
  caminoId: string
): OwnershipValidationError | null {
  // Nota: camino_id puede ser null (ubicaciones sin camino asignado)
  // Solo validamos si la ubicación especifica un camino
  if (!ubicacion) {
    return {
      status: 404,
      message: ErrorMessages.NOT_FOUND("Ubicación"),
    };
  }

  // Si ubicación no tiene camino asignado, no hay ownership que validar
  if (!ubicacion.camino_id) {
    return null;
  }

  // Si tiene camino asignado, debe coincidir
  if (ubicacion.camino_id !== caminoId) {
    return {
      status: 404,
      message: "Ubicación no encontrada en este camino",
    };
  }

  return null;
}

/**
 * Type guard para verificar si un objeto tiene propiedad de ownership
 * 
 * @param obj - Objeto a verificar
 * @param ownerKey - Nombre de la propiedad de ownership (ej: 'machine_id', 'camino_id')
 * @returns true si el objeto tiene la propiedad
 * 
 * @example
 * if (hasOwnershipProperty(slot, 'machine_id')) {
 *   // TypeScript sabe que slot.machine_id existe
 *   logger.info(slot.machine_id);
 * }
 */
export function hasOwnershipProperty<T extends Record<string, unknown>>(
  obj: T,
  ownerKey: string
): obj is T & Record<typeof ownerKey, string> {
  return typeof obj[ownerKey] === "string";
}
