import type { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";

/**
 * Middleware para gestionar Correlation ID
 *
 * El Correlation ID es un UUID único que identifica cada request.
 * Permite trazar un request desde el frontend hasta el backend y la base de datos.
 *
 * Funcionamiento:
 * 1. Si el frontend envía X-Correlation-ID en headers, lo usa
 * 2. Si no, genera un nuevo UUID
 * 3. Lo añade al objeto req para que esté disponible en handlers
 * 4. Lo devuelve en la respuesta para que el frontend lo tenga
 */

// Extender el tipo de NextApiRequest para incluir correlationId
declare module "next" {
  interface NextApiRequest {
    correlationId?: string;
    startTime?: number;
  }
}

export function withCorrelationId(
  handler: (
    req: NextApiRequest,
    res: NextApiResponse
  ) => Promise<void | NextApiResponse>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // 1. Obtener o generar Correlation ID
    const correlationId =
      (req.headers["x-correlation-id"] as string) ||
      (req.headers["x-request-id"] as string) ||
      uuidv4();

    // 2. Añadir a la request para que esté disponible en el handler
    req.correlationId = correlationId;

    // 3. Guardar tiempo de inicio para medir duración
    req.startTime = Date.now();

    // 4. Añadir a la respuesta para que el frontend lo reciba
    res.setHeader("X-Correlation-ID", correlationId);

    // 5. Ejecutar el handler original
    return handler(req, res);
  };
}

/**
 * Helper para obtener el Correlation ID de una request
 */
export function getCorrelationId(req: NextApiRequest): string {
  return req.correlationId || "unknown";
}

/**
 * Helper para obtener el tiempo transcurrido desde el inicio de la request
 */
export function getRequestDuration(req: NextApiRequest): number {
  if (!req.startTime) return 0;
  return Date.now() - req.startTime;
}
