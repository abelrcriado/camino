import { describe, it, expect } from "@jest/globals";
import { z, ZodError } from "zod";
import {
  formatZodErrors,
  validateWithZod,
  validateAndRespond,
  createValidator,
  validatePartial,
} from "../../src/utils/zodValidation";
import { createMocks } from "node-mocks-http";

describe("zodValidation", () => {
  describe("formatZodErrors", () => {
    it("should format Zod errors correctly", () => {
      const schema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
      });

      try {
        schema.parse({ name: "a", email: "invalid" });
      } catch (error) {
        if (error instanceof ZodError) {
          const formatted = formatZodErrors(error);

          expect(formatted).toHaveLength(2);
          expect(formatted[0]).toHaveProperty("field");
          expect(formatted[0]).toHaveProperty("message");
          expect(formatted.some((e) => e.field === "name")).toBe(true);
          expect(formatted.some((e) => e.field === "email")).toBe(true);
        }
      }
    });

    it("should handle nested field paths", () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            age: z.number().positive(),
          }),
        }),
      });

      try {
        schema.parse({ user: { profile: { age: -1 } } });
      } catch (error) {
        if (error instanceof ZodError) {
          const formatted = formatZodErrors(error);

          expect(formatted[0].field).toBe("user.profile.age");
        }
      }
    });

    it("should handle array indices in paths", () => {
      const schema = z.object({
        items: z.array(z.string()),
      });

      try {
        schema.parse({ items: ["valid", 123, "also valid"] });
      } catch (error) {
        if (error instanceof ZodError) {
          const formatted = formatZodErrors(error);

          expect(formatted[0].field).toContain("items");
        }
      }
    });
  });

  describe("validateWithZod", () => {
    const userSchema = z.object({
      name: z.string().min(2).max(50),
      email: z.string().email(),
      age: z.number().int().positive().optional(),
    });

    it("should return success with validated data for valid input", () => {
      const validData = {
        name: "John Doe",
        email: "john@example.com",
        age: 30,
      };

      const result = validateWithZod(userSchema, validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should return errors for invalid input", () => {
      const invalidData = {
        name: "J",
        email: "not-an-email",
        age: -5,
      };

      const result = validateWithZod(userSchema, invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeInstanceOf(Array);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors.some((e) => e.field === "name")).toBe(true);
        expect(result.errors.some((e) => e.field === "email")).toBe(true);
      }
    });

    it("should handle missing required fields", () => {
      const incompleteData = {
        name: "John",
      };

      const result = validateWithZod(userSchema, incompleteData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some((e) => e.field === "email")).toBe(true);
      }
    });

    it("should allow optional fields to be omitted", () => {
      const dataWithoutOptional = {
        name: "John Doe",
        email: "john@example.com",
      };

      const result = validateWithZod(userSchema, dataWithoutOptional);

      expect(result.success).toBe(true);
    });

    it("should handle unexpected errors gracefully", () => {
      const maliciousSchema = z.any().transform(() => {
        throw new Error("Unexpected error");
      });

      const result = validateWithZod(maliciousSchema, {});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0].field).toBe("unknown");
        expect(result.errors[0].message).toContain("desconocido");
      }
    });
  });

  describe("validateAndRespond", () => {
    const schema = z.object({
      name: z.string(),
      email: z.string().email(),
    });

    it("should return validated data for valid input", () => {
      const { req, res } = createMocks({
        method: "POST",
        body: { name: "John", email: "john@example.com" },
      });

      const data = validateAndRespond(schema, req.body, res);

      expect(data).toEqual({ name: "John", email: "john@example.com" });
      expect(res._getStatusCode()).toBe(200);
    });

    it("should send 400 response for invalid input", () => {
      const { req, res } = createMocks({
        method: "POST",
        body: { name: "John", email: "invalid" },
      });

      const data = validateAndRespond(schema, req.body, res);

      expect(data).toBeNull();
      expect(res._getStatusCode()).toBe(400);

      const jsonData = JSON.parse(res._getData());
      expect(jsonData).toHaveProperty("error");
      expect(jsonData).toHaveProperty("details");
      expect(jsonData.details).toBeInstanceOf(Array);
    });

    it("should include error details in response", () => {
      const { req, res } = createMocks({
        method: "POST",
        body: { name: "", email: "invalid" },
      });

      validateAndRespond(schema, req.body, res);

      const jsonData = JSON.parse(res._getData());
      expect(jsonData.error).toContain("validación");
      expect(jsonData.details.length).toBeGreaterThan(0);
    });
  });

  describe("createValidator", () => {
    const schema = z.object({
      username: z.string().min(3),
      password: z.string().min(8),
    });

    it("should create a validator function", () => {
      const validator = createValidator(schema);

      expect(typeof validator).toBe("function");
    });

    it("should validate data correctly", () => {
      const validator = createValidator(schema);

      const validResult = validator({
        username: "john",
        password: "password123",
      });

      expect(validResult.success).toBe(true);

      const invalidResult = validator({
        username: "jo",
        password: "short",
      });

      expect(invalidResult.success).toBe(false);
    });

    it("should be reusable", () => {
      const validator = createValidator(schema);

      const result1 = validator({ username: "user1", password: "password1" });
      const result2 = validator({ username: "user2", password: "password2" });

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });
  });

  describe("validatePartial", () => {
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      age: z.number().int().positive(),
    });

    it("should allow partial updates with valid data", () => {
      const partialData = {
        name: "John Doe",
      };

      const result = validatePartial(schema, partialData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: "John Doe" });
      }
    });

    it("should validate provided fields", () => {
      const invalidPartialData = {
        email: "not-an-email",
      };

      const result = validatePartial(schema, invalidPartialData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some((e) => e.field === "email")).toBe(true);
      }
    });

    it("should allow empty object for partial schema", () => {
      const result = validatePartial(schema, {});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({});
      }
    });

    it("should validate multiple partial fields", () => {
      const partialData = {
        name: "Jane",
        age: 25,
      };

      const result = validatePartial(schema, partialData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: "Jane", age: 25 });
      }
    });

    it("should reject invalid types even for partial", () => {
      const invalidPartialData = {
        age: "not-a-number",
      };

      const result = validatePartial(schema, invalidPartialData);

      expect(result.success).toBe(false);
    });
  });
});
