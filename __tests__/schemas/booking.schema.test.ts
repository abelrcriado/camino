/**
 * Tests para booking.schema.ts
 * Valida schemas Zod para operaciones CRUD de bookings
 */

import {
  createBookingSchema,
  updateBookingSchema,
  deleteBookingSchema,
  queryBookingSchema,
} from "../../src/schemas/booking.schema";
import { TestDataGenerators, SchemaDataGenerators } from "../helpers/test-data-generators";

describe("Booking Schemas", () => {
  describe("createBookingSchema", () => {
    // Helper function to generate valid booking data with correlated dates
    const generateValidBookingData = () => {
      const startTime = TestDataGenerators.futureDate();
      const startDate = new Date(startTime);
      const endDate = new Date(startDate.getTime() + 3600000); // +1 hour
      const endTime = endDate.toISOString();

      return {
        user_id: SchemaDataGenerators.booking.userId(),
        service_point_id: SchemaDataGenerators.booking.servicePointId(),
        workshop_id: SchemaDataGenerators.booking.workshopId(),
        service_type: SchemaDataGenerators.booking.serviceType(),
        start_time: startTime,
        end_time: endTime,
      };
    };

    it("should validate correct booking data", () => {
      const validData = generateValidBookingData();
      const result = createBookingSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept optional status and default to pending", () => {
      const validData = generateValidBookingData();
      const result = createBookingSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("pending");
      }
    });

    it("should accept explicit status", () => {
      const validData = generateValidBookingData();
      const data = { ...validData, status: "confirmed" as const };
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("confirmed");
      }
    });

    it("should reject missing user_id", () => {
      const validData = generateValidBookingData();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { user_id, ...data } = validData;
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid user_id UUID", () => {
      const validData = generateValidBookingData();
      const data = { ...validData, user_id: TestDataGenerators.alphanumeric(10) };
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("UUID");
      }
    });

    it("should reject missing both service_point_id and workshop_id", () => {
      const validData = generateValidBookingData();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { service_point_id, workshop_id, ...data } = validData;
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Debe especificar service_point_id o workshop_id"
        );
      }
    });

    it("should accept only service_point_id without workshop_id", () => {
      const validData = generateValidBookingData();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { workshop_id, ...data } = validData;
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept only workshop_id without service_point_id", () => {
      const validData = generateValidBookingData();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { service_point_id, ...data } = validData;
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject missing start_time", () => {
      const validData = generateValidBookingData();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { start_time, ...data } = validData;
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid start_time format", () => {
      const validData = generateValidBookingData();
      const data = { ...validData, start_time: "2025-10-20" };
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject missing end_time", () => {
      const validData = generateValidBookingData();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { end_time, ...data } = validData;
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject end_time before start_time", () => {
      const validData = generateValidBookingData();
      const data = {
        ...validData,
        start_time: "2025-10-20T11:00:00.000Z",
        end_time: "2025-10-20T10:00:00.000Z",
      };
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("posterior");
      }
    });

    it("should reject invalid status enum", () => {
      const validData = generateValidBookingData();
      const data = { ...validData, status: "invalid_status" };
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept all valid status values", () => {
      const statuses = [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "no_show",
      ];
      statuses.forEach((status) => {
        const validData = generateValidBookingData();
        const data = { ...validData, status };
        const result = createBookingSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should reject extra fields (strict mode)", () => {
      const validData = generateValidBookingData();
      const data = { ...validData, extra_field: "value" };
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("updateBookingSchema", () => {
    const validData = {
      id: SchemaDataGenerators.booking.id(),
      status: "confirmed" as const,
    };

    it("should validate correct update data", () => {
      const result = updateBookingSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should require id field", () => {
      const data = { status: "confirmed" };
      const result = updateBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid id UUID", () => {
      const data = { ...validData, id: TestDataGenerators.alphanumeric(10) };
      const result = updateBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept all optional fields", () => {
      const startTime = TestDataGenerators.futureDate();
      const startDate = new Date(startTime);
      const endDate = new Date(startDate.getTime() + 3600000); // Add 1 hour
      const endTime = endDate.toISOString();
      
      const data = {
        id: SchemaDataGenerators.booking.id(),
        user_id: SchemaDataGenerators.booking.userId(),
        service_point_id: SchemaDataGenerators.booking.servicePointId(),
        workshop_id: SchemaDataGenerators.booking.workshopId(),
        start_time: startTime,
        end_time: endTime,
        status: "confirmed" as const,
      };
      const result = updateBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject end_time before start_time when both provided", () => {
      const startTime = TestDataGenerators.futureDate();
      const endTime = TestDataGenerators.pastDate(); // Past date is earlier than future date
      const data = {
        id: SchemaDataGenerators.booking.id(),
        start_time: startTime,
        end_time: endTime,
      };
      const result = updateBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept start_time without end_time", () => {
      const data = {
        id: SchemaDataGenerators.booking.id(),
        start_time: SchemaDataGenerators.booking.startTime(),
      };
      const result = updateBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("deleteBookingSchema", () => {
    it("should validate correct delete data", () => {
      const data = { id: SchemaDataGenerators.booking.id() };
      const result = deleteBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject missing id", () => {
      const data = {};
      const result = deleteBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid id UUID", () => {
      const data = { id: TestDataGenerators.alphanumeric(10) };
      const result = deleteBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject extra fields", () => {
      const data = {
        id: SchemaDataGenerators.booking.id(),
        extra: "field",
      };
      const result = deleteBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("queryBookingSchema", () => {
    it("should validate empty query", () => {
      const result = queryBookingSchema.safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it("should validate query with page and limit", () => {
      const data = { page: "1", limit: "10" };
      const result = queryBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data?.page).toBe(1);
        expect(result.data?.limit).toBe(10);
      }
    });

    it("should transform page string to number", () => {
      const data = { page: "5" };
      const result = queryBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data?.page).toBe(5);
        expect(typeof result.data?.page).toBe("number");
      }
    });

    it("should reject invalid page format", () => {
      const data = { page: "abc" };
      const result = queryBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept user_id filter", () => {
      const data = { user_id: SchemaDataGenerators.booking.userId() };
      const result = queryBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept status filter", () => {
      const data = { status: SchemaDataGenerators.booking.status() };
      const result = queryBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept date filters", () => {
      const data = {
        start_date: SchemaDataGenerators.booking.startTime(),
        end_date: SchemaDataGenerators.booking.endTime(),
      };
      const result = queryBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept all filters combined", () => {
      const data = {
        page: "2",
        limit: "20",
        user_id: SchemaDataGenerators.booking.userId(),
        service_point_id: SchemaDataGenerators.booking.servicePointId(),
        workshop_id: SchemaDataGenerators.booking.workshopId(),
        status: SchemaDataGenerators.booking.status(),
        start_date: SchemaDataGenerators.booking.startTime(),
        end_date: SchemaDataGenerators.booking.endTime(),
      };
      const result = queryBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
