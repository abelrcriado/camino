/**
 * Utilidades de validación centralizadas
 *
 * Evita duplicación de código de validación en controllers
 * y proporciona validadores consistentes en toda la aplicación.
 */

import { z } from "zod";

export class Validators {
  /**
   * Regex para validar UUID v4
   */
  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  /**
   * Valida formato UUID v4
   *
   * @example
   * if (!Validators.isValidUUID(id)) {
   *   throw new ValidationError("ID inválido");
   * }
   */
  static isValidUUID(uuid: string): boolean {
    return this.UUID_REGEX.test(uuid);
  }

  /**
   * Valida formato de email
   *
   * @example
   * if (!Validators.isValidEmail(email)) {
   *   throw new ValidationError("Email inválido");
   * }
   */
  static isValidEmail(email: string): boolean {
    return z.string().email().safeParse(email).success;
  }

  /**
   * Valida formato de URL
   *
   * @example
   * if (!Validators.isValidURL(website)) {
   *   throw new ValidationError("URL inválida");
   * }
   */
  static isValidURL(url: string): boolean {
    return z.string().url().safeParse(url).success;
  }

  /**
   * Valida fecha en formato ISO 8601
   *
   * @example
   * if (!Validators.isValidISODate(dateString)) {
   *   throw new ValidationError("Formato de fecha inválido");
   * }
   */
  static isValidISODate(date: string): boolean {
    return z.string().datetime().safeParse(date).success;
  }

  /**
   * Valida que un número sea positivo
   *
   * @example
   * if (!Validators.isPositiveNumber(price)) {
   *   throw new ValidationError("El precio debe ser positivo");
   * }
   */
  static isPositiveNumber(num: unknown): boolean {
    return z.number().positive().safeParse(num).success;
  }

  /**
   * Valida que un número esté en un rango
   *
   * @example
   * if (!Validators.isInRange(rating, 1, 5)) {
   *   throw new ValidationError("La calificación debe estar entre 1 y 5");
   * }
   */
  static isInRange(num: number, min: number, max: number): boolean {
    return num >= min && num <= max;
  }

  /**
   * Valida longitud de string
   *
   * @example
   * if (!Validators.hasValidLength(name, 2, 150)) {
   *   throw new ValidationError("El nombre debe tener entre 2 y 150 caracteres");
   * }
   */
  static hasValidLength(str: string, min: number, max: number): boolean {
    return str.length >= min && str.length <= max;
  }

  /**
   * Valida número de teléfono (formato internacional básico)
   *
   * @example
   * if (!Validators.isValidPhone(phone)) {
   *   throw new ValidationError("Formato de teléfono inválido");
   * }
   */
  static isValidPhone(phone: string): boolean {
    // Formato básico: +XX XXX XXX XXX o variaciones
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ""));
  }

  /**
   * Valida que un valor esté en un array de opciones permitidas
   *
   * @example
   * if (!Validators.isOneOf(status, ["pending", "completed", "cancelled"])) {
   *   throw new ValidationError("Estado inválido");
   * }
   */
  static isOneOf<T>(value: T, allowedValues: T[]): boolean {
    return allowedValues.includes(value);
  }

  /**
   * Valida coordenadas geográficas (latitud, longitud)
   *
   * @example
   * if (!Validators.isValidLatitude(lat) || !Validators.isValidLongitude(lng)) {
   *   throw new ValidationError("Coordenadas inválidas");
   * }
   */
  static isValidLatitude(lat: number): boolean {
    return lat >= -90 && lat <= 90;
  }

  static isValidLongitude(lng: number): boolean {
    return lng >= -180 && lng <= 180;
  }

  /**
   * Valida código postal (formato español)
   *
   * @example
   * if (!Validators.isValidPostalCode(postalCode)) {
   *   throw new ValidationError("Código postal inválido");
   * }
   */
  static isValidPostalCode(postalCode: string): boolean {
    // Formato español: 5 dígitos
    return /^\d{5}$/.test(postalCode);
  }

  /**
   * Valida que un string no esté vacío (después de trim)
   *
   * @example
   * if (!Validators.isNonEmpty(description)) {
   *   throw new ValidationError("La descripción no puede estar vacía");
   * }
   */
  static isNonEmpty(str: string): boolean {
    return str.trim().length > 0;
  }

  /**
   * Valida que un array no esté vacío
   *
   * @example
   * if (!Validators.isNonEmptyArray(items)) {
   *   throw new ValidationError("Debe proporcionar al menos un item");
   * }
   */
  static isNonEmptyArray<T>(arr: T[]): boolean {
    return Array.isArray(arr) && arr.length > 0;
  }
}
