/**
 * AuthService - Servicio de autenticación
 * 
 * Maneja lógica de negocio para login, registro, logout y gestión de sesiones
 * usando Supabase Auth
 */

import { supabase } from "./supabase";
import type {
  LoginDto,
  RegisterDto,
  AuthResponse,
  UpdateProfileDto,
} from "@/api/dto/auth.dto";
import type { User } from "@/shared/dto/user.dto";
import { AppError } from "@/api/errors/custom-errors";
import { ErrorMessages } from "@/shared/constants/error-messages";
import { logger } from "@/config/logger";

export class AuthService {
  /**
   * Login de usuario con email y contraseña
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    const { email, password } = data;

    // Intentar login con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      logger.warn("Login fallido", { email, error: authError.message });
      throw new AppError("Email o contraseña incorrectos", 401);
    }

    if (!authData.user || !authData.session) {
      logger.error("Login sin user/session", { email });
      throw new AppError("Error al iniciar sesión", 500);
    }

    // Obtener datos completos del usuario de la tabla profiles
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (userError || !userData) {
      logger.error("Usuario no encontrado en tabla profiles", {
        userId: authData.user.id,
        error: userError?.message,
      });
      throw new AppError(ErrorMessages.USUARIO_NOT_FOUND, 404);
    }

    logger.info("Login exitoso", { userId: authData.user.id, email });

    return {
      user: userData as User,
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_in: authData.session.expires_in || 3600,
        expires_at: authData.session.expires_at || Date.now() / 1000 + 3600,
      },
    };
  }

  /**
   * Registro de nuevo usuario
   */
  async register(data: RegisterDto): Promise<AuthResponse> {
    const { email, password, nombre, apellidos, telefono, rol } = data;

    // Verificar si el email ya existe
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      logger.warn("Intento de registro con email existente", { email });
      throw new AppError("El email ya está registrado", 409);
    }

    // Crear usuario en Supabase Auth
    const fullName = apellidos ? `${nombre} ${apellidos}` : nombre;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: telefono,
          role: rol || "user",
        },
      },
    });

    if (authError) {
      logger.error("Error en signUp de Supabase", {
        email,
        error: authError.message,
      });
      throw new AppError(`Error al crear usuario: ${authError.message}`, 400);
    }

    if (!authData.user) {
      logger.error("SignUp sin user", { email });
      throw new AppError("Error al crear usuario", 500);
    }

    // Crear usuario en tabla profiles (el trigger lo hace automáticamente)
    // Ya no necesitamos insertar manualmente, el trigger handle_new_user lo hace
    
    // Esperar un momento para que el trigger se ejecute
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Obtener el usuario creado por el trigger
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (userError || !userData) {
      logger.error("Error al obtener usuario creado por trigger", {
        userId: authData.user.id,
        error: userError?.message,
      });
      throw new AppError("Error al crear perfil de usuario", 500);
    }

    logger.info("Registro exitoso", { userId: authData.user.id, email, rol });

    // Si hay sesión, retornarla (email NO confirmado todavía)
    if (authData.session) {
      return {
        user: userData as User,
        session: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
          expires_in: authData.session.expires_in || 3600,
          expires_at: authData.session.expires_at || Date.now() / 1000 + 3600,
        },
      };
    }

    // Si no hay sesión (requiere confirmación de email), retornar usuario con sesión vacía
    logger.info("Registro requiere confirmación de email", { userId: authData.user.id });
    return {
      user: userData as User,
      session: {
        access_token: "",
        refresh_token: "",
        expires_in: 0,
        expires_at: 0,
      },
    };
  }

  /**
   * Logout de usuario
   */
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.warn("Error en logout", { error: error.message });
      throw new AppError("Error al cerrar sesión", 500);
    }

    logger.info("Logout exitoso");
  }

  /**
   * Obtener usuario actual por ID
   */
  async getCurrentUser(userId: string): Promise<User> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      logger.error("Usuario no encontrado", { userId, error: error?.message });
      throw new AppError(ErrorMessages.USUARIO_NOT_FOUND, 404);
    }

    return data as User;
  }

  /**
   * Actualizar perfil de usuario
   */
  async updateProfile(userId: string, data: UpdateProfileDto): Promise<User> {
    const { nombre, apellidos, telefono, avatar_url, preferencias } = data;

    const updateData: Record<string, unknown> = {};
    if (nombre !== undefined) {
      // Construir full_name desde nombre y apellidos
      const apellidosStr = apellidos !== undefined ? apellidos : "";
      updateData.full_name = apellidosStr ? `${nombre} ${apellidosStr}` : nombre;
    } else if (apellidos !== undefined) {
      // Solo apellidos, necesitamos obtener nombre actual
      const currentUser = await this.getCurrentUser(userId);
      const nombreActual = currentUser.full_name?.split(" ")[0] || "";
      updateData.full_name = `${nombreActual} ${apellidos}`;
    }
    if (telefono !== undefined) updateData.phone = telefono;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    if (preferencias !== undefined) {
      // preferencias no existe en User interface, guardar como metadata
      updateData.metadata = preferencias;
    }

    const { data: updatedUser, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (error || !updatedUser) {
      logger.error("Error al actualizar perfil", {
        userId,
        error: error?.message,
      });
      throw new AppError("Error al actualizar perfil", 500);
    }

    logger.info("Perfil actualizado", { userId, fields: Object.keys(updateData) });

    return updatedUser as User;
  }

  /**
   * Solicitar reset de contraseña
   */
  async requestPasswordReset(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    if (error) {
      logger.error("Error al solicitar reset de contraseña", {
        email,
        error: error.message,
      });
      throw new AppError("Error al solicitar recuperación de contraseña", 500);
    }

    logger.info("Email de reset de contraseña enviado", { email });
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Obtener usuario
    const user = await this.getCurrentUser(userId);

    // Verificar contraseña actual
    if (!user.email) {
      throw new AppError("Usuario sin email", 400);
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      logger.warn("Contraseña actual incorrecta", { userId });
      throw new AppError("Contraseña actual incorrecta", 401);
    }

    // Actualizar contraseña
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      logger.error("Error al cambiar contraseña", {
        userId,
        error: updateError.message,
      });
      throw new AppError("Error al cambiar contraseña", 500);
    }

    logger.info("Contraseña cambiada exitosamente", { userId });
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session || !data.user) {
      logger.warn("Error al refresh token", { error: error?.message });
      throw new AppError("Token inválido o expirado", 401);
    }

    // Obtener datos completos del usuario
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (userError || !userData) {
      logger.error("Usuario no encontrado al refresh token", {
        userId: data.user.id,
      });
      throw new AppError(ErrorMessages.USUARIO_NOT_FOUND, 404);
    }

    logger.info("Token refrescado exitosamente", { userId: data.user.id });

    return {
      user: userData as User,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in || 3600,
        expires_at: data.session.expires_at || Date.now() / 1000 + 3600,
      },
    };
  }
}
