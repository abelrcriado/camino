import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { AvailabilityService } from "@/services/availability.service";
import { AvailabilityRepository } from "@/repositories/availability.repository";
import { generateUUID } from "../helpers/factories";

type MockedFunction = ReturnType<typeof jest.fn>;

// Mock repository
const mockRepository = {
  isCSPOpenNow: jest.fn() as MockedFunction,
  getCSPAvailabilityStatus: jest.fn() as MockedFunction,
  getOpeningHoursForCSP: jest.fn() as MockedFunction,
  createOpeningHours: jest.fn() as MockedFunction,
  getSpecialClosuresForCSP: jest.fn() as MockedFunction,
  createSpecialClosure: jest.fn() as MockedFunction,
  deleteSpecialClosure: jest.fn() as MockedFunction,
  getServiceAvailability: jest.fn() as MockedFunction,
  updateServiceAvailability: jest.fn() as MockedFunction,
  checkSlotAvailability: jest.fn() as MockedFunction,
} as unknown as AvailabilityRepository;

describe("AvailabilityService", () => {
  let service: AvailabilityService;
  const testCSPId = generateUUID();

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AvailabilityService(mockRepository);
  });

  describe("isCSPOpen", () => {
    it("should return true when CSP is open", async () => {
      (mockRepository.isCSPOpenNow as jest.Mock).mockResolvedValue(true);

      const result = await service.isCSPOpen(testCSPId);

      expect(result).toBe(true);
      expect(mockRepository.isCSPOpenNow).toHaveBeenCalledWith(
        testCSPId,
        undefined
      );
    });

    it("should throw error for invalid UUID", async () => {
      await expect(service.isCSPOpen("invalid-uuid")).rejects.toThrow(
        "Invalid CSP ID format"
      );
    });
  });

  describe("getCSPAvailabilityStatus", () => {
    it("should return availability status", async () => {
      const mockStatus = {
        csp_id: testCSPId,
        csp_name: "CSP Santiago",
        is_open: true,
        current_status: "open" as const,
        opening_hours: [],
        services: [],
      };

      (mockRepository.getCSPAvailabilityStatus as jest.Mock).mockResolvedValue(
        mockStatus
      );

      const result = await service.getCSPAvailabilityStatus(testCSPId);

      expect(result).toEqual(mockStatus);
    });

    it("should throw error for invalid UUID", async () => {
      await expect(
        service.getCSPAvailabilityStatus("invalid-uuid")
      ).rejects.toThrow("Invalid CSP ID format");
    });
  });

  describe("getOpeningHours", () => {
    it("should return opening hours", async () => {
      const mockHours = [
        {
          day_of_week: 1,
          open_time: "09:00:00",
          close_time: "18:00:00",
          is_closed: false,
        },
      ];

      (mockRepository.getOpeningHoursForCSP as jest.Mock).mockResolvedValue(
        mockHours
      );

      const result = await service.getOpeningHours(testCSPId);

      expect(result).toEqual(mockHours);
    });
  });

  describe("setOpeningHours", () => {
    it("should set opening hours successfully", async () => {
      const inputHours = [
        {
          day_of_week: 1,
          open_time: "09:00:00",
          close_time: "18:00:00",
          is_closed: false,
        },
      ];

      (mockRepository.createOpeningHours as jest.Mock).mockResolvedValue(
        inputHours[0]
      );

      const result = await service.setOpeningHours(testCSPId, inputHours);

      expect(result).toHaveLength(1);
      expect(mockRepository.createOpeningHours).toHaveBeenCalledTimes(1);
    });

    it("should throw error for invalid day_of_week", async () => {
      const invalidHours = [
        {
          day_of_week: 7, // Invalid
          open_time: "09:00:00",
          close_time: "18:00:00",
          is_closed: false,
        },
      ];

      await expect(
        service.setOpeningHours(
          testCSPId,
          invalidHours
        )
      ).rejects.toThrow(
        "day_of_week must be between 0 (Sunday) and 6 (Saturday)"
      );
    });

    it("should throw error for invalid time format", async () => {
      const invalidHours = [
        {
          day_of_week: 1,
          open_time: "25:00:00", // Invalid
          close_time: "18:00:00",
          is_closed: false,
        },
      ];

      await expect(
        service.setOpeningHours(
          testCSPId,
          invalidHours
        )
      ).rejects.toThrow("Invalid open_time format");
    });

    it("should throw error when close_time is before open_time", async () => {
      const invalidHours = [
        {
          day_of_week: 1,
          open_time: "18:00:00",
          close_time: "09:00:00", // Before open_time
          is_closed: false,
        },
      ];

      await expect(
        service.setOpeningHours(
          testCSPId,
          invalidHours
        )
      ).rejects.toThrow("close_time must be after open_time");
    });

    it("should throw error for duplicate days", async () => {
      const duplicateHours = [
        {
          day_of_week: 1,
          open_time: "09:00:00",
          close_time: "18:00:00",
          is_closed: false,
        },
        {
          day_of_week: 1, // Duplicate
          open_time: "10:00:00",
          close_time: "19:00:00",
          is_closed: false,
        },
      ];

      await expect(
        service.setOpeningHours(
          testCSPId,
          duplicateHours
        )
      ).rejects.toThrow("Duplicate day_of_week values found");
    });
  });

  describe("getSpecialClosures", () => {
    it("should return special closures", async () => {
      const mockClosures = [
        {
          id: "123",
          csp_id: testCSPId,
          start_date: "2025-12-24",
          end_date: "2025-12-26",
          reason: "Christmas",
          created_at: "2025-10-01T00:00:00Z",
        },
      ];

      (mockRepository.getSpecialClosuresForCSP as jest.Mock).mockResolvedValue(
        mockClosures
      );

      const result = await service.getSpecialClosures(
        testCSPId
      );

      expect(result).toEqual(mockClosures);
    });

    it("should throw error when fromDate is after toDate", async () => {
      const fromDate = new Date("2025-12-31");
      const toDate = new Date("2025-12-01");

      await expect(
        service.getSpecialClosures(
          testCSPId,
          fromDate,
          toDate
        )
      ).rejects.toThrow("fromDate must be before toDate");
    });
  });

  describe("createSpecialClosure", () => {
    it("should create special closure successfully", async () => {
      const closure = {
        start_date: "2025-12-24",
        end_date: "2025-12-26",
        reason: "Christmas",
      };

      const mockResult = {
        id: "123",
        csp_id: testCSPId,
        ...closure,
        created_at: "2025-10-01T00:00:00Z",
      };

      (mockRepository.createSpecialClosure as jest.Mock).mockResolvedValue(
        mockResult
      );

      const result = await service.createSpecialClosure(
        testCSPId,
        closure
      );

      expect(result).toEqual(mockResult);
    });

    it("should throw error when start_date is after end_date", async () => {
      const invalidClosure = {
        start_date: "2025-12-26",
        end_date: "2025-12-24", // Before start
        reason: "Invalid",
      };

      await expect(
        service.createSpecialClosure(
          testCSPId,
          invalidClosure
        )
      ).rejects.toThrow("start_date must be before or equal to end_date");
    });
  });

  describe("deleteSpecialClosure", () => {
    it("should delete special closure successfully", async () => {
      (mockRepository.deleteSpecialClosure as jest.Mock).mockResolvedValue(
        undefined
      );

      await service.deleteSpecialClosure(
        testCSPId
      );

      expect(mockRepository.deleteSpecialClosure).toHaveBeenCalledWith(
        testCSPId
      );
    });

    it("should throw error for invalid UUID", async () => {
      await expect(
        service.deleteSpecialClosure("invalid-uuid")
      ).rejects.toThrow("Invalid closure ID format");
    });
  });

  describe("getServiceAvailability", () => {
    it("should return service availability", async () => {
      const mockServices = [
        {
          service_id: "456",
          service_name: "Bike Repair",
          service_type: "repair",
          is_available: true,
          available_slots: 5,
        },
      ];

      (mockRepository.getServiceAvailability as jest.Mock).mockResolvedValue(
        mockServices
      );

      const result = await service.getServiceAvailability(
        testCSPId
      );

      expect(result).toEqual(mockServices);
    });
  });

  describe("updateServiceAvailability", () => {
    it("should update service availability successfully", async () => {
      const serviceId = "456e4567-e89b-12d3-a456-426614174000";
      const mockResult = {
        service_id: serviceId,
        service_name: "Bike Repair",
        service_type: "repair",
        is_available: false,
        unavailable_reason: "Maintenance",
      };

      (mockRepository.updateServiceAvailability as jest.Mock).mockResolvedValue(
        mockResult
      );

      const result = await service.updateServiceAvailability(serviceId, {
        is_available: false,
        unavailable_reason: "Maintenance",
      });

      expect(result).toEqual(mockResult);
    });

    it("should throw error for negative available_slots", async () => {
      const serviceId = "456e4567-e89b-12d3-a456-426614174000";

      await expect(
        service.updateServiceAvailability(serviceId, {
          available_slots: -1,
        })
      ).rejects.toThrow("available_slots cannot be negative");
    });

    it("should throw error for invalid UUID", async () => {
      await expect(
        service.updateServiceAvailability("invalid-uuid", {
          is_available: false,
        })
      ).rejects.toThrow("Invalid service ID format");
    });
  });

  describe("checkSlotAvailability", () => {
    it("should return true when slot is available", async () => {
      (mockRepository.checkSlotAvailability as jest.Mock).mockResolvedValue(
        true
      );

      const result = await service.checkSlotAvailability(
        testCSPId,
        "repair",
        new Date("2025-10-15T10:00:00Z"),
        60
      );

      expect(result).toBe(true);
    });

    it("should throw error for invalid duration", async () => {
      await expect(
        service.checkSlotAvailability(
          testCSPId,
          "repair",
          new Date(),
          0 // Invalid
        )
      ).rejects.toThrow("Duration must be between 1 and 1440 minutes");
    });

    it("should throw error for empty service type", async () => {
      await expect(
        service.checkSlotAvailability(
          testCSPId,
          "", // Empty
          new Date(),
          60
        )
      ).rejects.toThrow("Service type is required");
    });
  });
});
