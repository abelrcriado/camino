/**
 * DTOs para sistema de autenticación
 * 
 * Define las interfaces para login, registro, y respuestas de autenticación
 */

import type { User } from "./user.dto";

/**
 * Datos de login
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * Datos de registro de nuevo usuario
 */
export interface RegisterDto {
  email: string;
  password: string;
  nombre: string;
  apellidos?: string;
  telefono?: string;
  rol?: "user" | "partner" | "admin";
}

/**
 * Respuesta de autenticación exitosa
 */
export interface AuthResponse {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at: number;
  };
}

/**
 * Datos para actualizar perfil de usuario
 */
export interface UpdateProfileDto {
  nombre?: string;
  apellidos?: string;
  telefono?: string;
  avatar_url?: string;
  preferencias?: Record<string, unknown>;
}

/**
 * Datos para reset de contraseña
 */
export interface ResetPasswordDto {
  email: string;
}

/**
 * Datos para cambiar contraseña
 */
export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
}

/**
 * Token de sesión decodificado
 */
export interface DecodedToken {
  sub: string; // user_id
  email: string;
  rol: string;
  exp: number;
  iat: number;
}
