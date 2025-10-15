/**
 * Tests para csp.schema.ts
 * Valida schemas Zod para operaciones CRUD de CSP (Camino Service Points)
 */

import { describe, it, expect } from "@jest/globals";
import {
  createCSPSchema,
  updateCSPSchema,
  deleteCSPSchema,
  queryCSPSchema,
} from "../../src/schemas/csp.schema";
import { CSP_TYPE_VALUES } from "../../src/constants/enums";
import { generateUUID } from "../helpers/factories";

describe("CSP Schemas", () => {
  describe("createCSPSchema", () => {
    const validData = {
      name: "Estación de Bicicletas Centro",
      latitude: 42.123456,
      longitude: -8.654321,
    };

    it("should validate correct CSP data", () => {
      const result = createCSPSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject name shorter than 3 characters", () => {
      const data = { ...validData, name: "AB" };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject name longer than 150 characters", () => {
      const data = { ...validData, name: "A".repeat(151) };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept name with exactly 3 characters", () => {
      const data = { ...validData, name: "ABC" };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept name with exactly 150 characters", () => {
      const data = { ...validData, name: "A".repeat(150) };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject missing name", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { name, ...data } = validData;
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject empty name", () => {
      const data = { ...validData, name: "" };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject null name", () => {
      const data = { ...validData, name: null };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject number name", () => {
      const data = { ...validData, name: 123 };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject missing latitude", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { latitude, ...data } = validData;
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject latitude out of range (above 90)", () => {
      const data = { ...validData, latitude: 91 };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject latitude out of range (below -90)", () => {
      const data = { ...validData, latitude: -91 };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject string latitude", () => {
      const data = { ...validData, latitude: "42.123" };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject null latitude", () => {
      const data = { ...validData, latitude: null };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject missing longitude", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { longitude, ...data } = validData;
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject longitude out of range (above 180)", () => {
      const data = { ...validData, longitude: 181 };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject longitude out of range (below -180)", () => {
      const data = { ...validData, longitude: -181 };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject string longitude", () => {
      const data = { ...validData, longitude: "-8.654" };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept valid latitude and longitude ranges", () => {
      const coords = [
        { latitude: -90, longitude: -180 },
        { latitude: 0, longitude: 0 },
        { latitude: 90, longitude: 180 },
        { latitude: 42.5, longitude: -8.5 },
      ];

      coords.forEach((coord) => {
        const data = { ...validData, ...coord };
        const result = createCSPSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should accept optional description", () => {
      const data = {
        ...validData,
        description: "Una estación de bicicletas en el centro",
      };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject description exceeding max length", () => {
      const data = { ...validData, description: "A".repeat(1001) };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept optional address", () => {
      const data = { ...validData, address: "Calle Principal 123" };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject address exceeding max length", () => {
      const data = { ...validData, address: "A".repeat(501) };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept optional city", () => {
      const data = { ...validData, city: "Santiago de Compostela" };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject city exceeding max length", () => {
      const data = { ...validData, city: "A".repeat(101) };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept valid country code", () => {
      const data = { ...validData, country: "ES" };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject invalid country code length (too long)", () => {
      const data = { ...validData, country: "ESP" };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid country code length (too short)", () => {
      const data = { ...validData, country: "E" };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept optional postal_code", () => {
      const data = { ...validData, postal_code: "15705" };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject postal_code exceeding max length", () => {
      const data = { ...validData, postal_code: "A".repeat(21) };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept all valid CSP types", () => {
      CSP_TYPE_VALUES.forEach((type) => {
        const data = { ...validData, type };
        const result = createCSPSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid CSP type", () => {
      const data = { ...validData, type: "invalid_type" };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept valid image_url", () => {
      const data = { ...validData, image_url: "https://example.com/image.jpg" };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject invalid image_url", () => {
      const data = { ...validData, image_url: "not-a-url" };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept valid contact_email", () => {
      const data = { ...validData, contact_email: "contact@example.com" };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject invalid contact_email", () => {
      const data = { ...validData, contact_email: "invalid-email" };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept optional contact_phone", () => {
      const data = { ...validData, contact_phone: "+34123456789" };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept optional opening_hours", () => {
      const data = { ...validData, opening_hours: "Lun-Vie: 9:00-18:00" };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject opening_hours exceeding max length", () => {
      const data = { ...validData, opening_hours: "A".repeat(501) };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject extra fields", () => {
      const data = { ...validData, extra_field: "value" };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept complex valid data with all optional fields", () => {
      const data = {
        name: "Estación Completa Test",
        description: "Descripción completa del punto de servicio",
        latitude: 42.5,
        longitude: -8.5,
        address: "Calle Test 123, Piso 2",
        city: "Santiago de Compostela",
        country: "ES",
        postal_code: "15701",
        type: "bike_station",
        image_url: "https://example.com/test-image.jpg",
        contact_email: "test@example.com",
        contact_phone: "+34123456789",
        opening_hours: "Lunes a Viernes: 8:00-20:00, Sábados: 9:00-14:00",
      };
      const result = createCSPSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("updateCSPSchema", () => {
    const validData = {
      id: generateUUID(),
    };

    it("should validate correct update data", () => {
      const result = updateCSPSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should require id field", () => {
      const data = { name: "Updated Name" };
      const result = updateCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid id UUID", () => {
      const data = { ...validData, id: "invalid-uuid" };
      const result = updateCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject empty id", () => {
      const data = { ...validData, id: "" };
      const result = updateCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject null id", () => {
      const data = { ...validData, id: null };
      const result = updateCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept partial updates with valid fields", () => {
      const updates = [
        { id: validData.id, name: "New Name" },
        { id: validData.id, latitude: 43.0 },
        { id: validData.id, type: "workshop" },
        { id: validData.id, city: "Lugo" },
      ];

      updates.forEach((update) => {
        const result = updateCSPSchema.safeParse(update);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid latitude in update", () => {
      const data = { ...validData, latitude: 91 };
      const result = updateCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid longitude in update", () => {
      const data = { ...validData, longitude: -181 };
      const result = updateCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept all optional fields", () => {
      const data = {
        id: generateUUID(),
        name: "Updated Name",
        description: "Updated description",
        latitude: 43.123456,
        longitude: -7.654321,
        address: "New Address 456",
        city: "Lugo",
        country: "ES",
        postal_code: "27001",
        type: "workshop",
        image_url: "https://example.com/new-image.jpg",
        contact_email: "new@example.com",
        contact_phone: "+34987654321",
        opening_hours: "Lun-Dom: 24h",
      };
      const result = updateCSPSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject extra fields in strict mode", () => {
      const data = { ...validData, extra_field: "value" };
      const result = updateCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("deleteCSPSchema", () => {
    it("should validate correct delete data", () => {
      const data = { id: generateUUID() };
      const result = deleteCSPSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject missing id", () => {
      const data = {};
      const result = deleteCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid id UUID", () => {
      const data = { id: "invalid-uuid" };
      const result = deleteCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject empty id", () => {
      const data = { id: "" };
      const result = deleteCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject null id", () => {
      const data = { id: null };
      const result = deleteCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject number id", () => {
      const data = { id: 123 };
      const result = deleteCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject extra fields", () => {
      const data = {
        id: generateUUID(),
        extra: "field",
      };
      const result = deleteCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should validate different valid UUID formats", () => {
      const uuids = [
        generateUUID(),
        "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        generateUUID(),
      ];
      uuids.forEach((uuid) => {
        const data = { id: uuid };
        const result = deleteCSPSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("queryCSPSchema", () => {
    it("should validate empty query", () => {
      const result = queryCSPSchema.safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it("should validate empty object query", () => {
      const result = queryCSPSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should accept type filter", () => {
      const data = { type: "workshop" };
      const result = queryCSPSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept city filter", () => {
      const data = { city: "Santiago de Compostela" };
      const result = queryCSPSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept country filter", () => {
      const data = { country: "ES" };
      const result = queryCSPSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept all filters combined", () => {
      const data = {
        type: "bike_station",
        city: "Santiago",
        country: "ES",
      };
      const result = queryCSPSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject invalid type values", () => {
      const data = { type: "invalid_type" };
      const result = queryCSPSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept all valid CSP types in queries", () => {
      CSP_TYPE_VALUES.forEach((type) => {
        const data = { type };
        const result = queryCSPSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should ignore unknown fields gracefully", () => {
      const data = { type: "workshop", unknown_field: "value" };
      const result = queryCSPSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ type: "workshop" });
      }
    });

    it("should handle undefined and empty values properly", () => {
      const scenarios = [
        undefined,
        {},
        { type: "workshop" },
        { city: "Santiago", country: "ES" },
      ];
      scenarios.forEach((scenario) => {
        const result = queryCSPSchema.safeParse(scenario);
        expect(result.success).toBe(true);
      });
    });

    it("should reject null values", () => {
      const result = queryCSPSchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });
});
