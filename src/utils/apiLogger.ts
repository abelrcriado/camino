import type { NextApiRequest, NextApiResponse } from "next";
import { logger } from "../config/logger";
import {
  getCorrelationId,
  getRequestDuration,
} from "../middlewares/correlationId";

/**
 * Contexto de logging para requests HTTP
 */
interface LogContext {
  correlationId: string;
  method: string;
  path: string;
  query?: Record<string, unknown>;
  body?: unknown;
  userId?: string;
  ip?: string;
  userAgent?: string;
  [key: string]: unknown;
}

/**
 * Extrae el contexto base de una request
 */
export function getRequestContext(req: NextApiRequest): LogContext {
  return {
    correlationId: getCorrelationId(req),
    method: req.method || "UNKNOWN",
    path: req.url || "unknown",
    query: req.query
      ? Object.keys(req.query).length > 0
        ? req.query
        : undefined
      : undefined,
    ip: (req.headers["x-forwarded-for"] as string) || req.socket?.remoteAddress,
    userAgent: req.headers["user-agent"],
  };
}

/**
 * Loggea el inicio de un request
 */
export function logRequest(
  req: NextApiRequest,
  additionalContext?: Record<string, unknown>
) {
  const context = getRequestContext(req);

  logger.info("Incoming request", {
    ...context,
    ...additionalContext,
  });
}

/**
 * Loggea la respuesta exitosa de un request
 */
export function logResponse(
  req: NextApiRequest,
  res: NextApiResponse,
  additionalContext?: Record<string, unknown>
) {
  const context = getRequestContext(req);
  const duration = getRequestDuration(req);

  logger.info("Request completed", {
    ...context,
    statusCode: res.statusCode,
    responseTime: duration,
    ...additionalContext,
  });
}

/**
 * Loggea un error en un request
 */
export function logError(
  req: NextApiRequest,
  error: Error | unknown,
  additionalContext?: Record<string, unknown>
) {
  const context = getRequestContext(req);
  const duration = getRequestDuration(req);

  const errorDetails =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : { error: String(error) };

  logger.error("Request failed", {
    ...context,
    ...errorDetails,
    responseTime: duration,
    ...additionalContext,
  });
}

/**
 * Loggea una operación de base de datos
 */
export function logDatabaseOperation(
  req: NextApiRequest,
  operation: string,
  table: string,
  success: boolean,
  details?: Record<string, unknown>
) {
  const context = getRequestContext(req);

  logger.debug("Database operation", {
    correlationId: context.correlationId,
    operation,
    table,
    success,
    ...details,
  });
}

/**
 * Loggea una validación
 */
export function logValidation(
  req: NextApiRequest,
  field: string,
  valid: boolean,
  message?: string
) {
  const context = getRequestContext(req);

  logger.debug("Validation", {
    correlationId: context.correlationId,
    field,
    valid,
    message,
  });
}

/**
 * Wrapper para loggear automáticamente requests y respuestas
 * Uso: const handler = withLogging(async (req, res) => { ... })
 */
export function withLogging(
  handler: (
    req: NextApiRequest,
    res: NextApiResponse
  ) => Promise<void | NextApiResponse>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Log request
    logRequest(req);

    try {
      // Ejecutar handler
      await handler(req, res);

      // Log respuesta exitosa
      logResponse(req, res);
    } catch (error) {
      // Log error
      logError(req, error);

      // Re-throw para que el error handler de Next.js lo maneje
      throw error;
    }
  };
}

/**
 * Helper para loggear información de usuario autenticado
 */
export function logUserAction(
  req: NextApiRequest,
  userId: string,
  action: string,
  details?: Record<string, unknown>
) {
  const context = getRequestContext(req);

  logger.info("User action", {
    correlationId: context.correlationId,
    userId,
    action,
    ...details,
  });
}

const apiLogger = {
  logRequest,
  logResponse,
  logError,
  logDatabaseOperation,
  logValidation,
  withLogging,
  logUserAction,
};

export default apiLogger;
