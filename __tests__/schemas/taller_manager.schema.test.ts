import { describe, it, expect } from "@jest/globals";
import { generateUUID } from "../helpers/factories";
import {
  createTallerManagerSchema,
  updateTallerManagerSchema,
  deleteTallerManagerSchema,
  queryTallerManagerSchema,
} from "@/api/schemas/taller_manager.schema";

describe("Taller Manager Schemas", () => {
  const validUUID = generateUUID();
  const validUUID2 = generateUUID();
  const invalidUUID = "invalid-uuid";

  describe("createTallerManagerSchema", () => {
    const validData = {
      workshop_id: validUUID,
      user_id: validUUID2,
      name: "Carlos Martínez",
      email: "carlos.martinez@taller.com",
      phone: "+34612345678",
    };

    it("should validate correct taller manager data", () => {
      expect(() => createTallerManagerSchema.parse(validData)).not.toThrow();
    });

    it("should validate with optional role", () => {
      const data = { ...validData, role: "Jefe de Taller" };
      expect(() => createTallerManagerSchema.parse(data)).not.toThrow();
    });

    it("should reject missing workshop_id", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { workshop_id, ...data } = validData;
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject missing user_id", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { user_id, ...data } = validData;
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject missing name", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { name, ...data } = validData;
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject missing email", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { email, ...data } = validData;
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should validate without optional phone", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { phone, ...data } = validData;
      expect(() => createTallerManagerSchema.parse(data)).not.toThrow();
    });

    it("should reject name too short", () => {
      const data = { ...validData, name: "A" };
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject name too long", () => {
      const data = { ...validData, name: "A".repeat(151) };
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject invalid email format", () => {
      const data = { ...validData, email: "invalid-email" };
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject invalid phone format", () => {
      const data = { ...validData, phone: "123" };
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject extra fields in strict mode", () => {
      const data = { ...validData, extra_field: "value" };
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    // Nuevos tests comprehensivos
    it("should reject invalid workshop_id format", () => {
      const data = { ...validData, workshop_id: invalidUUID };
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject empty workshop_id", () => {
      const data = { ...validData, workshop_id: "" };
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject null workshop_id", () => {
      const data = { ...validData, workshop_id: null };
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject undefined workshop_id", () => {
      const data = { ...validData, workshop_id: undefined };
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject invalid user_id format", () => {
      const data = { ...validData, user_id: invalidUUID };
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject empty user_id", () => {
      const data = { ...validData, user_id: "" };
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject null user_id", () => {
      const data = { ...validData, user_id: null };
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject undefined user_id", () => {
      const data = { ...validData, user_id: undefined };
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should accept minimum valid name length", () => {
      const data = { ...validData, name: "Ab" };
      expect(() => createTallerManagerSchema.parse(data)).not.toThrow();
    });

    it("should accept maximum valid name length", () => {
      const data = { ...validData, name: "A".repeat(150) };
      expect(() => createTallerManagerSchema.parse(data)).not.toThrow();
    });

    it("should reject empty name", () => {
      const data = { ...validData, name: "" };
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject null name", () => {
      const data = { ...validData, name: null };
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject undefined name", () => {
      const data = { ...validData, name: undefined };
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject non-string name", () => {
      const data = { ...validData, name: 12345 };
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should accept valid email formats", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "firstname+lastname@company.org",
        "admin@subdomain.example.com",
      ];
      validEmails.forEach((email) => {
        const data = { ...validData, email };
        expect(() => createTallerManagerSchema.parse(data)).not.toThrow();
      });
    });

    it("should reject invalid email formats", () => {
      const invalidEmails = [
        "invalid-email",
        "@domain.com",
        "user@",
        "user@@domain.com",
        "user.domain.com",
        "",
      ];
      invalidEmails.forEach((email) => {
        const data = { ...validData, email };
        expect(() => createTallerManagerSchema.parse(data)).toThrow();
      });
    });

    it("should reject empty email", () => {
      const data = { ...validData, email: "" };
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject null email", () => {
      const data = { ...validData, email: null };
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject undefined email", () => {
      const data = { ...validData, email: undefined };
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should accept valid phone formats", () => {
      const validPhones = [
        "+34612345678",
        "612345678",
        "+1234567890",
        "1234567890123",
      ];
      validPhones.forEach((phone) => {
        const data = { ...validData, phone };
        expect(() => createTallerManagerSchema.parse(data)).not.toThrow();
      });
    });

    it("should reject phone too short", () => {
      const data = { ...validData, phone: "123456" };
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject phone too long", () => {
      const data = { ...validData, phone: "123456789012345678901" };
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject empty phone", () => {
      const data = { ...validData, phone: "" };
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject non-string phone", () => {
      const data = { ...validData, phone: 123456789 };
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should accept valid role strings", () => {
      const validRoles = [
        "Jefe de Taller",
        "Mecánico Senior",
        "Supervisor",
        "Coordinador",
        "Director Técnico",
      ];
      validRoles.forEach((role) => {
        const data = { ...validData, role };
        expect(() => createTallerManagerSchema.parse(data)).not.toThrow();
      });
    });

    it("should accept empty role", () => {
      const data = { ...validData, role: "" };
      expect(() => createTallerManagerSchema.parse(data)).not.toThrow();
    });

    it("should accept undefined role", () => {
      const data = { ...validData, role: undefined };
      expect(() => createTallerManagerSchema.parse(data)).not.toThrow();
    });

    it("should reject non-string role", () => {
      const data = { ...validData, role: 123 };
      expect(() => createTallerManagerSchema.parse(data)).toThrow();
    });

    it("should accept different valid UUID formats", () => {
      const validUUIDs = [
        "123e4567-e89b-12d3-a456-426614174000",
        "00000000-0000-0000-0000-000000000000",
        "ffffffff-ffff-ffff-ffff-ffffffffffff",
      ];
      validUUIDs.forEach((uuid) => {
        const data = { ...validData, workshop_id: uuid, user_id: uuid };
        expect(() => createTallerManagerSchema.parse(data)).not.toThrow();
      });
    });

    it("should reject malformed UUIDs", () => {
      const invalidUUIDs = [
        "123e4567-e89b-12d3-a456",
        "123e4567-e89b-12d3-a456-426614174000-extra",
        "123e4567e89b12d3a456426614174000",
        "not-a-uuid-at-all",
      ];
      invalidUUIDs.forEach((uuid) => {
        const data = { ...validData, workshop_id: uuid };
        expect(() => createTallerManagerSchema.parse(data)).toThrow();
      });
    });

    it("should handle complex name patterns", () => {
      const complexNames = [
        "José María García-López",
        "Ana Sofía Martínez de la Cruz",
        "Jean-Pierre Dubois",
        "María José O'Connor",
      ];
      complexNames.forEach((name) => {
        const data = { ...validData, name };
        expect(() => createTallerManagerSchema.parse(data)).not.toThrow();
      });
    });
  });

  describe("updateTallerManagerSchema", () => {
    const validData = {
      id: validUUID,
    };

    it("should validate with only id", () => {
      expect(() => updateTallerManagerSchema.parse(validData)).not.toThrow();
    });

    it("should validate with optional fields", () => {
      const data = {
        ...validData,
        name: "Pedro García",
        email: "pedro.garcia@taller.com",
        phone: "+34698765432",
        role: "Mecánico Senior",
      };
      expect(() => updateTallerManagerSchema.parse(data)).not.toThrow();
    });

    it("should reject missing id", () => {
      expect(() => updateTallerManagerSchema.parse({})).toThrow();
    });

    it("should reject invalid id format", () => {
      const data = { id: invalidUUID };
      expect(() => updateTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject empty id", () => {
      const data = { id: "" };
      expect(() => updateTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject null id", () => {
      const data = { id: null };
      expect(() => updateTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject undefined id", () => {
      const data = { id: undefined };
      expect(() => updateTallerManagerSchema.parse(data)).toThrow();
    });

    it("should validate with optional workshop_id", () => {
      const data = { ...validData, workshop_id: validUUID2 };
      expect(() => updateTallerManagerSchema.parse(data)).not.toThrow();
    });

    it("should reject invalid workshop_id format", () => {
      const data = { ...validData, workshop_id: invalidUUID };
      expect(() => updateTallerManagerSchema.parse(data)).toThrow();
    });

    it("should validate with optional user_id", () => {
      const data = { ...validData, user_id: validUUID2 };
      expect(() => updateTallerManagerSchema.parse(data)).not.toThrow();
    });

    it("should reject invalid user_id format", () => {
      const data = { ...validData, user_id: invalidUUID };
      expect(() => updateTallerManagerSchema.parse(data)).toThrow();
    });

    it("should validate with optional name", () => {
      const data = { ...validData, name: "Nuevo Nombre" };
      expect(() => updateTallerManagerSchema.parse(data)).not.toThrow();
    });

    it("should reject name too short in update", () => {
      const data = { ...validData, name: "A" };
      expect(() => updateTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject name too long in update", () => {
      const data = { ...validData, name: "A".repeat(151) };
      expect(() => updateTallerManagerSchema.parse(data)).toThrow();
    });

    it("should validate with optional email", () => {
      const data = { ...validData, email: "nuevo@email.com" };
      expect(() => updateTallerManagerSchema.parse(data)).not.toThrow();
    });

    it("should reject invalid email format in update", () => {
      const data = { ...validData, email: "invalid-email" };
      expect(() => updateTallerManagerSchema.parse(data)).toThrow();
    });

    it("should validate with optional phone", () => {
      const data = { ...validData, phone: "+34600123456" };
      expect(() => updateTallerManagerSchema.parse(data)).not.toThrow();
    });

    it("should reject invalid phone format in update", () => {
      const data = { ...validData, phone: "123" };
      expect(() => updateTallerManagerSchema.parse(data)).toThrow();
    });

    it("should validate with optional role", () => {
      const data = { ...validData, role: "Nuevo Rol" };
      expect(() => updateTallerManagerSchema.parse(data)).not.toThrow();
    });

    it("should accept empty role in update", () => {
      const data = { ...validData, role: "" };
      expect(() => updateTallerManagerSchema.parse(data)).not.toThrow();
    });

    it("should reject extra fields in strict mode", () => {
      const data = { ...validData, extra_field: "value" };
      expect(() => updateTallerManagerSchema.parse(data)).toThrow();
    });

    it("should validate partial updates", () => {
      const partialUpdates = [
        { id: validUUID, name: "Solo nombre" },
        { id: validUUID, email: "solo@email.com" },
        { id: validUUID, phone: "+34600000000" },
        { id: validUUID, role: "Solo rol" },
      ];
      partialUpdates.forEach((data) => {
        expect(() => updateTallerManagerSchema.parse(data)).not.toThrow();
      });
    });

    it("should validate complex field combinations", () => {
      const data = {
        id: validUUID,
        workshop_id: validUUID2,
        user_id: validUUID,
        name: "Nombre Completo",
        email: "completo@test.com",
        phone: "+34612345678",
        role: "Rol Completo",
      };
      expect(() => updateTallerManagerSchema.parse(data)).not.toThrow();
    });

    it("should validate different valid UUID formats", () => {
      const validUUIDs = [
        "123e4567-e89b-12d3-a456-426614174000",
        "00000000-0000-0000-0000-000000000000",
        "ffffffff-ffff-ffff-ffff-ffffffffffff",
      ];
      validUUIDs.forEach((uuid) => {
        const data = { id: uuid };
        expect(() => updateTallerManagerSchema.parse(data)).not.toThrow();
      });
    });

    it("should reject non-string id types", () => {
      const nonStringIds = [123, true, [], {}];
      nonStringIds.forEach((id) => {
        const data = { id };
        expect(() => updateTallerManagerSchema.parse(data)).toThrow();
      });
    });
  });

  describe("deleteTallerManagerSchema", () => {
    it("should validate correct id", () => {
      const data = { id: validUUID };
      expect(() => deleteTallerManagerSchema.parse(data)).not.toThrow();
    });

    it("should reject missing id", () => {
      expect(() => deleteTallerManagerSchema.parse({})).toThrow();
    });

    it("should reject extra fields in strict mode", () => {
      const data = { id: validUUID, extra: "field" };
      expect(() => deleteTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject invalid id format", () => {
      const data = { id: invalidUUID };
      expect(() => deleteTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject empty id", () => {
      const data = { id: "" };
      expect(() => deleteTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject null id", () => {
      const data = { id: null };
      expect(() => deleteTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject undefined id", () => {
      const data = { id: undefined };
      expect(() => deleteTallerManagerSchema.parse(data)).toThrow();
    });

    it("should validate different valid UUID formats", () => {
      const validUUIDs = [
        "123e4567-e89b-12d3-a456-426614174000",
        "00000000-0000-0000-0000-000000000000",
        "ffffffff-ffff-ffff-ffff-ffffffffffff",
        "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      ];
      validUUIDs.forEach((id) => {
        const data = { id };
        expect(() => deleteTallerManagerSchema.parse(data)).not.toThrow();
      });
    });

    it("should reject malformed UUIDs", () => {
      const invalidUUIDs = [
        "123e4567-e89b-12d3-a456",
        "123e4567-e89b-12d3-a456-426614174000-extra",
        "123e4567e89b12d3a456426614174000",
        "not-a-uuid-at-all",
      ];
      invalidUUIDs.forEach((id) => {
        const data = { id };
        expect(() => deleteTallerManagerSchema.parse(data)).toThrow();
      });
    });

    it("should reject non-string id types", () => {
      const nonStringIds = [123, true, [], {}];
      nonStringIds.forEach((id) => {
        const data = { id };
        expect(() => deleteTallerManagerSchema.parse(data)).toThrow();
      });
    });

    it("should reject multiple fields", () => {
      const data = { id: validUUID, name: "extra", email: "extra@test.com" };
      expect(() => deleteTallerManagerSchema.parse(data)).toThrow();
    });
  });

  describe("queryTallerManagerSchema", () => {
    it("should validate empty query", () => {
      expect(() => queryTallerManagerSchema.parse({})).not.toThrow();
    });

    it("should validate undefined query", () => {
      expect(() => queryTallerManagerSchema.parse(undefined)).not.toThrow();
    });

    it("should validate with workshop_id filter", () => {
      const data = { workshop_id: validUUID };
      expect(() => queryTallerManagerSchema.parse(data)).not.toThrow();
    });

    it("should validate with user_id filter", () => {
      const data = { user_id: validUUID2 };
      expect(() => queryTallerManagerSchema.parse(data)).not.toThrow();
    });

    it("should validate with both filters", () => {
      const data = {
        workshop_id: validUUID,
        user_id: validUUID2,
      };
      expect(() => queryTallerManagerSchema.parse(data)).not.toThrow();
    });

    it("should reject invalid workshop_id format", () => {
      const data = { workshop_id: invalidUUID };
      expect(() => queryTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject empty workshop_id", () => {
      const data = { workshop_id: "" };
      expect(() => queryTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject invalid user_id format", () => {
      const data = { user_id: invalidUUID };
      expect(() => queryTallerManagerSchema.parse(data)).toThrow();
    });

    it("should reject empty user_id", () => {
      const data = { user_id: "" };
      expect(() => queryTallerManagerSchema.parse(data)).toThrow();
    });

    it("should accept null values for optional fields", () => {
      const queries = [{ workshop_id: null }, { user_id: null }];
      queries.forEach((query) => {
        expect(() => queryTallerManagerSchema.parse(query)).toThrow();
      });
    });

    it("should accept undefined values for optional fields", () => {
      const query = {
        workshop_id: undefined,
        user_id: undefined,
      };
      expect(() => queryTallerManagerSchema.parse(query)).not.toThrow();
    });

    it("should validate different UUID formats for workshop_id", () => {
      const validUUIDs = [
        "123e4567-e89b-12d3-a456-426614174000",
        "00000000-0000-0000-0000-000000000000",
        "ffffffff-ffff-ffff-ffff-ffffffffffff",
      ];
      validUUIDs.forEach((workshop_id) => {
        const data = { workshop_id };
        expect(() => queryTallerManagerSchema.parse(data)).not.toThrow();
      });
    });

    it("should validate different UUID formats for user_id", () => {
      const validUUIDs = [
        "123e4567-e89b-12d3-a456-426614174000",
        "00000000-0000-0000-0000-000000000000",
        "ffffffff-ffff-ffff-ffff-ffffffffffff",
      ];
      validUUIDs.forEach((user_id) => {
        const data = { user_id };
        expect(() => queryTallerManagerSchema.parse(data)).not.toThrow();
      });
    });

    it("should handle complex query combinations", () => {
      const complexQueries = [
        { workshop_id: validUUID },
        { user_id: validUUID2 },
        { workshop_id: validUUID, user_id: validUUID2 },
      ];
      complexQueries.forEach((query) => {
        expect(() => queryTallerManagerSchema.parse(query)).not.toThrow();
      });
    });

    it("should ignore unknown fields gracefully", () => {
      const data = { workshop_id: validUUID, unknown_field: "value" };
      expect(() => queryTallerManagerSchema.parse(data)).not.toThrow();
    });

    it("should reject invalid UUID combinations", () => {
      const invalidCombinations = [
        { workshop_id: invalidUUID, user_id: validUUID },
        { workshop_id: validUUID, user_id: invalidUUID },
        { workshop_id: invalidUUID, user_id: invalidUUID },
      ];
      invalidCombinations.forEach((query) => {
        expect(() => queryTallerManagerSchema.parse(query)).toThrow();
      });
    });

    it("should reject non-string UUID values", () => {
      const nonStringValues = [123, true, [], {}];
      nonStringValues.forEach((value) => {
        const data = { workshop_id: value };
        expect(() => queryTallerManagerSchema.parse(data)).toThrow();
      });
    });
  });
});
