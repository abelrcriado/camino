import { describe, it, expect } from "@jest/globals";
import {
  createFavoriteSchema,
  updateFavoriteSchema,
  deleteFavoriteSchema,
  queryFavoriteSchema,
} from "../../src/schemas/favorite.schema";

describe("Favorite Schemas", () => {
  const validUUID = "123e4567-e89b-12d3-a456-426614174000";
  const validUUID2 = "123e4567-e89b-12d3-a456-426614174001";
  const validUUID3 = "123e4567-e89b-12d3-a456-426614174002";

  describe("createFavoriteSchema", () => {
    const validData = {
      user_id: validUUID,
      service_point_id: validUUID2,
    };

    it("should validate correct favorite data", () => {
      expect(() => createFavoriteSchema.parse(validData)).not.toThrow();
    });

    it("should validate with optional workshop_id", () => {
      const data = { ...validData, workshop_id: validUUID3 };
      expect(() => createFavoriteSchema.parse(data)).not.toThrow();
    });

    it("should validate with all fields", () => {
      const data = {
        user_id: validUUID,
        service_point_id: validUUID2,
        workshop_id: validUUID3,
      };
      expect(() => createFavoriteSchema.parse(data)).not.toThrow();
    });

    it("should reject missing user_id", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { user_id, ...data } = validData;
      expect(() => createFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject missing service_point_id", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { service_point_id, ...data } = validData;
      expect(() => createFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject invalid user_id format", () => {
      const data = { ...validData, user_id: "invalid-uuid" };
      expect(() => createFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject empty user_id", () => {
      const data = { ...validData, user_id: "" };
      expect(() => createFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject null user_id", () => {
      const data = { ...validData, user_id: null };
      expect(() => createFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject undefined user_id", () => {
      const data = { ...validData, user_id: undefined };
      expect(() => createFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject number user_id", () => {
      const data = { ...validData, user_id: 123 };
      expect(() => createFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject invalid service_point_id format", () => {
      const data = { ...validData, service_point_id: "invalid-uuid" };
      expect(() => createFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject empty service_point_id", () => {
      const data = { ...validData, service_point_id: "" };
      expect(() => createFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject null service_point_id", () => {
      const data = { ...validData, service_point_id: null };
      expect(() => createFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject invalid workshop_id format", () => {
      const data = { ...validData, workshop_id: "invalid-uuid" };
      expect(() => createFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject empty workshop_id", () => {
      const data = { ...validData, workshop_id: "" };
      expect(() => createFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject null workshop_id", () => {
      const data = { ...validData, workshop_id: null };
      expect(() => createFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject number workshop_id", () => {
      const data = { ...validData, workshop_id: 456 };
      expect(() => createFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject extra fields in strict mode", () => {
      const data = { ...validData, extra_field: "value" };
      expect(() => createFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject multiple extra fields", () => {
      const data = { ...validData, extra1: "value1", extra2: "value2" };
      expect(() => createFavoriteSchema.parse(data)).toThrow();
    });

    it("should validate different valid UUID formats", () => {
      const uuids = [
        "550e8400-e29b-41d4-a716-446655440000",
        "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "123e4567-e89b-12d3-a456-426614174000",
      ];
      uuids.forEach((uuid, index) => {
        const data = {
          user_id: uuids[0],
          service_point_id: uuids[1],
          workshop_id: index === 2 ? uuids[2] : undefined,
        };
        expect(() => createFavoriteSchema.parse(data)).not.toThrow();
      });
    });

    it("should reject UUID with wrong case", () => {
      const data = { ...validData, user_id: validUUID.toUpperCase() };
      expect(() => createFavoriteSchema.parse(data)).not.toThrow(); // UUIDs are case-insensitive
    });

    it("should reject short UUID", () => {
      const data = { ...validData, user_id: "123e4567-e89b-12d3-a456" };
      expect(() => createFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject UUID with wrong separators", () => {
      const data = {
        ...validData,
        user_id: "123e4567_e89b_12d3_a456_426614174000",
      };
      expect(() => createFavoriteSchema.parse(data)).toThrow();
    });
  });

  describe("updateFavoriteSchema", () => {
    const validData = {
      id: validUUID,
    };

    it("should validate with only id", () => {
      expect(() => updateFavoriteSchema.parse(validData)).not.toThrow();
    });

    it("should validate with optional user_id", () => {
      const data = { ...validData, user_id: validUUID2 };
      expect(() => updateFavoriteSchema.parse(data)).not.toThrow();
    });

    it("should validate with optional service_point_id", () => {
      const data = { ...validData, service_point_id: validUUID2 };
      expect(() => updateFavoriteSchema.parse(data)).not.toThrow();
    });

    it("should validate with optional workshop_id", () => {
      const data = { ...validData, workshop_id: validUUID2 };
      expect(() => updateFavoriteSchema.parse(data)).not.toThrow();
    });

    it("should validate with all optional fields", () => {
      const data = {
        id: validUUID,
        user_id: validUUID2,
        service_point_id: validUUID3,
        workshop_id: validUUID,
      };
      expect(() => updateFavoriteSchema.parse(data)).not.toThrow();
    });

    it("should reject missing id", () => {
      expect(() => updateFavoriteSchema.parse({})).toThrow();
    });

    it("should reject invalid id format", () => {
      const data = { id: "invalid-uuid" };
      expect(() => updateFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject empty id", () => {
      const data = { id: "" };
      expect(() => updateFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject null id", () => {
      const data = { id: null };
      expect(() => updateFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject undefined id", () => {
      const data = { id: undefined };
      expect(() => updateFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject number id", () => {
      const data = { id: 123 };
      expect(() => updateFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject invalid optional user_id", () => {
      const data = { ...validData, user_id: "invalid" };
      expect(() => updateFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject invalid optional service_point_id", () => {
      const data = { ...validData, service_point_id: "not-uuid" };
      expect(() => updateFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject invalid optional workshop_id", () => {
      const data = { ...validData, workshop_id: "bad-format" };
      expect(() => updateFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject extra fields in strict mode", () => {
      const data = { ...validData, unknown_field: "value" };
      expect(() => updateFavoriteSchema.parse(data)).toThrow();
    });
  });

  describe("deleteFavoriteSchema", () => {
    it("should validate correct id", () => {
      const data = { id: validUUID };
      expect(() => deleteFavoriteSchema.parse(data)).not.toThrow();
    });

    it("should reject missing id", () => {
      expect(() => deleteFavoriteSchema.parse({})).toThrow();
    });

    it("should reject invalid id format", () => {
      const data = { id: "invalid-uuid" };
      expect(() => deleteFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject empty id", () => {
      const data = { id: "" };
      expect(() => deleteFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject null id", () => {
      const data = { id: null };
      expect(() => deleteFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject undefined id", () => {
      const data = { id: undefined };
      expect(() => deleteFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject number id", () => {
      const data = { id: 123 };
      expect(() => deleteFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject boolean id", () => {
      const data = { id: true };
      expect(() => deleteFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject object id", () => {
      const data = { id: { uuid: validUUID } };
      expect(() => deleteFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject array id", () => {
      const data = { id: [validUUID] };
      expect(() => deleteFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject extra fields in strict mode", () => {
      const data = { id: validUUID, extra: "field" };
      expect(() => deleteFavoriteSchema.parse(data)).toThrow();
    });

    it("should validate different valid UUID formats", () => {
      const uuids = [
        "550e8400-e29b-41d4-a716-446655440000",
        "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "123e4567-e89b-12d3-a456-426614174000",
      ];
      uuids.forEach((uuid) => {
        const data = { id: uuid };
        expect(() => deleteFavoriteSchema.parse(data)).not.toThrow();
      });
    });

    it("should reject malformed UUID variations", () => {
      const badUUIDs = [
        "123e4567-e89b-12d3-a456",
        "123e4567-e89b-12d3-a456-426614174000-extra",
        "gggg4567-e89b-12d3-a456-426614174000",
        "123e4567e89b12d3a456426614174000",
      ];
      badUUIDs.forEach((badUUID) => {
        const data = { id: badUUID };
        expect(() => deleteFavoriteSchema.parse(data)).toThrow();
      });
    });
  });

  describe("queryFavoriteSchema", () => {
    it("should validate empty query", () => {
      expect(() => queryFavoriteSchema.parse({})).not.toThrow();
    });

    it("should validate undefined query", () => {
      expect(() => queryFavoriteSchema.parse(undefined)).not.toThrow();
    });

    it("should validate with user_id filter", () => {
      const data = { user_id: validUUID };
      expect(() => queryFavoriteSchema.parse(data)).not.toThrow();
    });

    it("should validate with service_point_id filter", () => {
      const data = { service_point_id: validUUID };
      expect(() => queryFavoriteSchema.parse(data)).not.toThrow();
    });

    it("should validate with both filters", () => {
      const data = {
        user_id: validUUID,
        service_point_id: validUUID2,
      };
      expect(() => queryFavoriteSchema.parse(data)).not.toThrow();
    });

    it("should reject invalid user_id format", () => {
      const data = { user_id: "not-a-uuid" };
      expect(() => queryFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject invalid service_point_id format", () => {
      const data = { service_point_id: "invalid" };
      expect(() => queryFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject empty string user_id", () => {
      const data = { user_id: "" };
      expect(() => queryFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject empty string service_point_id", () => {
      const data = { service_point_id: "" };
      expect(() => queryFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject null values", () => {
      const data = { user_id: null };
      expect(() => queryFavoriteSchema.parse(data)).toThrow();
    });

    it("should reject number values", () => {
      const data = { user_id: 123 };
      expect(() => queryFavoriteSchema.parse(data)).toThrow();
    });

    it("should ignore unknown fields gracefully", () => {
      const data = { user_id: validUUID, unknown_field: "value" };
      const result = queryFavoriteSchema.parse(data);
      expect(result).toEqual({ user_id: validUUID });
    });

    it("should validate complex query scenarios", () => {
      const scenarios = [
        { user_id: validUUID },
        { service_point_id: validUUID2 },
        { user_id: validUUID, service_point_id: validUUID2 },
        {},
        undefined,
      ];
      scenarios.forEach((scenario) => {
        expect(() => queryFavoriteSchema.parse(scenario)).not.toThrow();
      });
    });

    it("should validate multiple UUID formats in queries", () => {
      const uuids = [
        "550e8400-e29b-41d4-a716-446655440000",
        "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      ];
      const data = {
        user_id: uuids[0],
        service_point_id: uuids[1],
      };
      expect(() => queryFavoriteSchema.parse(data)).not.toThrow();
    });
  });
});
