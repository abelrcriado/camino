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
import { TestDataGenerators, SchemaDataGenerators } from "../helpers/test-data-generators";

describe("User Schemas", () => {
  describe("createUserSchema", () => {
    const validData = {
      id: SchemaDataGenerators.user.id(),
      email: SchemaDataGenerators.user.email(),
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
      const data = { ...validData, id: TestDataGenerators.alphanumeric(10) };
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
      const emails = TestDataGenerators.emails(4);

      emails.forEach((email) => {
        const data = { ...validData, email };
        const result = createUserSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should accept optional full_name", () => {
      const data = { ...validData, full_name: SchemaDataGenerators.user.fullName() };
      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept optional avatar_url", () => {
      const data = {
        ...validData,
        avatar_url: SchemaDataGenerators.user.avatarUrl(),
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
      const data = { ...validData, phone: SchemaDataGenerators.user.phone() };
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
      id: SchemaDataGenerators.user.id(),
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
      const data = { ...validData, id: TestDataGenerators.alphanumeric(10) };
      const result = updateUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept optional email", () => {
      const data = { ...validData, email: SchemaDataGenerators.user.email() };
      const result = updateUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept all optional fields", () => {
      const data = {
        id: SchemaDataGenerators.user.id(),
        email: SchemaDataGenerators.user.email(),
        full_name: SchemaDataGenerators.user.fullName(),
        avatar_url: SchemaDataGenerators.user.avatarUrl(),
        phone: SchemaDataGenerators.user.phone(),
        preferred_language: SchemaDataGenerators.user.preferredLanguage(),
        role: SchemaDataGenerators.user.role(),
      };
      const result = updateUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("deleteUserSchema", () => {
    it("should validate correct delete data", () => {
      const data = { id: SchemaDataGenerators.user.id() };
      const result = deleteUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject missing id", () => {
      const data = {};
      const result = deleteUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid id UUID", () => {
      const data = { id: TestDataGenerators.alphanumeric(10) };
      const result = deleteUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject extra fields", () => {
      const data = {
        id: SchemaDataGenerators.user.id(),
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
      const data = { email: SchemaDataGenerators.user.email() };
      const result = queryUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email format", () => {
      const data = { email: "invalid-email" };
      const result = queryUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept role filter", () => {
      const data = { role: SchemaDataGenerators.user.role() };
      const result = queryUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept both filters", () => {
      const data = {
        email: SchemaDataGenerators.user.email(),
        role: SchemaDataGenerators.user.role(),
      };
      const result = queryUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
