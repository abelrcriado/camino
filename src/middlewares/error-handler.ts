/**
 * Middleware para manejo centralizado de errores
 *
 * Captura todos los errores de la aplicación y los convierte en
 * respuestas HTTP apropiadas con el status code correcto.
 */

import { NextApiResponse, NextApiRequest } from "next";
import { AppError } from "../errors/custom-errors";
import { ZodError } from "zod";
import logger from "../config/logger";

/**
 * Maneja errores de forma centralizada
 *
 * @param error - Error capturado (puede ser AppError, ZodError, Error genérico)
 * @param res - Response de Next.js
 * @returns Response con formato de error estandarizado
 */
export function handleError(error: unknown, res: NextApiResponse) {
  // 1. Errores personalizados de la aplicación (AppError y subclases)
  if (error instanceof AppError) {
    logger.warn(`${error.name}: ${error.message}`, {
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    });

    const response: Record<string, unknown> = {
      error: error.message,
      code: error.code,
    };

    if (error.details) {
      response.details = error.details;
    }

    return res.status(error.statusCode).json(response);
  }

  // 2. Errores de validación de Zod
  if (error instanceof ZodError) {
    logger.warn("Validation error (Zod)", {
      issues: error.issues,
    });

    return res.status(400).json({
      error: "Errores de validación",
      code: "VALIDATION_ERROR",
      details: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
        code: issue.code,
      })),
    });
  }

  // 3. Errores estándar de JavaScript
  if (error instanceof Error) {
    logger.error("Unhandled Error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    // No exponer detalles internos en producción
    const isProduction = process.env.NODE_ENV === "production";

    return res.status(500).json({
      error: "Error interno del servidor",
      code: "INTERNAL_SERVER_ERROR",
      ...(!isProduction && {
        details: {
          message: error.message,
          name: error.name,
        },
      }),
    });
  }

  // 4. Error desconocido (no es instancia de Error)
  logger.error("Unknown error type:", error);

  return res.status(500).json({
    error: "Error interno del servidor",
    code: "INTERNAL_SERVER_ERROR",
  });
}

/**
 * Wrapper para funciones async en API routes
 * Captura errores automáticamente y los maneja con handleError
 *
 * @example
 * export default asyncHandler(async (req, res) => {
 *   // Tu código aquí
 *   throw new NotFoundError("Usuario", "123");
 * });
 */
export function asyncHandler(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      handleError(error, res);
    }
  };
}
