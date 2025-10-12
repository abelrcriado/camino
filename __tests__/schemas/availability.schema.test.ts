import { describe, it, expect } from "@jest/globals";
import {
  createOpeningHoursSchema,
  updateOpeningHoursSchema,
  deleteOpeningHoursSchema,
  createSpecialClosureSchema,
  updateSpecialClosureSchema,
  deleteSpecialClosureSchema,
  updateServiceAvailabilitySchema,
  queryCSPAvailabilitySchema,
  querySlotAvailabilitySchema,
  bulkCreateOpeningHoursSchema,
} from "@/schemas/availability.schema";

describe("Availability Schemas", () => {
  describe("createOpeningHoursSchema", () => {
    const validData = {
      csp_id: "550e8400-e29b-41d4-a716-446655440000",
      day_of_week: 1,
      open_time: "09:00:00",
      close_time: "18:00:00",
      is_closed: false,
    };

    it("should validate correct opening hours data", () => {
      expect(() => createOpeningHoursSchema.parse(validData)).not.toThrow();
    });

    it("should validate with is_closed true", () => {
      const data = { ...validData, is_closed: true };
      expect(() => createOpeningHoursSchema.parse(data)).not.toThrow();
    });

    it("should reject missing csp_id", () => {
      const data = { ...validData, csp_id: undefined };
      expect(() => createOpeningHoursSchema.parse(data)).toThrow();
    });

    it("should reject invalid csp_id format", () => {
      const data = { ...validData, csp_id: "invalid-uuid" };
      expect(() => createOpeningHoursSchema.parse(data)).toThrow();
    });

    it("should reject invalid day_of_week below range", () => {
      const data = { ...validData, day_of_week: -1 };
      expect(() => createOpeningHoursSchema.parse(data)).toThrow();
    });

    it("should reject invalid day_of_week above range", () => {
      const data = { ...validData, day_of_week: 7 };
      expect(() => createOpeningHoursSchema.parse(data)).toThrow();
    });

    it("should accept valid day_of_week range", () => {
      for (let day = 0; day <= 6; day++) {
        const data = { ...validData, day_of_week: day };
        expect(() => createOpeningHoursSchema.parse(data)).not.toThrow();
      }
    });

    it("should reject invalid open_time format", () => {
      const data = { ...validData, open_time: "25:00:00" };
      expect(() => createOpeningHoursSchema.parse(data)).toThrow();
    });

    it("should reject invalid close_time format", () => {
      const data = { ...validData, close_time: "9:00" };
      expect(() => createOpeningHoursSchema.parse(data)).toThrow();
    });

    it("should accept valid time formats", () => {
      const validTimes = ["00:00:00", "12:30:45", "23:59:59"];
      validTimes.forEach((time) => {
        const data = { ...validData, open_time: time, close_time: time };
        expect(() => createOpeningHoursSchema.parse(data)).not.toThrow();
      });
    });

    it("should reject extra fields in strict mode", () => {
      const data = { ...validData, extra_field: "value" };
      expect(() => createOpeningHoursSchema.parse(data)).toThrow();
    });

    it("should default is_closed to false", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { is_closed: _, ...dataWithoutClosed } = validData;
      const result = createOpeningHoursSchema.parse(dataWithoutClosed);
      expect(result.is_closed).toBe(false);
    });
  });

  describe("updateOpeningHoursSchema", () => {
    const validData = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      open_time: "10:00:00",
      close_time: "19:00:00",
      is_closed: true,
    };

    it("should validate with only id", () => {
      const data = { id: validData.id };
      expect(() => updateOpeningHoursSchema.parse(data)).not.toThrow();
    });

    it("should validate with optional fields", () => {
      expect(() => updateOpeningHoursSchema.parse(validData)).not.toThrow();
    });

    it("should reject missing id", () => {
      const data = { open_time: "10:00:00" };
      expect(() => updateOpeningHoursSchema.parse(data)).toThrow();
    });

    it("should reject invalid id format", () => {
      const data = { ...validData, id: "invalid-uuid" };
      expect(() => updateOpeningHoursSchema.parse(data)).toThrow();
    });

    it("should validate partial updates", () => {
      const data = { id: validData.id, is_closed: false };
      expect(() => updateOpeningHoursSchema.parse(data)).not.toThrow();
    });

    it("should reject invalid time formats in update", () => {
      const data = { id: validData.id, open_time: "invalid-time" };
      expect(() => updateOpeningHoursSchema.parse(data)).toThrow();
    });

    it("should reject extra fields in strict mode", () => {
      const data = { ...validData, extra_field: "value" };
      expect(() => updateOpeningHoursSchema.parse(data)).toThrow();
    });
  });

  describe("deleteOpeningHoursSchema", () => {
    it("should validate correct id", () => {
      const data = { id: "550e8400-e29b-41d4-a716-446655440000" };
      expect(() => deleteOpeningHoursSchema.parse(data)).not.toThrow();
    });

    it("should reject missing id", () => {
      expect(() => deleteOpeningHoursSchema.parse({})).toThrow();
    });

    it("should reject invalid id format", () => {
      const data = { id: "invalid-uuid" };
      expect(() => deleteOpeningHoursSchema.parse(data)).toThrow();
    });

    it("should reject extra fields in strict mode", () => {
      const data = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        extra: "field",
      };
      expect(() => deleteOpeningHoursSchema.parse(data)).toThrow();
    });
  });

  describe("createSpecialClosureSchema", () => {
    const validData = {
      csp_id: "550e8400-e29b-41d4-a716-446655440000",
      start_date: "2025-12-24",
      end_date: "2025-12-26",
      reason: "Christmas holiday",
    };

    it("should validate correct special closure data", () => {
      expect(() => createSpecialClosureSchema.parse(validData)).not.toThrow();
    });

    it("should reject missing csp_id", () => {
      const data = { ...validData, csp_id: undefined };
      expect(() => createSpecialClosureSchema.parse(data)).toThrow();
    });

    it("should reject invalid date format", () => {
      const data = { ...validData, start_date: "2025/12/24" };
      expect(() => createSpecialClosureSchema.parse(data)).toThrow();
    });

    it("should reject empty reason", () => {
      const data = { ...validData, reason: "" };
      expect(() => createSpecialClosureSchema.parse(data)).toThrow();
    });

    it("should reject reason too long", () => {
      const data = { ...validData, reason: "a".repeat(256) };
      expect(() => createSpecialClosureSchema.parse(data)).toThrow();
    });

    it("should accept maximum reason length", () => {
      const data = { ...validData, reason: "a".repeat(255) };
      expect(() => createSpecialClosureSchema.parse(data)).not.toThrow();
    });

    it("should validate various date formats", () => {
      const validDates = ["2025-01-01", "2025-12-31", "2026-02-28"];
      validDates.forEach((date) => {
        const data = { ...validData, start_date: date, end_date: date };
        expect(() => createSpecialClosureSchema.parse(data)).not.toThrow();
      });
    });

    it("should reject extra fields in strict mode", () => {
      const data = { ...validData, extra_field: "value" };
      expect(() => createSpecialClosureSchema.parse(data)).toThrow();
    });
  });

  describe("updateSpecialClosureSchema", () => {
    const validData = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      start_date: "2025-12-25",
      end_date: "2025-12-27",
      reason: "Extended holiday",
    };

    it("should validate with only id", () => {
      const data = { id: validData.id };
      expect(() => updateSpecialClosureSchema.parse(data)).not.toThrow();
    });

    it("should validate with optional fields", () => {
      expect(() => updateSpecialClosureSchema.parse(validData)).not.toThrow();
    });

    it("should reject missing id", () => {
      const data = { reason: "Holiday" };
      expect(() => updateSpecialClosureSchema.parse(data)).toThrow();
    });

    it("should validate partial updates", () => {
      const data = { id: validData.id, reason: "New reason" };
      expect(() => updateSpecialClosureSchema.parse(data)).not.toThrow();
    });

    it("should reject invalid date formats in update", () => {
      const data = { id: validData.id, start_date: "invalid-date" };
      expect(() => updateSpecialClosureSchema.parse(data)).toThrow();
    });
  });

  describe("deleteSpecialClosureSchema", () => {
    it("should validate correct id", () => {
      const data = { id: "550e8400-e29b-41d4-a716-446655440000" };
      expect(() => deleteSpecialClosureSchema.parse(data)).not.toThrow();
    });

    it("should reject missing id", () => {
      expect(() => deleteSpecialClosureSchema.parse({})).toThrow();
    });

    it("should reject invalid id format", () => {
      const data = { id: "invalid-uuid" };
      expect(() => deleteSpecialClosureSchema.parse(data)).toThrow();
    });
  });

  describe("updateServiceAvailabilitySchema", () => {
    const validData = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      is_available: false,
      available_slots: 5,
      next_available: "2025-10-15T10:00:00Z",
      unavailable_reason: "Maintenance",
    };

    it("should validate with only id", () => {
      const data = { id: validData.id };
      expect(() => updateServiceAvailabilitySchema.parse(data)).not.toThrow();
    });

    it("should validate with optional fields", () => {
      expect(() =>
        updateServiceAvailabilitySchema.parse(validData)
      ).not.toThrow();
    });

    it("should reject negative available_slots", () => {
      const data = { id: validData.id, available_slots: -1 };
      expect(() => updateServiceAvailabilitySchema.parse(data)).toThrow();
    });

    it("should accept zero available_slots", () => {
      const data = { id: validData.id, available_slots: 0 };
      expect(() => updateServiceAvailabilitySchema.parse(data)).not.toThrow();
    });

    it("should reject invalid datetime format", () => {
      const data = { id: validData.id, next_available: "invalid-datetime" };
      expect(() => updateServiceAvailabilitySchema.parse(data)).toThrow();
    });

    it("should reject unavailable_reason too long", () => {
      const data = { id: validData.id, unavailable_reason: "a".repeat(256) };
      expect(() => updateServiceAvailabilitySchema.parse(data)).toThrow();
    });
  });

  describe("queryCSPAvailabilitySchema", () => {
    it("should validate empty query", () => {
      expect(() => queryCSPAvailabilitySchema.parse({})).not.toThrow();
    });

    it("should validate with csp_id", () => {
      const data = { csp_id: "550e8400-e29b-41d4-a716-446655440000" };
      expect(() => queryCSPAvailabilitySchema.parse(data)).not.toThrow();
    });

    it("should validate with check_time", () => {
      const data = { check_time: "2025-10-15T10:00:00Z" };
      expect(() => queryCSPAvailabilitySchema.parse(data)).not.toThrow();
    });

    it("should validate with both parameters", () => {
      const data = {
        csp_id: "550e8400-e29b-41d4-a716-446655440000",
        check_time: "2025-10-15T10:00:00Z",
      };
      expect(() => queryCSPAvailabilitySchema.parse(data)).not.toThrow();
    });

    it("should reject invalid csp_id format", () => {
      const data = { csp_id: "invalid-uuid" };
      expect(() => queryCSPAvailabilitySchema.parse(data)).toThrow();
    });

    it("should reject invalid datetime format", () => {
      const data = { check_time: "invalid-datetime" };
      expect(() => queryCSPAvailabilitySchema.parse(data)).toThrow();
    });
  });

  describe("querySlotAvailabilitySchema", () => {
    const validData = {
      csp_id: "550e8400-e29b-41d4-a716-446655440000",
      service_type: "repair",
      slot_time: "2025-10-15T10:00:00Z",
      duration_minutes: 60,
    };

    it("should validate correct slot availability query", () => {
      expect(() => querySlotAvailabilitySchema.parse(validData)).not.toThrow();
    });

    it("should default duration_minutes to 60", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { duration_minutes: _, ...dataWithoutDuration } = validData;
      const result = querySlotAvailabilitySchema.parse(dataWithoutDuration);
      expect(result.duration_minutes).toBe(60);
    });

    it("should reject missing csp_id", () => {
      const data = { ...validData, csp_id: undefined };
      expect(() => querySlotAvailabilitySchema.parse(data)).toThrow();
    });

    it("should reject empty service_type", () => {
      const data = { ...validData, service_type: "" };
      expect(() => querySlotAvailabilitySchema.parse(data)).toThrow();
    });

    it("should reject invalid duration_minutes", () => {
      const data = { ...validData, duration_minutes: 0 };
      expect(() => querySlotAvailabilitySchema.parse(data)).toThrow();
    });

    it("should reject duration_minutes too large", () => {
      const data = { ...validData, duration_minutes: 1441 };
      expect(() => querySlotAvailabilitySchema.parse(data)).toThrow();
    });

    it("should accept maximum duration_minutes", () => {
      const data = { ...validData, duration_minutes: 1440 };
      expect(() => querySlotAvailabilitySchema.parse(data)).not.toThrow();
    });
  });

  describe("bulkCreateOpeningHoursSchema", () => {
    const validData = {
      csp_id: "550e8400-e29b-41d4-a716-446655440000",
      opening_hours: [
        {
          day_of_week: 1,
          open_time: "09:00:00",
          close_time: "18:00:00",
          is_closed: false,
        },
        {
          day_of_week: 0,
          open_time: "00:00:00",
          close_time: "00:00:00",
          is_closed: true,
        },
      ],
    };

    it("should validate correct bulk opening hours data", () => {
      expect(() => bulkCreateOpeningHoursSchema.parse(validData)).not.toThrow();
    });

    it("should reject empty opening_hours array", () => {
      const data = { ...validData, opening_hours: [] };
      expect(() => bulkCreateOpeningHoursSchema.parse(data)).toThrow();
    });

    it("should reject too many opening_hours", () => {
      const data = {
        ...validData,
        opening_hours: Array(8).fill(validData.opening_hours[0]),
      };
      expect(() => bulkCreateOpeningHoursSchema.parse(data)).toThrow();
    });

    it("should accept maximum opening_hours", () => {
      const data = {
        ...validData,
        opening_hours: Array(7)
          .fill(0)
          .map((_, i) => ({
            day_of_week: i,
            open_time: "09:00:00",
            close_time: "18:00:00",
            is_closed: false,
          })),
      };
      expect(() => bulkCreateOpeningHoursSchema.parse(data)).not.toThrow();
    });

    it("should reject invalid opening hours in array", () => {
      const data = {
        ...validData,
        opening_hours: [
          {
            day_of_week: 8, // Invalid day
            open_time: "09:00:00",
            close_time: "18:00:00",
            is_closed: false,
          },
        ],
      };
      expect(() => bulkCreateOpeningHoursSchema.parse(data)).toThrow();
    });

    it("should default is_closed to false in array items", () => {
      const data = {
        csp_id: validData.csp_id,
        opening_hours: [
          {
            day_of_week: 1,
            open_time: "09:00:00",
            close_time: "18:00:00",
            // is_closed omitted
          },
        ],
      };
      const result = bulkCreateOpeningHoursSchema.parse(data);
      expect(result.opening_hours[0].is_closed).toBe(false);
    });
  });
});
