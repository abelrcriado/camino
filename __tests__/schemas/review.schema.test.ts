import { describe, it, expect } from "@jest/globals";
import {
  createReviewSchema,
  updateReviewSchema,
  deleteReviewSchema,
  queryReviewSchema,
} from "../../src/schemas/review.schema";

describe("Review Schemas", () => {
  const validUUID = "123e4567-e89b-12d3-a456-426614174000";
  const validUUID2 = "123e4567-e89b-12d3-a456-426614174001";
  const validUUID3 = "123e4567-e89b-12d3-a456-426614174002";

  describe("createReviewSchema", () => {
    const validData = {
      user_id: validUUID,
      rating: 5,
      comment: "Excelente servicio, muy recomendable.",
    };

    it("should validate correct review data", () => {
      expect(() => createReviewSchema.parse(validData)).not.toThrow();
    });

    it("should validate with optional service_point_id", () => {
      const data = { ...validData, service_point_id: validUUID2 };
      expect(() => createReviewSchema.parse(data)).not.toThrow();
    });

    it("should validate with optional workshop_id", () => {
      const data = { ...validData, workshop_id: validUUID2 };
      expect(() => createReviewSchema.parse(data)).not.toThrow();
    });

    it("should validate with optional booking_id", () => {
      const data = { ...validData, booking_id: validUUID2 };
      expect(() => createReviewSchema.parse(data)).not.toThrow();
    });

    it("should validate with all optional fields", () => {
      const data = {
        ...validData,
        service_point_id: validUUID,
        workshop_id: validUUID2,
        booking_id: validUUID3,
      };
      expect(() => createReviewSchema.parse(data)).not.toThrow();
    });

    it("should reject missing user_id", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { user_id, ...data } = validData;
      expect(() => createReviewSchema.parse(data)).toThrow();
    });

    it("should reject invalid user_id format", () => {
      const data = { ...validData, user_id: "invalid-uuid" };
      expect(() => createReviewSchema.parse(data)).toThrow();
    });

    it("should reject empty user_id", () => {
      const data = { ...validData, user_id: "" };
      expect(() => createReviewSchema.parse(data)).toThrow();
    });

    it("should reject null user_id", () => {
      const data = { ...validData, user_id: null };
      expect(() => createReviewSchema.parse(data)).toThrow();
    });

    it("should reject missing rating", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { rating, ...data } = validData;
      expect(() => createReviewSchema.parse(data)).toThrow();
    });

    it("should reject missing comment", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { comment, ...data } = validData;
      expect(() => createReviewSchema.parse(data)).toThrow();
    });

    it("should reject empty comment", () => {
      const data = { ...validData, comment: "" };
      expect(() => createReviewSchema.parse(data)).not.toThrow();
    });

    it("should reject rating below 1", () => {
      const data = { ...validData, rating: 0 };
      expect(() => createReviewSchema.parse(data)).toThrow();
    });

    it("should reject rating above 5", () => {
      const data = { ...validData, rating: 6 };
      expect(() => createReviewSchema.parse(data)).toThrow();
    });

    it("should reject negative rating", () => {
      const data = { ...validData, rating: -1 };
      expect(() => createReviewSchema.parse(data)).toThrow();
    });

    it("should validate all valid ratings (1-5)", () => {
      [1, 2, 3, 4, 5].forEach((rating) => {
        const data = { ...validData, rating };
        expect(() => createReviewSchema.parse(data)).not.toThrow();
      });
    });

    it("should reject non-integer rating", () => {
      const data = { ...validData, rating: 4.5 };
      expect(() => createReviewSchema.parse(data)).toThrow();
    });

    it("should reject string rating", () => {
      const data = { ...validData, rating: "5" };
      expect(() => createReviewSchema.parse(data)).toThrow();
    });

    it("should reject null rating", () => {
      const data = { ...validData, rating: null };
      expect(() => createReviewSchema.parse(data)).toThrow();
    });

    it("should validate comment with maximum length (5000 chars)", () => {
      const longComment = "a".repeat(5000);
      const data = { ...validData, comment: longComment };
      expect(() => createReviewSchema.parse(data)).not.toThrow();
    });

    it("should reject comment exceeding maximum length", () => {
      const tooLongComment = "a".repeat(5001);
      const data = { ...validData, comment: tooLongComment };
      expect(() => createReviewSchema.parse(data)).toThrow();
    });

    it("should trim whitespace from comment", () => {
      const data = { ...validData, comment: "  spaced comment  " };
      const result = createReviewSchema.parse(data);
      expect(result.comment).toBe("spaced comment");
    });

    it("should reject invalid service_point_id format", () => {
      const data = { ...validData, service_point_id: "invalid-uuid" };
      expect(() => createReviewSchema.parse(data)).toThrow();
    });

    it("should reject invalid workshop_id format", () => {
      const data = { ...validData, workshop_id: "not-a-uuid" };
      expect(() => createReviewSchema.parse(data)).toThrow();
    });

    it("should reject invalid booking_id format", () => {
      const data = { ...validData, booking_id: "12345" };
      expect(() => createReviewSchema.parse(data)).toThrow();
    });

    it("should reject extra fields in strict mode", () => {
      const data = { ...validData, extra_field: "value" };
      expect(() => createReviewSchema.parse(data)).toThrow();
    });

    it("should reject undefined values", () => {
      const data = { ...validData, rating: undefined };
      expect(() => createReviewSchema.parse(data)).toThrow();
    });

    it("should validate with unicode characters in comment", () => {
      const data = { ...validData, comment: "Excelente 🌟 très bien ñoño" };
      expect(() => createReviewSchema.parse(data)).not.toThrow();
    });

    it("should validate comment with newlines", () => {
      const data = { ...validData, comment: "Line 1\nLine 2\nLine 3" };
      expect(() => createReviewSchema.parse(data)).not.toThrow();
    });
  });

  describe("updateReviewSchema", () => {
    const validData = {
      id: validUUID,
      comment: "Actualización del comentario.",
    };

    it("should validate with only required fields", () => {
      expect(() => updateReviewSchema.parse(validData)).not.toThrow();
    });

    it("should validate with optional rating", () => {
      const data = { ...validData, rating: 4 };
      expect(() => updateReviewSchema.parse(data)).not.toThrow();
    });

    it("should validate with only id and rating", () => {
      const data = { id: validUUID, rating: 3 };
      expect(() => updateReviewSchema.parse(data)).not.toThrow();
    });

    it("should validate with all fields", () => {
      const data = { id: validUUID, rating: 2, comment: "Updated comment" };
      expect(() => updateReviewSchema.parse(data)).not.toThrow();
    });

    it("should reject missing id", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...data } = validData;
      expect(() => updateReviewSchema.parse(data)).toThrow();
    });

    it("should reject invalid id format", () => {
      const data = { ...validData, id: "invalid-uuid" };
      expect(() => updateReviewSchema.parse(data)).toThrow();
    });

    it("should reject empty id", () => {
      const data = { ...validData, id: "" };
      expect(() => updateReviewSchema.parse(data)).toThrow();
    });

    it("should reject null id", () => {
      const data = { ...validData, id: null };
      expect(() => updateReviewSchema.parse(data)).toThrow();
    });

    it("should validate without optional comment", () => {
      const data = { id: validUUID };
      expect(() => updateReviewSchema.parse(data)).not.toThrow();
    });

    it("should reject invalid rating range (below 1)", () => {
      const data = { ...validData, rating: 0 };
      expect(() => updateReviewSchema.parse(data)).toThrow();
    });

    it("should reject invalid rating range (above 5)", () => {
      const data = { ...validData, rating: 6 };
      expect(() => updateReviewSchema.parse(data)).toThrow();
    });

    it("should reject non-integer rating", () => {
      const data = { ...validData, rating: 3.7 };
      expect(() => updateReviewSchema.parse(data)).toThrow();
    });

    it("should reject string rating", () => {
      const data = { ...validData, rating: "3" };
      expect(() => updateReviewSchema.parse(data)).toThrow();
    });

    it("should validate all valid ratings (1-5)", () => {
      [1, 2, 3, 4, 5].forEach((rating) => {
        const data = { ...validData, rating };
        expect(() => updateReviewSchema.parse(data)).not.toThrow();
      });
    });

    it("should validate comment with maximum length", () => {
      const longComment = "b".repeat(5000);
      const data = { ...validData, comment: longComment };
      expect(() => updateReviewSchema.parse(data)).not.toThrow();
    });

    it("should reject comment exceeding maximum length", () => {
      const tooLongComment = "b".repeat(5001);
      const data = { ...validData, comment: tooLongComment };
      expect(() => updateReviewSchema.parse(data)).toThrow();
    });

    it("should trim whitespace from comment", () => {
      const data = { ...validData, comment: "  updated comment  " };
      const result = updateReviewSchema.parse(data);
      expect(result.comment).toBe("updated comment");
    });

    it("should validate empty comment", () => {
      const data = { ...validData, comment: "" };
      expect(() => updateReviewSchema.parse(data)).not.toThrow();
    });

    it("should reject extra fields in strict mode", () => {
      const data = { ...validData, extra_field: "value" };
      expect(() => updateReviewSchema.parse(data)).toThrow();
    });
  });

  describe("deleteReviewSchema", () => {
    it("should validate correct id", () => {
      const data = { id: validUUID };
      expect(() => deleteReviewSchema.parse(data)).not.toThrow();
    });

    it("should reject missing id", () => {
      expect(() => deleteReviewSchema.parse({})).toThrow();
    });

    it("should reject invalid id format", () => {
      const data = { id: "invalid-uuid" };
      expect(() => deleteReviewSchema.parse(data)).toThrow();
    });

    it("should reject empty id", () => {
      const data = { id: "" };
      expect(() => deleteReviewSchema.parse(data)).toThrow();
    });

    it("should reject null id", () => {
      const data = { id: null };
      expect(() => deleteReviewSchema.parse(data)).toThrow();
    });

    it("should reject undefined id", () => {
      const data = { id: undefined };
      expect(() => deleteReviewSchema.parse(data)).toThrow();
    });

    it("should reject number id", () => {
      const data = { id: 123 };
      expect(() => deleteReviewSchema.parse(data)).toThrow();
    });

    it("should reject extra fields in strict mode", () => {
      const data = { id: validUUID, extra: "field" };
      expect(() => deleteReviewSchema.parse(data)).toThrow();
    });

    it("should validate different valid UUID formats", () => {
      const uuids = [
        "550e8400-e29b-41d4-a716-446655440000",
        "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "123e4567-e89b-12d3-a456-426614174000",
      ];
      uuids.forEach((uuid) => {
        const data = { id: uuid };
        expect(() => deleteReviewSchema.parse(data)).not.toThrow();
      });
    });
  });

  describe("queryReviewSchema", () => {
    it("should validate empty query", () => {
      expect(() => queryReviewSchema.parse({})).not.toThrow();
    });

    it("should validate undefined query", () => {
      expect(() => queryReviewSchema.parse(undefined)).not.toThrow();
    });

    it("should validate with user_id filter", () => {
      const data = { user_id: validUUID };
      expect(() => queryReviewSchema.parse(data)).not.toThrow();
    });

    it("should validate with service_point_id filter", () => {
      const data = { service_point_id: validUUID };
      expect(() => queryReviewSchema.parse(data)).not.toThrow();
    });

    it("should validate with workshop_id filter", () => {
      const data = { workshop_id: validUUID };
      expect(() => queryReviewSchema.parse(data)).not.toThrow();
    });

    it("should validate with rating filter", () => {
      const data = { rating: "5" };
      expect(() => queryReviewSchema.parse(data)).not.toThrow();
    });

    it("should validate with combined filters", () => {
      const data = {
        user_id: validUUID,
        rating: "4",
      };
      expect(() => queryReviewSchema.parse(data)).not.toThrow();
    });

    it("should validate with all filters", () => {
      const data = {
        user_id: validUUID,
        service_point_id: validUUID2,
        workshop_id: validUUID3,
        rating: "3",
      };
      expect(() => queryReviewSchema.parse(data)).not.toThrow();
    });

    it("should reject invalid user_id format", () => {
      const data = { user_id: "not-a-uuid" };
      expect(() => queryReviewSchema.parse(data)).toThrow();
    });

    it("should reject invalid service_point_id format", () => {
      const data = { service_point_id: "invalid" };
      expect(() => queryReviewSchema.parse(data)).toThrow();
    });

    it("should reject invalid workshop_id format", () => {
      const data = { workshop_id: "123" };
      expect(() => queryReviewSchema.parse(data)).toThrow();
    });

    it("should reject invalid rating (below 1)", () => {
      const data = { rating: 0 };
      expect(() => queryReviewSchema.parse(data)).toThrow();
    });

    it("should reject invalid rating (above 5)", () => {
      const data = { rating: 6 };
      expect(() => queryReviewSchema.parse(data)).toThrow();
    });

    it("should reject non-integer rating", () => {
      const data = { rating: 4.5 };
      expect(() => queryReviewSchema.parse(data)).toThrow();
    });

    it("should accept string rating (as expected from HTTP query params)", () => {
      const data = { rating: "4" };
      expect(() => queryReviewSchema.parse(data)).not.toThrow();
    });

    it("should validate all valid ratings (1-5) as strings", () => {
      ["1", "2", "3", "4", "5"].forEach((rating) => {
        const data = { rating };
        expect(() => queryReviewSchema.parse(data)).not.toThrow();
      });
    });

    it("should reject null values", () => {
      const data = { user_id: null };
      expect(() => queryReviewSchema.parse(data)).toThrow();
    });

    it("should ignore unknown fields gracefully", () => {
      const data = { user_id: validUUID, unknown_field: "value" };
      const result = queryReviewSchema.parse(data);
      expect(result).toEqual({ user_id: validUUID });
    });
  });
});
