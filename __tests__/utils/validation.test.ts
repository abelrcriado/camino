/**
 * Tests para funciones de validación
 *
 * Estos tests verifican que las funciones de validación
 * en src/utils/validation.ts funcionen correctamente
 */

import {
  isValidUUID,
  isValidISODate,
  isValidEmail,
} from "@/shared/utils/validation";

describe("Validation Utils", () => {
  describe("isValidUUID", () => {
    it("should return true for valid UUID v4", () => {
      const validUUID = "550e8400-e29b-41d4-a716-446655440000";
      expect(isValidUUID(validUUID)).toBe(true);
    });

    it("should return true for another valid UUID", () => {
      const validUUID = "123e4567-e89b-12d3-a456-426614174000";
      expect(isValidUUID(validUUID)).toBe(true);
    });

    it("should return false for invalid UUID format", () => {
      const invalidUUID = "not-a-uuid";
      expect(isValidUUID(invalidUUID)).toBe(false);
    });

    it("should return false for UUID without dashes", () => {
      const invalidUUID = "550e8400e29b41d4a716446655440000";
      expect(isValidUUID(invalidUUID)).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isValidUUID("")).toBe(false);
    });

    it("should return false for UUID with wrong length", () => {
      const invalidUUID = "550e8400-e29b-41d4-a716";
      expect(isValidUUID(invalidUUID)).toBe(false);
    });
  });

  describe("isValidISODate", () => {
    it("should return true for valid ISO 8601 date", () => {
      const validDate = "2025-10-20T10:30:00Z";
      expect(isValidISODate(validDate)).toBe(true);
    });

    it("should return true for ISO date with milliseconds", () => {
      const validDate = "2025-10-20T10:30:00.123Z";
      expect(isValidISODate(validDate)).toBe(true);
    });

    it("should return true for ISO date with Z timezone", () => {
      const validDate = "2025-10-20T10:30:00Z";
      expect(isValidISODate(validDate)).toBe(true);
    });

    it("should return false for invalid date format", () => {
      const invalidDate = "2025/10/20 10:30:00";
      expect(isValidISODate(invalidDate)).toBe(false);
    });

    it("should return false for date without time", () => {
      const invalidDate = "2025-10-20";
      expect(isValidISODate(invalidDate)).toBe(false);
    });

    it("should return false for invalid date values", () => {
      const invalidDate = "2025-13-40T25:70:00Z";
      expect(isValidISODate(invalidDate)).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isValidISODate("")).toBe(false);
    });
  });

  describe("isValidEmail", () => {
    it("should return true for valid email", () => {
      const validEmail = "user@example.com";
      expect(isValidEmail(validEmail)).toBe(true);
    });

    it("should return true for email with subdomain", () => {
      const validEmail = "user@mail.example.com";
      expect(isValidEmail(validEmail)).toBe(true);
    });

    it("should return true for email with numbers", () => {
      const validEmail = "user123@example.com";
      expect(isValidEmail(validEmail)).toBe(true);
    });

    it("should return true for email with dots", () => {
      const validEmail = "first.last@example.com";
      expect(isValidEmail(validEmail)).toBe(true);
    });

    it("should return false for email without @", () => {
      const invalidEmail = "userexample.com";
      expect(isValidEmail(invalidEmail)).toBe(false);
    });

    it("should return false for email without domain", () => {
      const invalidEmail = "user@";
      expect(isValidEmail(invalidEmail)).toBe(false);
    });

    it("should return false for email without user part", () => {
      const invalidEmail = "@example.com";
      expect(isValidEmail(invalidEmail)).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isValidEmail("")).toBe(false);
    });

    it("should return false for email with spaces", () => {
      const invalidEmail = "user name@example.com";
      expect(isValidEmail(invalidEmail)).toBe(false);
    });
  });
});
