/**
 * Custom Error Classes para manejo de errores centralizado
 *
 * Permite:
 * - Status codes HTTP correctos automáticamente
 * - Mensajes de error consistentes en español
 * - Información estructurada para debugging
 * - Logging mejorado
 */

/**
 * Error base de la aplicación
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      details: this.details,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Error 404 - Recurso no encontrado
 *
 * @example
 * throw new NotFoundError("Usuario", "123e4567-e89b-12d3-a456-426614174000");
 * // "Usuario con ID 123e4567-e89b-12d3-a456-426614174000 no encontrado"
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      id
        ? `${resource} con ID ${id} no encontrado`
        : `${resource} no encontrado`,
      404,
      "NOT_FOUND"
    );
  }
}

/**
 * Error 400 - Validación fallida
 *
 * @example
 * throw new ValidationError("Email inválido", { email: "not-an-email" });
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

/**
 * Error 409 - Conflicto (recurso ya existe, estado inválido, etc.)
 *
 * @example
 * throw new ConflictError("El email ya está registrado");
 * throw new ConflictError("El favorito ya existe");
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 409, "CONFLICT", details);
  }
}

/**
 * Error 401 - No autenticado
 *
 * @example
 * throw new UnauthorizedError("Token inválido o expirado");
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "No autorizado") {
    super(message, 401, "UNAUTHORIZED");
  }
}

/**
 * Error 403 - No tiene permisos
 *
 * @example
 * throw new ForbiddenError("No tienes permiso para acceder a este recurso");
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Acceso prohibido") {
    super(message, 403, "FORBIDDEN");
  }
}

/**
 * Error 500 - Error de base de datos
 *
 * @example
 * throw new DatabaseError("Error al insertar usuario", { originalError: error });
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 500, "DATABASE_ERROR", details);
  }
}

/**
 * Error 400 - Regla de negocio violada
 *
 * @example
 * throw new BusinessRuleError("No se puede reservar más de 6 meses con anticipación");
 */
export class BusinessRuleError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, "BUSINESS_RULE_VIOLATION", details);
  }
}

/**
 * Error 503 - Servicio externo no disponible
 *
 * @example
 * throw new ExternalServiceError("El servicio de pagos no está disponible");
 */
export class ExternalServiceError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 503, "EXTERNAL_SERVICE_ERROR", details);
  }
}
