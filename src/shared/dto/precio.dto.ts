/**
 * SPRINT 4.2: SISTEMA DE PRECIOS JERÁRQUICO
 * DTO Layer - Definiciones de tipos para el sistema de precios
 *
 * Jerarquía de precios: Base (global) → Ubicación → Service Point
 * El precio más específico tiene precedencia sobre el más general
 */

/**
 * Enum para niveles de precio en la jerarquía
 */
export enum NivelPrecio {
  BASE = "base", // Precio global (fallback)
  UBICACION = "ubicacion", // Precio para una ciudad/zona
  SERVICE_POINT = "service_point", // Precio para un Service Point específico
}

/**
 * Enum para tipos de entidad que pueden tener precio
 */
export enum EntidadTipo {
  PRODUCTO = "producto",
  SERVICIO = "servicio",
}

/**
 * Interfaz base de Precio
 * Representa un precio en el sistema jerárquico
 */
export interface Precio {
  id: string;

  // Nivel y entidad
  nivel: NivelPrecio;
  entidad_tipo: EntidadTipo;
  entidad_id: string;

  // Precio en céntimos (ej: 250 = 2.50€)
  precio: number;

  // Referencias jerárquicas (opcionales según nivel)
  ubicacion_id?: string | null;
  service_point_id?: string | null;

  // Vigencia temporal
  fecha_inicio: string; // ISO 8601 date
  fecha_fin?: string | null; // ISO 8601 date, NULL = indefinido

  // Metadata
  notas?: string | null;

  // Timestamps
  created_at?: string; // ISO 8601 datetime
  updated_at?: string; // ISO 8601 datetime
}

/**
 * DTO para crear un nuevo precio
 *
 * Reglas de validación:
 * - nivel='base': ubicacion_id y service_point_id deben ser NULL
 * - nivel='ubicacion': ubicacion_id requerido, service_point_id NULL
 * - nivel='service_point': AMBOS ubicacion_id y service_point_id requeridos
 */
export interface CreatePrecioDto {
  nivel: NivelPrecio;
  entidad_tipo: EntidadTipo;
  entidad_id: string;

  precio: number; // En céntimos, debe ser > 0

  // Opcionales según nivel
  ubicacion_id?: string | null;
  service_point_id?: string | null;

  // Vigencia (fecha_inicio opcional, por defecto HOY)
  fecha_inicio?: string; // ISO 8601 date
  fecha_fin?: string | null; // ISO 8601 date

  notas?: string;
}

/**
 * DTO para actualizar un precio existente
 * Todos los campos son opcionales excepto el ID
 */
export interface UpdatePrecioDto {
  id: string;

  // Campos actualizables
  precio?: number;
  fecha_inicio?: string;
  fecha_fin?: string | null;
  notas?: string;

  // NOTA: nivel, entidad_tipo, entidad_id, ubicacion_id, service_point_id
  // NO son actualizables (crear nuevo precio en su lugar)
}

/**
 * Filtros para consultar precios
 * Todos los campos son opcionales
 */
export interface PrecioFilters {
  // Filtrar por nivel
  nivel?: NivelPrecio;

  // Filtrar por entidad
  entidad_tipo?: EntidadTipo;
  entidad_id?: string;

  // Filtrar por ubicación/SP
  ubicacion_id?: string;
  service_point_id?: string;

  // Filtrar por vigencia
  vigente?: boolean; // true = solo precios vigentes hoy
  fecha?: string; // Fecha específica para validar vigencia

  // Paginación
  page?: number;
  limit?: number;

  // Ordenamiento
  order_by?: "precio" | "fecha_inicio" | "created_at";
  order_direction?: "asc" | "desc";
}

/**
 * Resultado de resolución de precio
 * Retornado por la función resolver_precio()
 */
export interface PrecioResuelto {
  precio_id: string;
  precio: number; // En céntimos
  precio_euros: number; // Convertido a euros (precio / 100)
  nivel: NivelPrecio;

  // Contexto de la resolución
  ubicacion_id?: string | null;
  service_point_id?: string | null;

  // Vigencia
  fecha_inicio: string;
  fecha_fin?: string | null;

  // Metadata adicional (de la vista v_precios_vigentes)
  ubicacion_nombre?: string | null;
  service_point_nombre?: string | null;
  dias_restantes?: number | null; // Días hasta que expire (NULL si indefinido)
  activo_hoy: boolean;
}

/**
 * Parámetros para obtener precio aplicable
 * Usado en endpoint GET /api/precios/aplicable
 */
export interface GetPrecioAplicableParams {
  entidad_tipo: EntidadTipo;
  entidad_id: string;

  // Contexto geográfico (opcional)
  ubicacion_id?: string;
  service_point_id?: string;

  // Fecha (opcional, por defecto HOY)
  fecha?: string; // ISO 8601 date
}

/**
 * Precio vigente con datos desnormalizados
 * Retornado por la vista v_precios_vigentes
 */
export interface PrecioVigente extends Precio {
  precio_euros: number; // Precio convertido a euros
  ubicacion_nombre?: string | null;
  service_point_nombre?: string | null;
  dias_restantes?: number | null;
  activo_hoy: boolean;
}

/**
 * Respuesta de listado de precios con paginación
 */
export interface PreciosResponse {
  data: Precio[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Respuesta de listado de precios vigentes
 */
export interface PreciosVigentesResponse {
  data: PrecioVigente[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Estadísticas de precios
 * Útil para dashboard y reporting
 */
export interface PrecioStats {
  total_precios: number;
  precios_vigentes: number;
  precios_expirados: number;

  // Por nivel
  precios_base: number;
  precios_ubicacion: number;
  precios_service_point: number;

  // Por entidad
  precios_productos: number;
  precios_servicios: number;

  // Rangos de precio
  precio_min: number;
  precio_max: number;
  precio_promedio: number;
}
