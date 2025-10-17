import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { AvailabilityRepository } from "@/api/repositories/availability.repository";
import { SupabaseClient } from "@supabase/supabase-js";
import { generateUUID } from "../helpers/factories";

type MockedFunction = ReturnType<typeof jest.fn>;

// Mock Supabase client
const mockSupabase = {
  rpc: jest.fn() as MockedFunction,
  from: jest.fn() as MockedFunction,
} as unknown as SupabaseClient;

describe("AvailabilityRepository", () => {
  let repository: AvailabilityRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new AvailabilityRepository(mockSupabase);
  });

  describe("isCSPOpenNow", () => {
    it("should return true when CSP is open", async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: true,
        error: null,
      });

      const result = await repository.isCSPOpenNow(
        "123e4567-e89b-12d3-a456-426614174000"
      );

      expect(mockSupabase.rpc).toHaveBeenCalledWith("is_csp_open_now", {
        p_csp_id: "123e4567-e89b-12d3-a456-426614174000",
        p_timestamp: expect.any(String),
      });
      expect(result).toBe(true);
    });

    it("should return false when CSP is closed", async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: false,
        error: null,
      });

      const result = await repository.isCSPOpenNow(
        "123e4567-e89b-12d3-a456-426614174000"
      );

      expect(result).toBe(false);
    });

    it("should throw error on database failure", async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      await expect(
        repository.isCSPOpenNow("123e4567-e89b-12d3-a456-426614174000")
      ).rejects.toThrow("Failed to check if CSP is open");
    });
  });

  describe("getOpeningHoursForCSP", () => {
    it("should return opening hours for a CSP", async () => {
      const mockData = [
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
      ];

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await repository.getOpeningHoursForCSP(
        "123e4567-e89b-12d3-a456-426614174000"
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        day_of_week: 1,
        open_time: "09:00:00",
        close_time: "18:00:00",
        is_closed: false,
      });
    });

    it("should throw error on database failure", async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      await expect(
        repository.getOpeningHoursForCSP("123e4567-e89b-12d3-a456-426614174000")
      ).rejects.toThrow("Failed to get opening hours");
    });
  });

  describe("createOpeningHours", () => {
    it("should create opening hours successfully", async () => {
      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: "123",
            csp_id: "123e4567-e89b-12d3-a456-426614174000",
            day_of_week: 1,
            open_time: "09:00:00",
            close_time: "18:00:00",
            is_closed: false,
          },
          error: null,
        }),
      };

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.createOpeningHours({
        csp_id: "123e4567-e89b-12d3-a456-426614174000",
        day_of_week: 1,
        open_time: "09:00:00",
        close_time: "18:00:00",
        is_closed: false,
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("opening_hours");
      expect(result.day_of_week).toBe(1);
      expect(result.is_closed).toBe(false);
    });

    it("should throw error on insert failure", async () => {
      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Insert failed" },
        }),
      };

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      await expect(
        repository.createOpeningHours({
          csp_id: "123e4567-e89b-12d3-a456-426614174000",
          day_of_week: 1,
          open_time: "09:00:00",
          close_time: "18:00:00",
        })
      ).rejects.toThrow("Failed to create opening hours");
    });
  });

  describe("getSpecialClosuresForCSP", () => {
    it("should return special closures for a CSP", async () => {
      const mockData = [
        {
          id: "123",
          csp_id: "123e4567-e89b-12d3-a456-426614174000",
          start_date: "2025-12-24",
          end_date: "2025-12-26",
          reason: "Christmas holiday",
          created_at: "2025-10-01T00:00:00Z",
        },
      ];

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await repository.getSpecialClosuresForCSP(
        "123e4567-e89b-12d3-a456-426614174000"
      );

      expect(result).toHaveLength(1);
      expect(result[0].reason).toBe("Christmas holiday");
    });
  });

  describe("createSpecialClosure", () => {
    it("should create special closure successfully", async () => {
      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: "123",
            csp_id: "123e4567-e89b-12d3-a456-426614174000",
            start_date: "2025-12-24",
            end_date: "2025-12-26",
            reason: "Holiday",
            created_at: "2025-10-01T00:00:00Z",
          },
          error: null,
        }),
      };

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.createSpecialClosure({
        csp_id: "123e4567-e89b-12d3-a456-426614174000",
        start_date: "2025-12-24",
        end_date: "2025-12-26",
        reason: "Holiday",
      });

      expect(result.reason).toBe("Holiday");
    });
  });

  describe("deleteSpecialClosure", () => {
    it("should delete special closure successfully", async () => {
      const mockChain = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      };

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      await repository.deleteSpecialClosure("123");

      expect(mockSupabase.from).toHaveBeenCalledWith("special_closures");
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith("id", "123");
    });

    it("should throw error on delete failure", async () => {
      const mockChain = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: { message: "Delete failed" },
        }),
      };

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      await expect(repository.deleteSpecialClosure("123")).rejects.toThrow(
        "Failed to delete special closure"
      );
    });
  });

  describe("getServiceAvailability", () => {
    it("should return service availability for a CSP", async () => {
      const mockData = [
        {
          service_id: "456",
          service_name: "Bike Repair",
          service_type: "repair",
          is_available: true,
          available_slots: 5,
          next_available: null,
          unavailable_reason: null,
        },
      ];

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await repository.getServiceAvailability(
        "123e4567-e89b-12d3-a456-426614174000"
      );

      expect(result).toHaveLength(1);
      expect(result[0].service_name).toBe("Bike Repair");
      expect(result[0].is_available).toBe(true);
    });
  });

  describe("updateServiceAvailability", () => {
    it("should update service availability successfully", async () => {
      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: "456",
            service_name: "Bike Repair",
            service_type: "repair",
            is_available: false,
            available_slots: 0,
            unavailable_reason: "Maintenance",
          },
          error: null,
        }),
      };

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.updateServiceAvailability("456", {
        is_available: false,
        unavailable_reason: "Maintenance",
      });

      expect(result.is_available).toBe(false);
      expect(result.unavailable_reason).toBe("Maintenance");
    });
  });

  describe("checkSlotAvailability", () => {
    it("should return true when slot is available", async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: true,
        error: null,
      });

      const result = await repository.checkSlotAvailability(
        "123e4567-e89b-12d3-a456-426614174000",
        "repair",
        new Date("2025-10-15T10:00:00Z"),
        60
      );

      expect(result).toBe(true);
    });

    it("should return false when slot is not available", async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: false,
        error: null,
      });

      const result = await repository.checkSlotAvailability(
        "123e4567-e89b-12d3-a456-426614174000",
        "repair",
        new Date("2025-10-15T10:00:00Z"),
        60
      );

      expect(result).toBe(false);
    });
  });
});
