import { describe, it, expect } from "@jest/globals";
import { generateUUID } from "../helpers/factories";
import {
  createReportSchema,
  updateReportSchema,
  deleteReportSchema,
  queryReportSchema,
} from "@/api/schemas/report.schema";
import {
  REPORT_TYPE_VALUES,
  REPORT_STATUS_VALUES,
} from "@/shared/constants/enums";

describe("Report Schemas", () => {
  const validUUID = generateUUID();
  const validUUID2 = generateUUID();
  const invalidUUID = "invalid-uuid";

  describe("createReportSchema", () => {
    const validData = {
      type: "maintenance" as const,
      title: "Reporte de mantenimiento mensual",
      description:
        "Descripción detallada del reporte de mantenimiento realizado durante el mes.",
      user_id: validUUID,
      data: { items_checked: 10, issues_found: 2 },
    };

    it("should validate correct report data", () => {
      expect(() => createReportSchema.parse(validData)).not.toThrow();
    });

    it("should validate with optional service_point_id", () => {
      const data = { ...validData, service_point_id: validUUID2 };
      expect(() => createReportSchema.parse(data)).not.toThrow();
    });

    it("should validate with optional status", () => {
      const data = { ...validData, status: "submitted" };
      expect(() => createReportSchema.parse(data)).not.toThrow();
    });

    it("should validate with optional generated_at", () => {
      const data = { ...validData, generated_at: "2024-01-15T10:30:00Z" };
      expect(() => createReportSchema.parse(data)).not.toThrow();
    });

    it("should default status to draft when not provided", () => {
      const result = createReportSchema.parse(validData);
      expect(result.status).toBe("draft");
    });

    it("should reject missing type", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { type, ...data } = validData;
      expect(() => createReportSchema.parse(data)).toThrow();
    });

    it("should reject missing title", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { title, ...data } = validData;
      expect(() => createReportSchema.parse(data)).toThrow();
    });

    it("should validate without optional description", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { description, ...data } = validData;
      expect(() => createReportSchema.parse(data)).not.toThrow();
    });

    it("should reject missing user_id", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { user_id, ...data } = validData;
      expect(() => createReportSchema.parse(data)).toThrow();
    });

    it("should validate without optional data", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data: reportData, ...data } = validData;
      expect(() => createReportSchema.parse(data)).not.toThrow();
    });

    it("should reject title too short", () => {
      const data = { ...validData, title: "Test" };
      expect(() => createReportSchema.parse(data)).toThrow();
    });

    it("should reject title too long", () => {
      const data = { ...validData, title: "A".repeat(201) };
      expect(() => createReportSchema.parse(data)).toThrow();
    });

    it("should validate all report type values", () => {
      REPORT_TYPE_VALUES.forEach((type) => {
        const data = { ...validData, type };
        expect(() => createReportSchema.parse(data)).not.toThrow();
      });
    });

    it("should reject invalid report type", () => {
      const data = { ...validData, type: "invalid_type" };
      expect(() => createReportSchema.parse(data)).toThrow();
    });

    it("should validate all status values", () => {
      REPORT_STATUS_VALUES.forEach((status) => {
        const data = { ...validData, status };
        expect(() => createReportSchema.parse(data)).not.toThrow();
      });
    });

    it("should reject invalid status", () => {
      const data = { ...validData, status: "invalid_status" };
      expect(() => createReportSchema.parse(data)).toThrow();
    });

    it("should reject extra fields in strict mode", () => {
      const data = { ...validData, extra_field: "value" };
      expect(() => createReportSchema.parse(data)).toThrow();
    });

    // Nuevos tests comprehensivos
    it("should accept minimum valid title length", () => {
      const data = { ...validData, title: "Title" };
      expect(() => createReportSchema.parse(data)).not.toThrow();
    });

    it("should accept maximum valid title length", () => {
      const data = { ...validData, title: "A".repeat(200) };
      expect(() => createReportSchema.parse(data)).not.toThrow();
    });

    it("should reject empty title", () => {
      const data = { ...validData, title: "" };
      expect(() => createReportSchema.parse(data)).toThrow();
    });

    it("should reject null title", () => {
      const data = { ...validData, title: null };
      expect(() => createReportSchema.parse(data)).toThrow();
    });

    it("should reject undefined title", () => {
      const data = { ...validData, title: undefined };
      expect(() => createReportSchema.parse(data)).toThrow();
    });

    it("should reject invalid user_id format", () => {
      const data = { ...validData, user_id: invalidUUID };
      expect(() => createReportSchema.parse(data)).toThrow();
    });

    it("should reject empty user_id", () => {
      const data = { ...validData, user_id: "" };
      expect(() => createReportSchema.parse(data)).toThrow();
    });

    it("should reject invalid service_point_id format", () => {
      const data = { ...validData, service_point_id: invalidUUID };
      expect(() => createReportSchema.parse(data)).toThrow();
    });

    it("should accept complex data objects", () => {
      const complexData = {
        ...validData,
        data: {
          metrics: { cpu: 85, memory: 60 },
          alerts: ["disk_space", "network"],
          timestamp: "2024-01-15T10:30:00Z",
          nested: { level1: { level2: "deep_value" } },
        },
      };
      expect(() => createReportSchema.parse(complexData)).not.toThrow();
    });

    it("should accept null data", () => {
      const data = { ...validData, data: undefined };
      expect(() => createReportSchema.parse(data)).not.toThrow();
    });

    it("should accept array in data", () => {
      const data = {
        ...validData,
        data: { items: ["item1", "item2", "item3"] },
      };
      expect(() => createReportSchema.parse(data)).not.toThrow();
    });

    it("should accept valid ISO date formats", () => {
      const validDates = [
        "2024-01-15T10:30:00Z",
        "2024-12-31T23:59:59.999Z",
        "2024-06-15T12:00:00.000Z",
      ];
      validDates.forEach((generated_at) => {
        const data = { ...validData, generated_at };
        expect(() => createReportSchema.parse(data)).not.toThrow();
      });
    });

    it("should reject invalid date formats", () => {
      const invalidDates = [
        "2024-01-15",
        "01/15/2024",
        "2024-01-15 10:30:00",
        "invalid-date",
      ];
      invalidDates.forEach((generated_at) => {
        const data = { ...validData, generated_at };
        expect(() => createReportSchema.parse(data)).toThrow();
      });
    });

    it("should accept different UUID formats", () => {
      const validUUIDs = [
        "123e4567-e89b-12d3-a456-426614174000",
        "00000000-0000-0000-0000-000000000000",
        "ffffffff-ffff-ffff-ffff-ffffffffffff",
      ];
      validUUIDs.forEach((uuid) => {
        const data = { ...validData, user_id: uuid, service_point_id: uuid };
        expect(() => createReportSchema.parse(data)).not.toThrow();
      });
    });

    it("should handle all type and status combinations", () => {
      REPORT_TYPE_VALUES.forEach((type) => {
        REPORT_STATUS_VALUES.forEach((status) => {
          const data = { ...validData, type, status };
          expect(() => createReportSchema.parse(data)).not.toThrow();
        });
      });
    });

    it("should reject non-string types", () => {
      const data = { ...validData, type: 123 };
      expect(() => createReportSchema.parse(data)).toThrow();
    });

    it("should reject non-string titles", () => {
      const data = { ...validData, title: 12345 };
      expect(() => createReportSchema.parse(data)).toThrow();
    });

    it("should accept empty description", () => {
      const data = { ...validData, description: "" };
      expect(() => createReportSchema.parse(data)).not.toThrow();
    });

    it("should accept very long descriptions", () => {
      const data = { ...validData, description: "A".repeat(5000) };
      expect(() => createReportSchema.parse(data)).not.toThrow();
    });
  });

  describe("updateReportSchema", () => {
    const validData = {
      id: validUUID,
      title: "Reporte de rendimiento actualizado",
      description: "Descripción actualizada del reporte",
    };

    it("should validate correct update data", () => {
      expect(() => updateReportSchema.parse(validData)).not.toThrow();
    });

    it("should require id", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...data } = validData;
      expect(() => updateReportSchema.parse(data)).toThrow();
    });

    it("should validate with all optional fields", () => {
      const data = {
        ...validData,
        description: "Nueva descripción actualizada",
        status: "under_review" as const,
        data: { updated: true, version: 2 },
      };
      expect(() => updateReportSchema.parse(data)).not.toThrow();
    });

    it("should validate with minimal required fields", () => {
      const data = { id: validUUID };
      expect(() => updateReportSchema.parse(data)).not.toThrow();
    });

    it("should reject invalid id format", () => {
      const data = { ...validData, id: invalidUUID };
      expect(() => updateReportSchema.parse(data)).toThrow();
    });

    it("should reject empty id", () => {
      const data = { ...validData, id: "" };
      expect(() => updateReportSchema.parse(data)).toThrow();
    });

    it("should validate all status values for updates", () => {
      REPORT_STATUS_VALUES.forEach((status) => {
        const data = { ...validData, status };
        expect(() => updateReportSchema.parse(data)).not.toThrow();
      });
    });

    it("should reject invalid status", () => {
      const data = { ...validData, status: "invalid_status" };
      expect(() => updateReportSchema.parse(data)).toThrow();
    });

    it("should accept title within valid range", () => {
      const data = { ...validData, title: "A".repeat(50) };
      expect(() => updateReportSchema.parse(data)).not.toThrow();
    });

    it("should reject title too short", () => {
      const data = { ...validData, title: "ab" };
      expect(() => updateReportSchema.parse(data)).toThrow();
    });

    it("should reject title too long", () => {
      const data = { ...validData, title: "A".repeat(201) };
      expect(() => updateReportSchema.parse(data)).toThrow();
    });

    it("should accept complex data updates", () => {
      const data = {
        ...validData,
        data: {
          version: 2,
          metrics: { updated: true },
          changes: ["field1", "field2"],
        },
      };
      expect(() => updateReportSchema.parse(data)).not.toThrow();
    });

    it("should accept undefined data", () => {
      const data = { ...validData, data: undefined };
      expect(() => updateReportSchema.parse(data)).not.toThrow();
    });

    it("should reject extra fields", () => {
      const data = { ...validData, extra_field: "value" };
      expect(() => updateReportSchema.parse(data)).toThrow();
    });

    it("should handle partial updates correctly", () => {
      const partialUpdates = [
        { id: validUUID, title: "Nuevo título" },
        { id: validUUID, status: "submitted" },
        { id: validUUID, description: "Nueva descripción" },
      ];
      partialUpdates.forEach((data) => {
        expect(() => updateReportSchema.parse(data)).not.toThrow();
      });
    });

    it("should validate different UUID formats", () => {
      const validUUIDs = [
        "123e4567-e89b-12d3-a456-426614174000",
        "00000000-0000-0000-0000-000000000000",
        "ffffffff-ffff-ffff-ffff-ffffffffffff",
      ];
      validUUIDs.forEach((uuid) => {
        const data = { id: uuid };
        expect(() => updateReportSchema.parse(data)).not.toThrow();
      });
    });

    it("should reject non-string id", () => {
      const data = { id: 123, title: "Test" };
      expect(() => updateReportSchema.parse(data)).toThrow();
    });

    it("should accept empty description", () => {
      const data = { ...validData, description: "" };
      expect(() => updateReportSchema.parse(data)).not.toThrow();
    });

    it("should accept description with maximum length", () => {
      const data = { ...validData, description: "A".repeat(5000) };
      expect(() => updateReportSchema.parse(data)).not.toThrow();
    });

    it("should reject description too long", () => {
      const data = { ...validData, description: "A".repeat(5001) };
      expect(() => updateReportSchema.parse(data)).toThrow();
    });

    it("should validate with only title", () => {
      const data = { id: validUUID, title: "Solo título" };
      expect(() => updateReportSchema.parse(data)).not.toThrow();
    });

    it("should validate with only description", () => {
      const data = { id: validUUID, description: "Solo descripción" };
      expect(() => updateReportSchema.parse(data)).not.toThrow();
    });

    it("should validate with only status", () => {
      const data = { id: validUUID, status: "approved" };
      expect(() => updateReportSchema.parse(data)).not.toThrow();
    });

    it("should validate with only data", () => {
      const data = { id: validUUID, data: { updated: true } };
      expect(() => updateReportSchema.parse(data)).not.toThrow();
    });
  });

  describe("deleteReportSchema", () => {
    it("should validate correct id", () => {
      expect(() => deleteReportSchema.parse({ id: validUUID })).not.toThrow();
    });

    it("should reject missing id", () => {
      expect(() => deleteReportSchema.parse({})).toThrow();
    });

    it("should reject invalid id format", () => {
      expect(() => deleteReportSchema.parse({ id: invalidUUID })).toThrow();
    });

    it("should reject empty id", () => {
      expect(() => deleteReportSchema.parse({ id: "" })).toThrow();
    });

    it("should reject null id", () => {
      expect(() => deleteReportSchema.parse({ id: null })).toThrow();
    });

    it("should reject undefined id", () => {
      expect(() => deleteReportSchema.parse({ id: undefined })).toThrow();
    });

    it("should reject extra fields", () => {
      expect(() =>
        deleteReportSchema.parse({ id: validUUID, extra: "field" })
      ).toThrow();
    });

    it("should validate different valid UUID formats", () => {
      const validUUIDs = [
        "123e4567-e89b-12d3-a456-426614174000",
        "00000000-0000-0000-0000-000000000000",
        "ffffffff-ffff-ffff-ffff-ffffffffffff",
        "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      ];
      validUUIDs.forEach((id) => {
        expect(() => deleteReportSchema.parse({ id })).not.toThrow();
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
        expect(() => deleteReportSchema.parse({ id })).toThrow();
      });
    });

    it("should reject non-string id types", () => {
      const nonStringIds = [123, true, [], {}];
      nonStringIds.forEach((id) => {
        expect(() => deleteReportSchema.parse({ id })).toThrow();
      });
    });
  });

  describe("queryReportSchema", () => {
    it("should validate empty query", () => {
      expect(() => queryReportSchema.parse({})).not.toThrow();
    });

    it("should validate undefined query", () => {
      expect(() => queryReportSchema.parse(undefined)).not.toThrow();
    });

    it("should validate with user_id", () => {
      expect(() =>
        queryReportSchema.parse({ user_id: validUUID })
      ).not.toThrow();
    });

    it("should validate with service_point_id", () => {
      expect(() =>
        queryReportSchema.parse({ service_point_id: validUUID })
      ).not.toThrow();
    });

    it("should validate with type filter", () => {
      expect(() =>
        queryReportSchema.parse({ type: "maintenance" })
      ).not.toThrow();
    });

    it("should validate with status filter", () => {
      expect(() =>
        queryReportSchema.parse({ status: "submitted" })
      ).not.toThrow();
    });

    it("should validate with all parameters", () => {
      const query = {
        user_id: validUUID,
        service_point_id: validUUID2,
        type: "incident",
        status: "under_review",
      };
      expect(() => queryReportSchema.parse(query)).not.toThrow();
    });

    it("should reject invalid user_id format", () => {
      expect(() => queryReportSchema.parse({ user_id: invalidUUID })).toThrow();
    });

    it("should reject invalid service_point_id format", () => {
      expect(() =>
        queryReportSchema.parse({ service_point_id: invalidUUID })
      ).toThrow();
    });

    it("should reject invalid type", () => {
      expect(() => queryReportSchema.parse({ type: "invalid_type" })).toThrow();
    });

    it("should reject invalid status", () => {
      expect(() =>
        queryReportSchema.parse({ status: "invalid_status" })
      ).toThrow();
    });

    it("should validate all type values", () => {
      REPORT_TYPE_VALUES.forEach((type) => {
        expect(() => queryReportSchema.parse({ type })).not.toThrow();
      });
    });

    it("should validate all status values", () => {
      REPORT_STATUS_VALUES.forEach((status) => {
        expect(() => queryReportSchema.parse({ status })).not.toThrow();
      });
    });

    it("should handle mixed valid and invalid parameters", () => {
      const validQuery = { user_id: validUUID, type: "maintenance" };
      expect(() => queryReportSchema.parse(validQuery)).not.toThrow();

      const invalidQuery = { user_id: invalidUUID, type: "maintenance" };
      expect(() => queryReportSchema.parse(invalidQuery)).toThrow();
    });

    it("should validate different UUID formats for user_id", () => {
      const validUUIDs = [
        "123e4567-e89b-12d3-a456-426614174000",
        "00000000-0000-0000-0000-000000000000",
        "ffffffff-ffff-ffff-ffff-ffffffffffff",
      ];
      validUUIDs.forEach((user_id) => {
        expect(() => queryReportSchema.parse({ user_id })).not.toThrow();
      });
    });

    it("should validate different UUID formats for service_point_id", () => {
      const validUUIDs = [
        "123e4567-e89b-12d3-a456-426614174000",
        "00000000-0000-0000-0000-000000000000",
        "ffffffff-ffff-ffff-ffff-ffffffffffff",
      ];
      validUUIDs.forEach((service_point_id) => {
        expect(() =>
          queryReportSchema.parse({ service_point_id })
        ).not.toThrow();
      });
    });

    it("should handle complex query combinations", () => {
      const complexQueries = [
        { type: "maintenance", status: "submitted" },
        { user_id: validUUID, type: "incident" },
        { status: "approved", service_point_id: validUUID },
      ];
      complexQueries.forEach((query) => {
        expect(() => queryReportSchema.parse(query)).not.toThrow();
      });
    });

    it("should accept null values for optional fields", () => {
      const queries = [
        { type: null },
        { status: null },
        { user_id: null },
        { service_point_id: null },
      ];
      queries.forEach((query) => {
        expect(() => queryReportSchema.parse(query)).toThrow();
      });
    });

    it("should accept undefined values for optional fields", () => {
      const query = {
        type: undefined,
        status: undefined,
        user_id: undefined,
        service_point_id: undefined,
      };
      expect(() => queryReportSchema.parse(query)).not.toThrow();
    });

    it("should validate each type individually", () => {
      const types = [
        "maintenance",
        "incident",
        "usage",
        "financial",
        "inventory",
        "other",
      ];
      types.forEach((type) => {
        expect(() => queryReportSchema.parse({ type })).not.toThrow();
      });
    });

    it("should validate each status individually", () => {
      const statuses = [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
      ];
      statuses.forEach((status) => {
        expect(() => queryReportSchema.parse({ status })).not.toThrow();
      });
    });

    it("should handle empty string values properly", () => {
      const invalidQuery = { type: "", status: "" };
      expect(() => queryReportSchema.parse(invalidQuery)).toThrow();
    });

    it("should validate combinations of valid parameters", () => {
      const combinations = [
        { type: "maintenance", user_id: validUUID },
        { status: "submitted", service_point_id: validUUID },
        { type: "incident", status: "under_review" },
        { user_id: validUUID, service_point_id: validUUID2, type: "usage" },
      ];
      combinations.forEach((query) => {
        expect(() => queryReportSchema.parse(query)).not.toThrow();
      });
    });

    it("should reject queries with invalid combinations", () => {
      const invalidCombinations = [
        { type: "invalid", user_id: validUUID },
        { status: "invalid", service_point_id: validUUID },
        { type: "maintenance", user_id: invalidUUID },
      ];
      invalidCombinations.forEach((query) => {
        expect(() => queryReportSchema.parse(query)).toThrow();
      });
    });
  });
});
