/**
 * Tests para user.schema.ts
 * Valida schemas Zod para operaciones CRUD de users
 */

import {
  createUserSchema,
  updateUserSchema,
  deleteUserSchema,
  queryUserSchema,
} from "../../src/schemas/user.schema";

describe("User Schemas", () => {
  describe("createUserSchema", () => {
    const validData = {
      id: "550e8400-e29b-41d4-a716-446655440001",
      email: "test@example.com",
    };

    it("should validate correct user data", () => {
      const result = createUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject missing id", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...data } = validData;
      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid id UUID", () => {
      const data = { ...validData, id: "invalid-uuid" };
      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject missing email", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { email, ...data } = validData;
      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid email format", () => {
      const data = { ...validData, email: "invalid-email" };
      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept valid email formats", () => {
      const emails = [
        "user@example.com",
        "user.name@example.com",
        "user+tag@example.co.uk",
        "user123@test-domain.com",
      ];

      emails.forEach((email) => {
        const data = { ...validData, email };
        const result = createUserSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should accept optional full_name", () => {
      const data = { ...validData, full_name: "John Doe" };
      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept optional avatar_url", () => {
      const data = {
        ...validData,
        avatar_url: "https://example.com/avatar.jpg",
      };
      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject invalid avatar_url", () => {
      const data = { ...validData, avatar_url: "not-a-url" };
      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept optional phone", () => {
      const data = { ...validData, phone: "+34123456789" };
      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept optional preferred_language", () => {
      const languages = ["es", "en", "fr", "de", "pt"];
      languages.forEach((lang) => {
        const data = { ...validData, preferred_language: lang };
        const result = createUserSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid preferred_language", () => {
      const data = { ...validData, preferred_language: "invalid" };
      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept all valid role values", () => {
      const roles = ["admin", "manager", "user", "guest", "mechanic"];
      roles.forEach((role) => {
        const data = { ...validData, role };
        const result = createUserSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid role", () => {
      const data = { ...validData, role: "superadmin" };
      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject extra fields", () => {
      const data = { ...validData, extra_field: "value" };
      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("updateUserSchema", () => {
    const validData = {
      id: "550e8400-e29b-41d4-a716-446655440000",
    };

    it("should validate correct update data", () => {
      const result = updateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should require id field", () => {
      const data = { email: "test@example.com" };
      const result = updateUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid id UUID", () => {
      const data = { ...validData, id: "invalid-uuid" };
      const result = updateUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept optional email", () => {
      const data = { ...validData, email: "new@example.com" };
      const result = updateUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept all optional fields", () => {
      const data = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        email: "new@example.com",
        full_name: "Jane Doe",
        avatar_url: "https://example.com/new-avatar.jpg",
        phone: "+34987654321",
        preferred_language: "en",
        role: "manager",
      };
      const result = updateUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("deleteUserSchema", () => {
    it("should validate correct delete data", () => {
      const data = { id: "550e8400-e29b-41d4-a716-446655440000" };
      const result = deleteUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject missing id", () => {
      const data = {};
      const result = deleteUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid id UUID", () => {
      const data = { id: "invalid-uuid" };
      const result = deleteUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject extra fields", () => {
      const data = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        extra: "field",
      };
      const result = deleteUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("queryUserSchema", () => {
    it("should validate empty query", () => {
      const result = queryUserSchema.safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it("should accept email filter", () => {
      const data = { email: "test@example.com" };
      const result = queryUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email format", () => {
      const data = { email: "invalid-email" };
      const result = queryUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept role filter", () => {
      const data = { role: "admin" };
      const result = queryUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept both filters", () => {
      const data = {
        email: "admin@example.com",
        role: "admin",
      };
      const result = queryUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
