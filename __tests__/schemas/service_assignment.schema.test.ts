/**
 * Tests para service_assignment.schema.ts
 * Valida schemas Zod para ServiceAssignment CRUD
 */

import {
  createServiceAssignmentSchema,
  updateServiceAssignmentSchema,
  deleteServiceAssignmentSchema,
  queryServiceAssignmentSchema,
} from "@/api/schemas/service_assignment.schema";

describe("ServiceAssignment Schemas", () => {
  describe("createServiceAssignmentSchema", () => {
    it("should validate valid assignment data", () => {
      const validData = {
        service_id: "123e4567-e89b-12d3-a456-426614174000",
        service_point_id: "987fcdeb-51a2-43d7-8c9f-123456789abc",
        is_active: true,
        priority: 50,
        configuracion: { max_concurrent: 5 },
      };

      const result = createServiceAssignmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate minimal required data", () => {
      const minimalData = {
        service_id: "123e4567-e89b-12d3-a456-426614174000",
        service_point_id: "987fcdeb-51a2-43d7-8c9f-123456789abc",
      };

      const result = createServiceAssignmentSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.is_active).toBe(true); // default
        expect(result.data.priority).toBe(0); // default
        expect(result.data.configuracion).toEqual({}); // default
      }
    });

    it("should reject invalid service_id UUID", () => {
      const invalidData = {
        service_id: "not-a-uuid",
        service_point_id: "987fcdeb-51a2-43d7-8c9f-123456789abc",
      };

      const result = createServiceAssignmentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid service_point_id UUID", () => {
      const invalidData = {
        service_id: "123e4567-e89b-12d3-a456-426614174000",
        service_point_id: "invalid-uuid",
      };

      const result = createServiceAssignmentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject missing service_id", () => {
      const invalidData = {
        service_point_id: "987fcdeb-51a2-43d7-8c9f-123456789abc",
      };

      const result = createServiceAssignmentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject missing service_point_id", () => {
      const invalidData = {
        service_id: "123e4567-e89b-12d3-a456-426614174000",
      };

      const result = createServiceAssignmentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject priority below 0", () => {
      const invalidData = {
        service_id: "123e4567-e89b-12d3-a456-426614174000",
        service_point_id: "987fcdeb-51a2-43d7-8c9f-123456789abc",
        priority: -1,
      };

      const result = createServiceAssignmentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject priority above 100", () => {
      const invalidData = {
        service_id: "123e4567-e89b-12d3-a456-426614174000",
        service_point_id: "987fcdeb-51a2-43d7-8c9f-123456789abc",
        priority: 101,
      };

      const result = createServiceAssignmentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept priority 0", () => {
      const validData = {
        service_id: "123e4567-e89b-12d3-a456-426614174000",
        service_point_id: "987fcdeb-51a2-43d7-8c9f-123456789abc",
        priority: 0,
      };

      const result = createServiceAssignmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept priority 100", () => {
      const validData = {
        service_id: "123e4567-e89b-12d3-a456-426614174000",
        service_point_id: "987fcdeb-51a2-43d7-8c9f-123456789abc",
        priority: 100,
      };

      const result = createServiceAssignmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject non-integer priority", () => {
      const invalidData = {
        service_id: "123e4567-e89b-12d3-a456-426614174000",
        service_point_id: "987fcdeb-51a2-43d7-8c9f-123456789abc",
        priority: 50.5,
      };

      const result = createServiceAssignmentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid is_active type", () => {
      const invalidData = {
        service_id: "123e4567-e89b-12d3-a456-426614174000",
        service_point_id: "987fcdeb-51a2-43d7-8c9f-123456789abc",
        is_active: "yes",
      };

      const result = createServiceAssignmentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept valid configuracion object", () => {
      const validData = {
        service_id: "123e4567-e89b-12d3-a456-426614174000",
        service_point_id: "987fcdeb-51a2-43d7-8c9f-123456789abc",
        configuracion: {
          pricing_override: 1500,
          max_concurrent: 5,
          custom_field: "value",
        },
      };

      const result = createServiceAssignmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("updateServiceAssignmentSchema", () => {
    it("should validate valid update data", () => {
      const validData = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        priority: 75,
        is_active: false,
      };

      const result = updateServiceAssignmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject missing id", () => {
      const invalidData = {
        priority: 50,
      };

      const result = updateServiceAssignmentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid id UUID", () => {
      const invalidData = {
        id: "not-a-uuid",
        priority: 50,
      };

      const result = updateServiceAssignmentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject id-only update (no fields to update)", () => {
      const invalidData = {
        id: "123e4567-e89b-12d3-a456-426614174000",
      };

      const result = updateServiceAssignmentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept updating service_id", () => {
      const validData = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        service_id: "987fcdeb-51a2-43d7-8c9f-123456789abc",
      };

      const result = updateServiceAssignmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept updating service_point_id", () => {
      const validData = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        service_point_id: "987fcdeb-51a2-43d7-8c9f-123456789abc",
      };

      const result = updateServiceAssignmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept updating priority", () => {
      const validData = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        priority: 80,
      };

      const result = updateServiceAssignmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept updating configuracion", () => {
      const validData = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        configuracion: { new_field: "new_value" },
      };

      const result = updateServiceAssignmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid priority range in update", () => {
      const invalidData = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        priority: 150,
      };

      const result = updateServiceAssignmentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept multiple field updates", () => {
      const validData = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        priority: 90,
        is_active: true,
        configuracion: { updated: true },
      };

      const result = updateServiceAssignmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("deleteServiceAssignmentSchema", () => {
    it("should validate valid UUID id", () => {
      const validData = {
        id: "123e4567-e89b-12d3-a456-426614174000",
      };

      const result = deleteServiceAssignmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID", () => {
      const invalidData = {
        id: "not-a-uuid",
      };

      const result = deleteServiceAssignmentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject missing id", () => {
      const invalidData = {};

      const result = deleteServiceAssignmentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty string id", () => {
      const invalidData = {
        id: "",
      };

      const result = deleteServiceAssignmentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("queryServiceAssignmentSchema", () => {
    it("should validate empty query params", () => {
      const result = queryServiceAssignmentSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should validate service_id filter", () => {
      const validData = {
        service_id: "123e4567-e89b-12d3-a456-426614174000",
      };

      const result = queryServiceAssignmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate service_point_id filter", () => {
      const validData = {
        service_point_id: "987fcdeb-51a2-43d7-8c9f-123456789abc",
      };

      const result = queryServiceAssignmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should transform is_active string to boolean true", () => {
      const validData = {
        is_active: "true",
      };

      const result = queryServiceAssignmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.is_active).toBe(true);
      }
    });

    it("should transform is_active string to boolean false", () => {
      const validData = {
        is_active: "false",
      };

      const result = queryServiceAssignmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.is_active).toBe(false);
      }
    });

    it("should reject invalid is_active value", () => {
      const invalidData = {
        is_active: "yes",
      };

      const result = queryServiceAssignmentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should transform priority_min string to number", () => {
      const validData = {
        priority_min: "10",
      };

      const result = queryServiceAssignmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority_min).toBe(10);
      }
    });

    it("should transform priority_max string to number", () => {
      const validData = {
        priority_max: "90",
      };

      const result = queryServiceAssignmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority_max).toBe(90);
      }
    });

    it("should reject non-numeric priority_min", () => {
      const invalidData = {
        priority_min: "abc",
      };

      const result = queryServiceAssignmentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should transform page string to number", () => {
      const validData = {
        page: "2",
      };

      const result = queryServiceAssignmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
      }
    });

    it("should transform limit string to number", () => {
      const validData = {
        limit: "100",
      };

      const result = queryServiceAssignmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(100);
      }
    });

    it("should validate sort_by priority", () => {
      const validData = {
        sort_by: "priority",
      };

      const result = queryServiceAssignmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate sort_by created_at", () => {
      const validData = {
        sort_by: "created_at",
      };

      const result = queryServiceAssignmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate sort_by updated_at", () => {
      const validData = {
        sort_by: "updated_at",
      };

      const result = queryServiceAssignmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid sort_by value", () => {
      const invalidData = {
        sort_by: "invalid_field",
      };

      const result = queryServiceAssignmentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should validate sort_order asc", () => {
      const validData = {
        sort_order: "asc",
      };

      const result = queryServiceAssignmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate sort_order desc", () => {
      const validData = {
        sort_order: "desc",
      };

      const result = queryServiceAssignmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid sort_order", () => {
      const invalidData = {
        sort_order: "random",
      };

      const result = queryServiceAssignmentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should validate complete query with all params", () => {
      const validData = {
        service_id: "123e4567-e89b-12d3-a456-426614174000",
        service_point_id: "987fcdeb-51a2-43d7-8c9f-123456789abc",
        is_active: "true",
        priority_min: "10",
        priority_max: "90",
        page: "1",
        limit: "50",
        sort_by: "priority",
        sort_order: "desc",
      };

      const result = queryServiceAssignmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
