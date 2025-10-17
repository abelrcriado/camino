/**
 * Tests para booking.schema.ts
 * Valida schemas Zod para operaciones CRUD de bookings
 */

import {
  createBookingSchema,
  updateBookingSchema,
  deleteBookingSchema,
  queryBookingSchema,
} from "@/api/schemas/booking.schema";
import { BookingFactory, generateUUID } from "../helpers/factories";

describe("Booking Schemas", () => {
  describe("createBookingSchema", () => {
    const validData = {
      user_id: generateUUID(),
      service_point_id: generateUUID(),
      workshop_id: generateUUID(),
      service_type: "maintenance",
      start_time: "2025-10-20T10:00:00.000Z",
      end_time: "2025-10-20T11:00:00.000Z",
    };

    it("should validate correct booking data", () => {
      const result = createBookingSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept optional status and default to pending", () => {
      const result = createBookingSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("pending");
      }
    });

    it("should accept explicit status", () => {
      const data = { ...validData, status: "confirmed" as const };
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("confirmed");
      }
    });

    it("should reject missing user_id", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { user_id, ...data } = validData;
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid user_id UUID", () => {
      const data = { ...validData, user_id: "invalid-uuid" };
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("UUID");
      }
    });

    it("should reject missing both service_point_id and workshop_id", () => {
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { workshop_id, ...data } = validData;
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept only workshop_id without service_point_id", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { service_point_id, ...data } = validData;
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject missing start_time", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { start_time, ...data } = validData;
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid start_time format", () => {
      const data = { ...validData, start_time: "2025-10-20" };
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject missing end_time", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { end_time, ...data } = validData;
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject end_time before start_time", () => {
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
        const data = { ...validData, status };
        const result = createBookingSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should reject extra fields (strict mode)", () => {
      const data = { ...validData, extra_field: "value" };
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("updateBookingSchema", () => {
    const validData = {
      id: generateUUID(),
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
      const data = { ...validData, id: "invalid-uuid" };
      const result = updateBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept all optional fields", () => {
      const bookingDto = BookingFactory.createDto();
      const data = {
        id: generateUUID(),
        user_id: bookingDto.user_id,
        service_point_id: bookingDto.service_point_id,
        workshop_id: bookingDto.workshop_id,
        start_time: bookingDto.start_time,
        end_time: bookingDto.end_time,
        status: "confirmed" as const,
      };
      const result = updateBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject end_time before start_time when both provided", () => {
      const data = {
        id: generateUUID(),
        start_time: "2025-10-20T11:00:00.000Z",
        end_time: "2025-10-20T10:00:00.000Z",
      };
      const result = updateBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept start_time without end_time", () => {
      const data = {
        id: generateUUID(),
        start_time: "2025-10-20T10:00:00.000Z",
      };
      const result = updateBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("deleteBookingSchema", () => {
    it("should validate correct delete data", () => {
      const data = { id: generateUUID() };
      const result = deleteBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject missing id", () => {
      const data = {};
      const result = deleteBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid id UUID", () => {
      const data = { id: "invalid-uuid" };
      const result = deleteBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject extra fields", () => {
      const data = {
        id: generateUUID(),
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
      const data = { user_id: generateUUID() };
      const result = queryBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept status filter", () => {
      const data = { status: "pending" };
      const result = queryBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept date filters", () => {
      const data = {
        start_date: "2025-10-20T00:00:00.000Z",
        end_date: "2025-10-21T00:00:00.000Z",
      };
      const result = queryBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept all filters combined", () => {
      const bookingDto = BookingFactory.createDto();
      const data = {
        page: "2",
        limit: "20",
        user_id: bookingDto.user_id,
        service_point_id: bookingDto.service_point_id,
        workshop_id: bookingDto.workshop_id,
        status: "confirmed" as const,
        start_date: bookingDto.start_time,
        end_date: bookingDto.end_time,
      };
      const result = queryBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
