/**
 * Constantes de mensajes de error centralizados
 * 
 * Este archivo centraliza todos los mensajes de error usados en los endpoints API
 * para mantener consistencia, facilitar i18n futuro y reducir duplicación.
 * 
 * Patrón de uso:
 * ```typescript
 * import { ErrorMessages } from '@/constants/error-messages';
 * 
 * return res.status(400).json({ error: ErrorMessages.REQUIRED_ID('producto') });
 * ```
 */

export const ErrorMessages = {
  // ========================================
  // Errores de Métodos HTTP
  // ========================================
  
  /**
   * Método HTTP no permitido para este endpoint
   */
  METHOD_NOT_ALLOWED: "Método no permitido",

  // ========================================
  // Errores de Validación - IDs Requeridos
  // ========================================
  
  /**
   * Genera mensaje de ID requerido para una entidad
   * @param entity - Nombre de la entidad (ej: 'producto', 'camino', 'venta')
   * @returns Mensaje formateado "ID de {entity} es requerido"
   */
  REQUIRED_ID: (entity: string) => `ID de ${entity} es requerido`,

  /**
   * ID de producto es requerido
   */
  REQUIRED_PRODUCTO_ID: "ID de producto es requerido",

  /**
   * ID de camino es requerido
   */
  REQUIRED_CAMINO_ID: "ID de camino es requerido",

  /**
   * ID de ubicación es requerido
   */
  REQUIRED_UBICACION_ID: "ID de ubicación es requerido",

  /**
   * ID de venta es requerido
   */
  REQUIRED_VENTA_ID: "ID de venta es requerido",

  /**
   * ID de usuario es requerido
   */
  REQUIRED_USUARIO_ID: "ID de usuario es requerido",

  /**
   * ID de vending machine es requerido
   */
  REQUIRED_VENDING_MACHINE_ID: "ID de vending machine es requerido",

  /**
   * ID de slot es requerido
   */
  REQUIRED_SLOT_ID: "ID de slot es requerido",

  /**
   * ID de precio es requerido
   */
  REQUIRED_PRECIO_ID: "ID de precio es requerido",

  /**
   * ID de punto de servicio requerido
   */
  REQUIRED_SERVICE_POINT_ID: "ID de punto de servicio requerido",

  // ========================================
  // Errores de Validación - Parámetros
  // ========================================

  /**
   * SKU es requerido
   */
  REQUIRED_SKU: "SKU es requerido",

  /**
   * SKU no puede estar vacío
   */
  EMPTY_SKU: "SKU no puede estar vacío",

  /**
   * Código de retiro es requerido
   */
  REQUIRED_CODIGO_RETIRO: "Código de retiro es requerido",

  /**
   * producto_id es requerido
   */
  REQUIRED_PRODUCTO_ID_PARAM: "producto_id es requerido",

  /**
   * Cantidad es requerida
   */
  REQUIRED_CANTIDAD: "Cantidad es requerida",

  /**
   * La cantidad debe ser mayor a 0
   */
  CANTIDAD_MAYOR_CERO: "La cantidad debe ser mayor a 0",

  /**
   * La cantidad debe ser un número entero
   */
  CANTIDAD_ENTERO: "La cantidad debe ser un número entero",

  /**
   * general_margin_percentage es requerido
   */
  REQUIRED_GENERAL_MARGIN: "general_margin_percentage es requerido",

  /**
   * product_specific_margins es requerido y debe ser un objeto
   */
  REQUIRED_PRODUCT_MARGINS: "product_specific_margins es requerido y debe ser un objeto",

  // ========================================
  // Errores de Validación - UUID
  // ========================================

  /**
   * ID debe ser un string
   */
  ID_MUST_BE_STRING: "ID debe ser un string",

  /**
   * ID debe ser un UUID válido
   */
  INVALID_UUID: "ID debe ser un UUID válido",

  /**
   * Genera mensaje de UUID inválido para un parámetro específico
   * @param param - Nombre del parámetro (ej: 'id', 'producto_id')
   * @returns Mensaje formateado "{param} debe ser un UUID válido"
   */
  INVALID_UUID_PARAM: (param: string) => `${param} debe ser un UUID válido`,

  // ========================================
  // Errores de Recursos No Encontrados
  // ========================================

  /**
   * Genera mensaje de recurso no encontrado
   * @param entity - Nombre de la entidad (ej: 'Producto', 'Camino', 'Venta')
   * @returns Mensaje formateado "{entity} no encontrado"
   */
  NOT_FOUND: (entity: string) => `${entity} no encontrado`,

  /**
   * Producto no encontrado
   */
  PRODUCTO_NOT_FOUND: "Producto no encontrado",

  /**
   * Camino no encontrado
   */
  CAMINO_NOT_FOUND: "Camino no encontrado",

  /**
   * Venta no encontrada
   */
  VENTA_NOT_FOUND: "Venta no encontrada",

  /**
   * Usuario no encontrado
   */
  USUARIO_NOT_FOUND: "Usuario no encontrado",

  /**
   * Slot no encontrado
   */
  SLOT_NOT_FOUND: "Slot no encontrado",

  /**
   * Slot no encontrado en esta vending machine
   */
  SLOT_NOT_FOUND_IN_VM: "Slot no encontrado en esta vending machine",

  /**
   * Endpoint no encontrado
   */
  ENDPOINT_NOT_FOUND: "Endpoint no encontrado",

  /**
   * Substring usado para detectar errores de "no encontrado"
   * Útil para checks tipo: error.message.includes(ErrorMessages.NOT_FOUND_SUBSTRING)
   */
  NOT_FOUND_SUBSTRING: "no encontrad",

  // ========================================
  // Errores de Negocio - Vending Machines
  // ========================================

  /**
   * Genera mensaje de capacidad excedida
   * @param capacidad - Capacidad máxima del slot
   * @returns Mensaje formateado "La cantidad excede la capacidad máxima del slot ({capacidad})"
   */
  CAPACITY_EXCEEDED: (capacidad: number) =>
    `La cantidad excede la capacidad máxima del slot (${capacidad})`,

  // ========================================
  // Errores de Negocio - Ventas
  // ========================================

  /**
   * Código de retiro incorrecto
   */
  CODIGO_RETIRO_INCORRECTO: "código de retiro incorrecto",

  /**
   * Venta ya retirada
   */
  VENTA_YA_RETIRADA: "La venta ya ha sido retirada",

  /**
   * Stock insuficiente
   */
  STOCK_INSUFICIENTE: "Stock insuficiente para procesar la venta",

  // ========================================
  // Errores de Negocio - Precios
  // ========================================

  /**
   * No se encontró precio para los parámetros especificados
   */
  PRECIO_NOT_FOUND: "No se encontró precio para los parámetros especificados",

  /**
   * Nivel de jerarquía inválido
   */
  INVALID_NIVEL: "Nivel de jerarquía inválido",

  /**
   * Tipo de entidad inválido
   */
  INVALID_ENTIDAD_TIPO: "Tipo de entidad inválido",

  // ========================================
  // Errores Genéricos
  // ========================================

  /**
   * Error interno del servidor
   */
  INTERNAL_ERROR: "Error interno del servidor",

  /**
   * Error en la base de datos
   */
  DATABASE_ERROR: "Error en la base de datos",

  /**
   * Error de validación
   */
  VALIDATION_ERROR: "Error de validación",

  /**
   * Parámetros inválidos
   */
  INVALID_PARAMS: "Parámetros inválidos",
} as const;

/**
 * Tipo auxiliar para extraer valores de ErrorMessages
 */
export type ErrorMessageValue = typeof ErrorMessages[keyof typeof ErrorMessages];
