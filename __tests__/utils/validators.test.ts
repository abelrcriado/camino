import { describe, it, expect } from "@jest/globals";
import { Validators } from "@/shared/utils/validators";

describe("Validators", () => {
  describe("isValidUUID", () => {
    it("should return true for valid UUID v4", () => {
      expect(
        Validators.isValidUUID("550e8400-e29b-41d4-a716-446655440000")
      ).toBe(true);
      expect(
        Validators.isValidUUID("123e4567-e89b-12d3-a456-426614174000")
      ).toBe(true);
    });

    it("should return true for UUID in lowercase", () => {
      expect(
        Validators.isValidUUID("550e8400-e29b-41d4-a716-446655440000")
      ).toBe(true);
    });

    it("should return true for UUID in uppercase", () => {
      expect(
        Validators.isValidUUID("550E8400-E29B-41D4-A716-446655440000")
      ).toBe(true);
    });

    it("should return false for invalid UUID format", () => {
      expect(Validators.isValidUUID("not-a-uuid")).toBe(false);
      expect(Validators.isValidUUID("550e8400-e29b-41d4")).toBe(false);
      expect(
        Validators.isValidUUID("550e8400-e29b-41d4-a716-446655440000-extra")
      ).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(Validators.isValidUUID("")).toBe(false);
    });

    it("should return false for UUID with invalid characters", () => {
      expect(
        Validators.isValidUUID("550e8400-g29b-41d4-a716-446655440000")
      ).toBe(false);
    });
  });

  describe("isValidEmail", () => {
    it("should return true for valid email addresses", () => {
      expect(Validators.isValidEmail("user@example.com")).toBe(true);
      expect(Validators.isValidEmail("test.user@company.co.uk")).toBe(true);
      expect(Validators.isValidEmail("user+tag@example.com")).toBe(true);
    });

    it("should return false for invalid email addresses", () => {
      expect(Validators.isValidEmail("not-an-email")).toBe(false);
      expect(Validators.isValidEmail("@example.com")).toBe(false);
      expect(Validators.isValidEmail("user@")).toBe(false);
      expect(Validators.isValidEmail("user @example.com")).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(Validators.isValidEmail("")).toBe(false);
    });
  });

  describe("isValidURL", () => {
    it("should return true for valid URLs", () => {
      expect(Validators.isValidURL("https://example.com")).toBe(true);
      expect(Validators.isValidURL("http://example.com")).toBe(true);
      expect(Validators.isValidURL("https://example.com/path?query=123")).toBe(
        true
      );
    });

    it("should return false for invalid URLs", () => {
      expect(Validators.isValidURL("not-a-url")).toBe(false);
      expect(Validators.isValidURL("example.com")).toBe(false);
      expect(Validators.isValidURL("//example.com")).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(Validators.isValidURL("")).toBe(false);
    });
  });

  describe("isValidISODate", () => {
    it("should return true for valid ISO 8601 datetime strings", () => {
      expect(Validators.isValidISODate("2025-01-10T12:30:00Z")).toBe(true);
      expect(Validators.isValidISODate("2025-01-10T12:30:00.000Z")).toBe(true);
      expect(Validators.isValidISODate("2025-01-10T12:30:00.123Z")).toBe(true);
    });

    it("should return false for invalid ISO date formats", () => {
      expect(Validators.isValidISODate("2025-01-10")).toBe(false);
      expect(Validators.isValidISODate("10/01/2025")).toBe(false);
      expect(Validators.isValidISODate("not-a-date")).toBe(false);
      expect(Validators.isValidISODate("2025-01-10 12:30:00")).toBe(false); // space instead of T
    });

    it("should return false for empty string", () => {
      expect(Validators.isValidISODate("")).toBe(false);
    });
  });

  describe("isPositiveNumber", () => {
    it("should return true for positive numbers", () => {
      expect(Validators.isPositiveNumber(1)).toBe(true);
      expect(Validators.isPositiveNumber(100.5)).toBe(true);
      expect(Validators.isPositiveNumber(0.001)).toBe(true);
    });

    it("should return false for zero", () => {
      expect(Validators.isPositiveNumber(0)).toBe(false);
    });

    it("should return false for negative numbers", () => {
      expect(Validators.isPositiveNumber(-1)).toBe(false);
      expect(Validators.isPositiveNumber(-100.5)).toBe(false);
    });

    it("should return false for non-numeric values", () => {
      expect(Validators.isPositiveNumber("123")).toBe(false);
      expect(Validators.isPositiveNumber(null)).toBe(false);
      expect(Validators.isPositiveNumber(undefined)).toBe(false);
    });
  });

  describe("isInRange", () => {
    it("should return true for numbers within range", () => {
      expect(Validators.isInRange(5, 1, 10)).toBe(true);
      expect(Validators.isInRange(1, 1, 10)).toBe(true);
      expect(Validators.isInRange(10, 1, 10)).toBe(true);
    });

    it("should return false for numbers outside range", () => {
      expect(Validators.isInRange(0, 1, 10)).toBe(false);
      expect(Validators.isInRange(11, 1, 10)).toBe(false);
      expect(Validators.isInRange(-5, 1, 10)).toBe(false);
    });

    it("should work with decimal numbers", () => {
      expect(Validators.isInRange(5.5, 1.0, 10.0)).toBe(true);
      expect(Validators.isInRange(0.5, 1.0, 10.0)).toBe(false);
    });
  });

  describe("hasValidLength", () => {
    it("should return true for strings within length range", () => {
      expect(Validators.hasValidLength("hello", 2, 10)).toBe(true);
      expect(Validators.hasValidLength("hi", 2, 10)).toBe(true);
      expect(Validators.hasValidLength("helloworld", 2, 10)).toBe(true);
    });

    it("should return false for strings outside length range", () => {
      expect(Validators.hasValidLength("h", 2, 10)).toBe(false);
      expect(Validators.hasValidLength("hello world!", 2, 10)).toBe(false);
    });

    it("should return false for empty string with min > 0", () => {
      expect(Validators.hasValidLength("", 2, 10)).toBe(false);
    });

    it("should return true for empty string with min = 0", () => {
      expect(Validators.hasValidLength("", 0, 10)).toBe(true);
    });
  });

  describe("isValidPhone", () => {
    it("should return true for valid international phone numbers", () => {
      expect(Validators.isValidPhone("+34123456789")).toBe(true);
      expect(Validators.isValidPhone("+1234567890123")).toBe(true);
      expect(Validators.isValidPhone("+4412345678")).toBe(true);
    });

    it("should return true for phone numbers without + prefix", () => {
      expect(Validators.isValidPhone("34123456789")).toBe(true);
      expect(Validators.isValidPhone("1234567890")).toBe(true);
    });

    it("should handle spaces and hyphens", () => {
      expect(Validators.isValidPhone("+34 123 456 789")).toBe(true);
      expect(Validators.isValidPhone("+34-123-456-789")).toBe(true);
      expect(Validators.isValidPhone("34 123 456 789")).toBe(true);
    });

    it("should return false for invalid phone numbers", () => {
      expect(Validators.isValidPhone("abc123")).toBe(false);
      expect(Validators.isValidPhone("+")).toBe(false);
      expect(Validators.isValidPhone("")).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(Validators.isValidPhone("")).toBe(false);
    });
  });

  describe("isOneOf", () => {
    it("should return true for values in allowed list", () => {
      expect(
        Validators.isOneOf("pending", ["pending", "completed", "cancelled"])
      ).toBe(true);
      expect(Validators.isOneOf(1, [1, 2, 3])).toBe(true);
    });

    it("should return false for values not in allowed list", () => {
      expect(
        Validators.isOneOf("invalid", ["pending", "completed", "cancelled"])
      ).toBe(false);
      expect(Validators.isOneOf(4, [1, 2, 3])).toBe(false);
    });

    it("should work with different types", () => {
      expect(Validators.isOneOf("active", ["active", "inactive"])).toBe(true);
      expect(Validators.isOneOf(true, [true, false])).toBe(true);
    });

    it("should return false for empty allowed list", () => {
      expect(Validators.isOneOf("value", [])).toBe(false);
    });
  });

  describe("isValidLatitude", () => {
    it("should return true for valid latitudes", () => {
      expect(Validators.isValidLatitude(0)).toBe(true);
      expect(Validators.isValidLatitude(40.416775)).toBe(true);
      expect(Validators.isValidLatitude(-33.86882)).toBe(true);
      expect(Validators.isValidLatitude(90)).toBe(true);
      expect(Validators.isValidLatitude(-90)).toBe(true);
    });

    it("should return false for invalid latitudes", () => {
      expect(Validators.isValidLatitude(91)).toBe(false);
      expect(Validators.isValidLatitude(-91)).toBe(false);
      expect(Validators.isValidLatitude(100)).toBe(false);
      expect(Validators.isValidLatitude(-100)).toBe(false);
    });
  });

  describe("isValidLongitude", () => {
    it("should return true for valid longitudes", () => {
      expect(Validators.isValidLongitude(0)).toBe(true);
      expect(Validators.isValidLongitude(-3.70379)).toBe(true);
      expect(Validators.isValidLongitude(151.209296)).toBe(true);
      expect(Validators.isValidLongitude(180)).toBe(true);
      expect(Validators.isValidLongitude(-180)).toBe(true);
    });

    it("should return false for invalid longitudes", () => {
      expect(Validators.isValidLongitude(181)).toBe(false);
      expect(Validators.isValidLongitude(-181)).toBe(false);
      expect(Validators.isValidLongitude(200)).toBe(false);
      expect(Validators.isValidLongitude(-200)).toBe(false);
    });
  });

  describe("isValidPostalCode", () => {
    it("should return true for valid Spanish postal codes", () => {
      expect(Validators.isValidPostalCode("28001")).toBe(true);
      expect(Validators.isValidPostalCode("08001")).toBe(true);
      expect(Validators.isValidPostalCode("46001")).toBe(true);
    });

    it("should return false for invalid postal codes", () => {
      expect(Validators.isValidPostalCode("2800")).toBe(false); // too short
      expect(Validators.isValidPostalCode("280011")).toBe(false); // too long
      expect(Validators.isValidPostalCode("2800A")).toBe(false); // contains letter
      expect(Validators.isValidPostalCode("")).toBe(false); // empty
    });
  });

  describe("isNonEmpty", () => {
    it("should return true for non-empty strings", () => {
      expect(Validators.isNonEmpty("hello")).toBe(true);
      expect(Validators.isNonEmpty("  hello  ")).toBe(true);
      expect(Validators.isNonEmpty("a")).toBe(true);
    });

    it("should return false for empty strings", () => {
      expect(Validators.isNonEmpty("")).toBe(false);
      expect(Validators.isNonEmpty("   ")).toBe(false);
      expect(Validators.isNonEmpty("\t\n")).toBe(false);
    });
  });

  describe("isNonEmptyArray", () => {
    it("should return true for non-empty arrays", () => {
      expect(Validators.isNonEmptyArray([1])).toBe(true);
      expect(Validators.isNonEmptyArray([1, 2, 3])).toBe(true);
      expect(Validators.isNonEmptyArray(["a", "b"])).toBe(true);
    });

    it("should return false for empty arrays", () => {
      expect(Validators.isNonEmptyArray([])).toBe(false);
    });

    it("should return false for non-array values", () => {
      expect(Validators.isNonEmptyArray("not an array" as never)).toBe(false);
      expect(Validators.isNonEmptyArray(123 as never)).toBe(false);
      expect(Validators.isNonEmptyArray(null as never)).toBe(false);
      expect(Validators.isNonEmptyArray(undefined as never)).toBe(false);
    });
  });
});
