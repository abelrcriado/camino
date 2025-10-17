/**
 * Middleware de autenticación
 * 
 * Verifica el token JWT de Supabase y añade userId al request
 * para que los endpoints protegidos puedan acceder al usuario actual
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/api/services/supabase";
import logger from "@/config/logger";

/**
 * Extended NextApiRequest con userId
 */
export interface AuthenticatedRequest extends NextApiRequest {
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

/**
 * Middleware para verificar autenticación
 * 
 * Extrae el token JWT del header Authorization y verifica su validez.
 * Si es válido, añade userId, userEmail y userRole al request.
 * 
 * @example
 * // En un endpoint protegido
 * import { requireAuth } from '@/api/middlewares/auth.middleware';
 * 
 * export default requireAuth(async (req: AuthenticatedRequest, res) => {
 *   const userId = req.userId; // Garantizado que existe
 *   // ... lógica del endpoint
 * });
 */
export function requireAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void | NextApiResponse>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // 1. Extraer token del header Authorization
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        logger.warn("Request sin Authorization header", {
          path: req.url,
          method: req.method,
        });
        return res.status(401).json({
          error: "Token de autenticación requerido",
          code: "MISSING_TOKEN",
        });
      }

      // Formato esperado: "Bearer <token>"
      const [bearer, token] = authHeader.split(" ");

      if (bearer !== "Bearer" || !token) {
        logger.warn("Formato de Authorization header inválido", {
          path: req.url,
          authHeader,
        });
        return res.status(401).json({
          error: "Formato de token inválido. Use: Bearer <token>",
          code: "INVALID_TOKEN_FORMAT",
        });
      }

      // 2. Verificar token con Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        logger.warn("Token inválido o expirado", {
          path: req.url,
          error: error?.message,
        });
        return res.status(401).json({
          error: "Token inválido o expirado",
          code: "INVALID_TOKEN",
        });
      }

      // 3. Obtener datos adicionales del usuario desde tabla usuarios
      const { data: userData, error: userError } = await supabase
        .from("usuarios")
        .select("id, email, role")
        .eq("id", user.id)
        .single();

      if (userError || !userData) {
        logger.error("Usuario no encontrado en tabla usuarios", {
          userId: user.id,
          error: userError?.message,
        });
        return res.status(404).json({
          error: "Usuario no encontrado",
          code: "USER_NOT_FOUND",
        });
      }

      // 4. Añadir datos del usuario al request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.userId = user.id;
      authenticatedReq.userEmail = userData.email || user.email;
      authenticatedReq.userRole = userData.role;

      logger.debug("Usuario autenticado", {
        userId: user.id,
        email: authenticatedReq.userEmail,
        role: authenticatedReq.userRole,
        path: req.url,
      });

      // 5. Continuar al handler
      return handler(authenticatedReq, res);
    } catch (error) {
      logger.error("Error en middleware de autenticación", {
        error: error instanceof Error ? error.message : "Unknown error",
        path: req.url,
      });
      return res.status(500).json({
        error: "Error interno del servidor",
        code: "INTERNAL_ERROR",
      });
    }
  };
}

/**
 * Middleware opcional de autenticación
 * 
 * Similar a requireAuth pero NO falla si no hay token.
 * Útil para endpoints que funcionan con o sin autenticación.
 * 
 * @example
 * // Endpoint que funciona para usuarios autenticados y anónimos
 * export default optionalAuth(async (req: AuthenticatedRequest, res) => {
 *   if (req.userId) {
 *     // Usuario autenticado - mostrar datos personalizados
 *   } else {
 *     // Usuario anónimo - mostrar datos públicos
 *   }
 * });
 */
export function optionalAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void | NextApiResponse>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // 1. Intentar extraer token (opcional)
      const authHeader = req.headers.authorization;
      const authenticatedReq = req as AuthenticatedRequest;

      if (!authHeader) {
        // No hay token - continuar sin autenticación
        return handler(authenticatedReq, res);
      }

      const [bearer, token] = authHeader.split(" ");

      if (bearer !== "Bearer" || !token) {
        // Token mal formado - continuar sin autenticación
        return handler(authenticatedReq, res);
      }

      // 2. Verificar token
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        // Token inválido - continuar sin autenticación
        return handler(authenticatedReq, res);
      }

      // 3. Obtener datos del usuario
      const { data: userData } = await supabase
        .from("usuarios")
        .select("id, email, role")
        .eq("id", user.id)
        .single();

      if (userData) {
        // Usuario autenticado - añadir datos al request
        authenticatedReq.userId = user.id;
        authenticatedReq.userEmail = userData.email || user.email;
        authenticatedReq.userRole = userData.role;

        logger.debug("Usuario autenticado (opcional)", {
          userId: user.id,
          path: req.url,
        });
      }

      return handler(authenticatedReq, res);
    } catch (error) {
      logger.error("Error en middleware de autenticación opcional", {
        error: error instanceof Error ? error.message : "Unknown error",
        path: req.url,
      });
      // En caso de error, continuar sin autenticación
      return handler(req as AuthenticatedRequest, res);
    }
  };
}

/**
 * Middleware para verificar rol específico
 * 
 * Requiere autenticación Y un rol específico.
 * 
 * @example
 * // Solo admins pueden acceder
 * export default requireRole('admin')(async (req: AuthenticatedRequest, res) => {
 *   // ... lógica solo para admins
 * });
 */
export function requireRole(allowedRoles: string | string[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (
    handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void | NextApiResponse>
  ) => {
    return requireAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
      const userRole = req.userRole;

      if (!userRole || !roles.includes(userRole)) {
        logger.warn("Acceso denegado por rol", {
          userId: req.userId,
          userRole,
          requiredRoles: roles,
          path: req.url,
        });
        return res.status(403).json({
          error: "No tienes permisos para acceder a este recurso",
          code: "FORBIDDEN",
        });
      }

      return handler(req, res);
    });
  };
}
