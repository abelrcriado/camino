/**
 * AuthController - Controlador para autenticación
 * 
 * Maneja peticiones HTTP para login, registro, logout y gestión de sesiones
 */

import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Extended NextApiRequest con userId del middleware de autenticación
 */
interface AuthenticatedRequest extends NextApiRequest {
  userId?: string;
}
import { AuthService } from "@/api/services/auth.service";
import {
  verifyEmailSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "@/api/schemas/auth.schema";
import { asyncHandler } from "@/api/middlewares/error-handler";
import { AppError } from "@/api/errors/custom-errors";
import { ErrorMessages } from "@/shared/constants/error-messages";
import logger from "@/config/logger";

export class AuthController {
  private authService: AuthService;

  constructor(authService?: AuthService) {
    this.authService = authService || new AuthService();
  }

  /**
   * POST /api/auth/login
   * Login de usuario
   */
  handleLogin = asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
    // Validar método
    if (req.method !== "POST") {
      throw new AppError(ErrorMessages.METHOD_NOT_ALLOWED, 405);
    }

    // Validar datos con Zod
    const data = loginSchema.parse(req.body);

    // Login
    const authResponse = await this.authService.login(data);

    logger.info("Login exitoso", { userId: authResponse.user.id });

    return res.status(200).json({
      data: authResponse,
    });
  });

  /**
   * POST /api/auth/register
   * Registro de nuevo usuario
   */
  handleRegister = asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
    // Validar método
    if (req.method !== "POST") {
      throw new AppError(ErrorMessages.METHOD_NOT_ALLOWED, 405);
    }

    // Validar datos con Zod
    const data = registerSchema.parse(req.body);

    // Registro
    const authResponse = await this.authService.register(data);

    logger.info("Registro exitoso", { userId: authResponse.user.id });

    // Si no hay access_token, significa que requiere confirmación de email
    if (!authResponse.session.access_token) {
      return res.status(201).json({
        data: authResponse,
        message: "Usuario creado. Por favor verifica tu email para activar tu cuenta.",
      });
    }

    return res.status(201).json({
      data: authResponse,
    });
  });

  /**
   * POST /api/auth/logout
   * Cerrar sesión
   */
  handleLogout = asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
    // Validar método
    if (req.method !== "POST") {
      throw new AppError(ErrorMessages.METHOD_NOT_ALLOWED, 405);
    }

    // Logout (no requiere validación de datos)
    await this.authService.logout();

    logger.info("Logout exitoso");

    return res.status(200).json({
      message: "Sesión cerrada exitosamente",
    });
  });

  /**
   * Handlers para /me: GET (perfil) y PUT (actualizar perfil)
   * Estos métodos esperan que el middleware de autenticación haya sido aplicado
   * y por tanto req.userId esté disponible
   */
  handleMe = asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
    // Solo GET y PUT permitidos
    if (req.method === "GET") {
      return this.handleGetMe(req, res);
    } else if (req.method === "PUT") {
      return this.handleUpdateProfile(req, res);
    }

    throw new AppError(ErrorMessages.METHOD_NOT_ALLOWED, 405);
  });

  /**
   * GET handler para /me
   */
  private handleGetMe = asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
    // Obtener userId del middleware de autenticación
    const userId = (req as AuthenticatedRequest).userId;

    if (!userId) {
      throw new AppError("Usuario no autenticado", 401);
    }

    // Obtener datos del usuario
    const user = await this.authService.getCurrentUser(userId);

    return res.status(200).json({
      data: user,
    });
  });

  /**
   * PUT /api/auth/me
   * Actualizar perfil de usuario actual
   */
  handleUpdateProfile = asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
    // Validar método
    if (req.method !== "PUT") {
      throw new AppError(ErrorMessages.METHOD_NOT_ALLOWED, 405);
    }

    // Obtener userId desde middleware
    const userId = (req as AuthenticatedRequest).userId;

    if (!userId) {
      throw new AppError("Usuario no autenticado", 401);
    }

    // Validar datos con Zod
    const data = updateProfileSchema.parse(req.body);

    // Actualizar perfil
    const updatedUser = await this.authService.updateProfile(userId, data);

    logger.info("Perfil actualizado", { userId });

    return res.status(200).json({
      data: updatedUser,
    });
  });

  /**
   * POST /api/auth/reset-password
   * Solicitar reset de contraseña
   */
  handleResetPassword = asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
    // Validar método
    if (req.method !== "POST") {
      throw new AppError(ErrorMessages.METHOD_NOT_ALLOWED, 405);
    }

    // Validar datos con Zod
    const { email } = resetPasswordSchema.parse(req.body);

    // Solicitar reset
    await this.authService.requestPasswordReset(email);

    logger.info("Reset de contraseña solicitado", { email });

    return res.status(200).json({
      message: "Se ha enviado un email con instrucciones para restablecer tu contraseña",
    });
  });

  /**
   * POST /api/auth/change-password
   * Cambiar contraseña
   */
  handleChangePassword = asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
    // Validar método
    if (req.method !== "POST") {
      throw new AppError(ErrorMessages.METHOD_NOT_ALLOWED, 405);
    }

    // Obtener userId desde middleware
    const userId = (req as AuthenticatedRequest).userId;

    if (!userId) {
      throw new AppError("Usuario no autenticado", 401);
    }

    // Validar datos con Zod
    const { current_password, new_password } = changePasswordSchema.parse(req.body);

    // Cambiar contraseña
    await this.authService.changePassword(userId, current_password, new_password);

    logger.info("Contraseña cambiada", { userId });

    return res.status(200).json({
      message: "Contraseña actualizada exitosamente",
    });
  });

  /**
   * POST /api/auth/refresh
   * Refrescar access token
   */
  handleRefresh = asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
    // Validar método
    if (req.method !== "POST") {
      throw new AppError(ErrorMessages.METHOD_NOT_ALLOWED, 405);
    }

    // Obtener refresh_token desde body
    const { refresh_token } = req.body;

    if (!refresh_token) {
      throw new AppError("refresh_token es requerido", 400);
    }

    // Refrescar token
    const authResponse = await this.authService.refreshToken(refresh_token);

    logger.info("Token refrescado", { userId: authResponse.user.id });

    return res.status(200).json({
      data: authResponse,
    });
  });

  /**
   * GET /api/auth/verify-email
   * Verificar email del usuario (callback desde Supabase)
   */
  handleVerifyEmail = asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
    // Validar método
    if (req.method !== "GET") {
      throw new AppError(ErrorMessages.METHOD_NOT_ALLOWED, 405);
    }

    // Obtener token desde query params
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      throw new AppError("Token de verificación requerido", 400);
    }

    // Validar token con schema
    const { token: validatedToken } = verifyEmailSchema.parse({ token });

    // Supabase maneja la verificación automáticamente cuando el usuario
    // hace click en el enlace del email. Este endpoint solo confirma el éxito.
    logger.info("Verificación de email solicitada", { token: validatedToken.substring(0, 10) + "..." });

    return res.status(200).json({
      message: "Email verificado exitosamente",
    });
  });
}
