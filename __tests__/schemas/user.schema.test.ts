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
import { UserFactory, generateUUID } from "../helpers/factories";

describe("User Schemas", () => {
  describe("createUserSchema", () => {
    const validData = {
      id: generateUUID(),
      email: UserFactory.createDto().email!,
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
        UserFactory.createDto().email!,
        UserFactory.createDto().email!,
        UserFactory.createDto().email!,
        UserFactory.createDto().email!,
      ];

      emails.forEach((email) => {
        const data = { ...validData, email };
        const result = createUserSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should accept optional full_name", () => {
      const data = { ...validData, full_name: UserFactory.createDto().full_name };
      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept optional avatar_url", () => {
      const data = {
        ...validData,
        avatar_url: UserFactory.createDto().avatar_url,
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
      const data = { ...validData, phone: UserFactory.createDto().phone };
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
      id: generateUUID(),
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
      const data = { ...validData, email: UserFactory.createDto().email };
      const result = updateUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept all optional fields", () => {
      const userData = UserFactory.createDto();
      const data = {
        id: generateUUID(),
        email: userData.email,
        full_name: userData.full_name,
        avatar_url: userData.avatar_url,
        phone: userData.phone,
        preferred_language: userData.preferred_language,
        role: "manager" as const,
      };
      const result = updateUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("deleteUserSchema", () => {
    it("should validate correct delete data", () => {
      const data = { id: generateUUID() };
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
        id: generateUUID(),
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
      const data = { email: UserFactory.createDto().email };
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
        email: UserFactory.createDto().email,
        role: "admin" as const,
      };
      const result = queryUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
