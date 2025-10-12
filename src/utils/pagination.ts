/**
 * Utilidades para paginación consistente en endpoints API
 * 
 * Este archivo centraliza la lógica de paginación para evitar duplicación
 * y mantener formato consistente en todas las respuestas paginadas.
 * 
 * Patrón de uso:
 * ```typescript
 * import { createPaginatedResponse, parsePaginationParams } from '@/utils/pagination';
 * 
 * const { page, limit } = parsePaginationParams(req.query);
 * const { data, total } = await service.findAll({ page, limit });
 * 
 * return res.status(200).json(
 *   createPaginatedResponse(data, total, page, limit)
 * );
 * ```
 */

/**
 * Metadata de paginación estándar
 */
export interface PaginationMeta {
  /**
   * Página actual (1-indexed)
   */
  page: number;

  /**
   * Número de items por página
   */
  limit: number;

  /**
   * Total de items en toda la colección
   */
  total: number;

  /**
   * Total de páginas disponibles
   */
  totalPages: number;
}

/**
 * Respuesta paginada estándar
 */
export interface PaginatedResponse<T> {
  /**
   * Array de items de la página actual
   */
  data: T[];

  /**
   * Metadata de paginación
   */
  pagination: PaginationMeta;
}

/**
 * Parámetros de paginación con valores por defecto
 */
export interface PaginationParams {
  /**
   * Página solicitada (por defecto 1)
   */
  page: number;

  /**
   * Items por página (por defecto 10)
   */
  limit: number;
}

/**
 * Configuración para parsear parámetros de paginación
 */
export interface ParsePaginationOptions {
  /**
   * Página por defecto si no se especifica
   * @default 1
   */
  defaultPage?: number;

  /**
   * Límite por defecto si no se especifica
   * @default 10
   */
  defaultLimit?: number;

  /**
   * Límite máximo permitido
   * @default 100
   */
  maxLimit?: number;
}

/**
 * Parsea y valida parámetros de paginación de query params
 * 
 * @param query - Query params de Next.js (puede ser string | string[] | undefined)
 * @param options - Opciones de configuración
 * @returns Objeto con page y limit validados
 * 
 * @example
 * const { page, limit } = parsePaginationParams(req.query);
 * // page = 1, limit = 10 (valores por defecto)
 * 
 * @example
 * const { page, limit } = parsePaginationParams(
 *   { page: "2", limit: "25" }
 * );
 * // page = 2, limit = 25
 * 
 * @example
 * const { page, limit } = parsePaginationParams(
 *   { page: "invalid", limit: "999" },
 *   { maxLimit: 50 }
 * );
 * // page = 1 (invalid → default), limit = 50 (999 > maxLimit)
 */
export function parsePaginationParams(
  query: {
    page?: string | string[];
    limit?: string | string[];
  },
  options: ParsePaginationOptions = {}
): PaginationParams {
  const {
    defaultPage = 1,
    defaultLimit = 10,
    maxLimit = 100,
  } = options;

  // Extraer valores (manejar arrays de Next.js)
  const pageParam = Array.isArray(query.page) ? query.page[0] : query.page;
  const limitParam = Array.isArray(query.limit) ? query.limit[0] : query.limit;

  // Parsear page
  let page = defaultPage;
  if (pageParam) {
    const parsed = parseInt(pageParam, 10);
    if (!isNaN(parsed) && parsed > 0) {
      page = parsed;
    }
  }

  // Parsear limit
  let limit = defaultLimit;
  if (limitParam) {
    const parsed = parseInt(limitParam, 10);
    if (!isNaN(parsed) && parsed > 0) {
      // Aplicar límite máximo
      limit = Math.min(parsed, maxLimit);
    }
  }

  return { page, limit };
}

/**
 * Calcula el offset para queries SQL basado en page y limit
 * 
 * @param page - Número de página (1-indexed)
 * @param limit - Items por página
 * @returns Offset para usar en SQL OFFSET clause
 * 
 * @example
 * const offset = calculateOffset(1, 10); // 0
 * const offset = calculateOffset(2, 10); // 10
 * const offset = calculateOffset(3, 25); // 50
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Calcula el total de páginas basado en total de items y límite
 * 
 * @param total - Total de items en la colección
 * @param limit - Items por página
 * @returns Total de páginas (mínimo 1)
 * 
 * @example
 * calculateTotalPages(0, 10)   // 1 (mínimo)
 * calculateTotalPages(5, 10)   // 1
 * calculateTotalPages(10, 10)  // 1
 * calculateTotalPages(11, 10)  // 2
 * calculateTotalPages(100, 25) // 4
 */
export function calculateTotalPages(total: number, limit: number): number {
  if (total === 0) return 1;
  return Math.ceil(total / limit);
}

/**
 * Crea una respuesta paginada con formato estándar
 * 
 * @param data - Array de items de la página actual
 * @param total - Total de items en toda la colección
 * @param page - Número de página actual
 * @param limit - Items por página
 * @returns Objeto con data y pagination metadata
 * 
 * @example
 * const response = createPaginatedResponse(
 *   [item1, item2, item3],
 *   100,
 *   2,
 *   10
 * );
 * // {
 * //   data: [item1, item2, item3],
 * //   pagination: { page: 2, limit: 10, total: 100, totalPages: 10 }
 * // }
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: calculateTotalPages(total, limit),
    },
  };
}

/**
 * Valida que los parámetros de paginación sean válidos
 * 
 * @param page - Número de página
 * @param limit - Items por página
 * @returns Mensaje de error si inválido, null si válido
 * 
 * @example
 * const error = validatePaginationParams(0, 10);
 * // "La página debe ser mayor a 0"
 * 
 * const error = validatePaginationParams(1, -5);
 * // "El límite debe ser mayor a 0"
 * 
 * const error = validatePaginationParams(1, 10);
 * // null (válido)
 */
export function validatePaginationParams(
  page: number,
  limit: number
): string | null {
  if (!Number.isInteger(page) || page < 1) {
    return "La página debe ser un número entero mayor a 0";
  }

  if (!Number.isInteger(limit) || limit < 1) {
    return "El límite debe ser un número entero mayor a 0";
  }

  return null;
}

/**
 * Helper para crear metadata de paginación sin data
 * Útil cuando se quiere retornar solo metadata
 * 
 * @param total - Total de items
 * @param page - Página actual
 * @param limit - Items por página
 * @returns Objeto PaginationMeta
 */
export function createPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: calculateTotalPages(total, limit),
  };
}

/**
 * Verifica si hay una página siguiente disponible
 * 
 * @param page - Página actual
 * @param totalPages - Total de páginas
 * @returns true si hay página siguiente
 */
export function hasNextPage(page: number, totalPages: number): boolean {
  return page < totalPages;
}

/**
 * Verifica si hay una página anterior disponible
 * 
 * @param page - Página actual
 * @returns true si hay página anterior
 */
export function hasPreviousPage(page: number): boolean {
  return page > 1;
}
