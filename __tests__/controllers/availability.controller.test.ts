import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { createRequest, createResponse } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import { AvailabilityController } from "@/controllers/availability.controller";
import { AvailabilityService } from "@/services/availability.service";

/* eslint-disable @typescript-eslint/no-explicit-any */

describe("AvailabilityController", () => {
  let controller: AvailabilityController;
  let mockService: jest.Mocked<AvailabilityService>;
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock service methods
    mockService = {
      getCSPAvailabilityStatus: jest.fn(),
      isCSPOpen: jest.fn(),
      getOpeningHours: jest.fn(),
      setOpeningHours: jest.fn(),
      getSpecialClosures: jest.fn(),
      createSpecialClosure: jest.fn(),
      deleteSpecialClosure: jest.fn(),
      getServiceAvailability: jest.fn(),
      updateServiceAvailability: jest.fn(),
      checkSlotAvailability: jest.fn(),
    } as any;

    controller = new AvailabilityController(mockService);

    mockReq = createRequest({
      method: "GET",
      url: "/api/availability",
    });

    mockRes = createResponse();
  });

  describe("GET requests", () => {
    it("should route GET requests", async () => {
      mockReq.query = { csp_id: "550e8400-e29b-41d4-a716-446655440000" };
      mockService.getCSPAvailabilityStatus.mockResolvedValue({
        csp_id: "550e8400-e29b-41d4-a716-446655440000",
        csp_name: "Test CSP",
        is_open: true,
        current_status: "open",
        opening_hours: [],
        services: [],
        special_closures: [],
      });

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.getCSPAvailabilityStatus).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440000",
        undefined
      );
      expect(mockRes.statusCode).toBe(200);
    });

    it("should handle CSP availability with check_time", async () => {
      const checkTime = "2025-10-15T10:00:00Z";
      mockReq.query = {
        csp_id: "550e8400-e29b-41d4-a716-446655440000",
        check_time: checkTime,
      };
      mockService.getCSPAvailabilityStatus.mockResolvedValue({
        csp_id: "550e8400-e29b-41d4-a716-446655440000",
        csp_name: "Test CSP",
        is_open: true,
        current_status: "open",
        opening_hours: [],
        services: [],
        special_closures: [],
      });

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.getCSPAvailabilityStatus).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440000",
        new Date(checkTime)
      );
      expect(mockRes.statusCode).toBe(200);
    });

    it("should return 400 when csp_id is missing", async () => {
      mockReq.query = {};

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.statusCode).toBe(400);
      const responseData = JSON.parse(mockRes._getData());
      expect(responseData.error).toBe(
        "csp_id parameter is required for availability queries"
      );
    });

    it("should return 400 for invalid query parameters", async () => {
      mockReq.query = {
        csp_id: "invalid-uuid",
        check_time: "invalid-datetime",
      };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.statusCode).toBe(400);
      const responseData = JSON.parse(mockRes._getData());
      expect(responseData.error).toBe("Parámetros de consulta inválidos");
    });
  });

  describe("POST requests", () => {
    beforeEach(() => {
      mockReq.method = "POST";
    });

    it("should create opening hours", async () => {
      mockReq.query = { type: "opening-hours" };
      mockReq.body = {
        csp_id: "550e8400-e29b-41d4-a716-446655440000",
        day_of_week: 1,
        open_time: "09:00:00",
        close_time: "18:00:00",
        is_closed: false,
      };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.statusCode).toBe(201);
      const responseData = JSON.parse(mockRes._getData());
      expect(responseData).toEqual([
        { message: "Opening hours created successfully" },
      ]);
    });

    it("should create special closure", async () => {
      mockReq.query = { type: "special-closure" };
      mockReq.body = {
        csp_id: "550e8400-e29b-41d4-a716-446655440000",
        start_date: "2025-12-24",
        end_date: "2025-12-26",
        reason: "Christmas holiday",
      };
      mockService.createSpecialClosure.mockResolvedValue({
        id: "closure-id",
        csp_id: "550e8400-e29b-41d4-a716-446655440000",
        start_date: "2025-12-24",
        end_date: "2025-12-26",
        reason: "Christmas holiday",
        created_at: new Date().toISOString(),
      });

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.createSpecialClosure).toHaveBeenCalled();
      expect(mockRes.statusCode).toBe(201);
    });

    it("should create bulk opening hours", async () => {
      mockReq.query = { type: "bulk-opening-hours" };
      mockReq.body = {
        csp_id: "550e8400-e29b-41d4-a716-446655440000",
        opening_hours: [
          {
            day_of_week: 1,
            open_time: "09:00:00",
            close_time: "18:00:00",
            is_closed: false,
          },
          {
            day_of_week: 2,
            open_time: "09:00:00",
            close_time: "18:00:00",
            is_closed: false,
          },
        ],
      };
      mockService.setOpeningHours.mockResolvedValue([]);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.setOpeningHours).toHaveBeenCalled();
      expect(mockRes.statusCode).toBe(201);
    });

    it("should return 400 when type is missing", async () => {
      mockReq.query = {};

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.statusCode).toBe(400);
      const responseData = JSON.parse(mockRes._getData());
      expect(responseData.error).toBe(
        "Type parameter required: opening-hours, special-closure, or bulk-opening-hours"
      );
    });

    it("should return 400 for invalid opening hours data", async () => {
      mockReq.query = { type: "opening-hours" };
      mockReq.body = {
        csp_id: "invalid-uuid",
        day_of_week: 8, // Invalid day
        open_time: "invalid-time",
        close_time: "18:00:00",
      };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.statusCode).toBe(400);
      const responseData = JSON.parse(mockRes._getData());
      expect(responseData.error).toBe("Errores de validación");
    });

    it("should return 400 for invalid special closure data", async () => {
      mockReq.query = { type: "special-closure" };
      mockReq.body = {
        csp_id: "invalid-uuid",
        start_date: "invalid-date",
        end_date: "2025-12-26",
        reason: "",
      };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.statusCode).toBe(400);
      const responseData = JSON.parse(mockRes._getData());
      expect(responseData.error).toBe("Errores de validación");
    });
  });

  describe("PUT requests", () => {
    beforeEach(() => {
      mockReq.method = "PUT";
    });

    it("should update service availability", async () => {
      mockReq.query = { type: "service-availability" };
      mockReq.body = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        is_available: false,
        available_slots: 0,
        unavailable_reason: "Maintenance",
      };
      mockService.updateServiceAvailability.mockResolvedValue({
        service_id: "550e8400-e29b-41d4-a716-446655440000",
        service_name: "Test Service",
        service_type: "repair",
        is_available: false,
        available_slots: 0,
        next_available: undefined,
        unavailable_reason: "Maintenance",
      });

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.updateServiceAvailability).toHaveBeenCalled();
      expect(mockRes.statusCode).toBe(200);
    });

    it("should update opening hours", async () => {
      mockReq.query = { type: "opening-hours" };
      mockReq.body = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        open_time: "10:00:00",
        close_time: "19:00:00",
      };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.statusCode).toBe(200);
      const responseData = JSON.parse(mockRes._getData());
      expect(responseData).toEqual([
        { message: "Opening hours updated successfully" },
      ]);
    });

    it("should update special closure", async () => {
      mockReq.query = { type: "special-closure" };
      mockReq.body = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        reason: "Extended holiday",
      };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.statusCode).toBe(200);
      const responseData = JSON.parse(mockRes._getData());
      expect(responseData).toEqual([
        { message: "Special closure updated successfully" },
      ]);
    });

    it("should return 400 when update type is missing", async () => {
      mockReq.query = {};

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.statusCode).toBe(400);
      const responseData = JSON.parse(mockRes._getData());
      expect(responseData.error).toBe(
        "Type parameter required: opening-hours, special-closure, or service-availability"
      );
    });

    it("should return 400 for invalid service availability data", async () => {
      mockReq.query = { type: "service-availability" };
      mockReq.body = {
        id: "invalid-uuid",
        available_slots: -1, // Invalid
      };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.statusCode).toBe(400);
      const responseData = JSON.parse(mockRes._getData());
      expect(responseData.error).toBe("Errores de validación");
    });
  });

  describe("DELETE requests", () => {
    beforeEach(() => {
      mockReq.method = "DELETE";
    });

    it("should delete special closure", async () => {
      mockReq.query = { type: "special-closure" };
      mockReq.body = {
        id: "550e8400-e29b-41d4-a716-446655440000",
      };
      mockService.deleteSpecialClosure.mockResolvedValue(undefined);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.deleteSpecialClosure).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440000"
      );
      expect(mockRes.statusCode).toBe(200);
      const responseData = JSON.parse(mockRes._getData());
      expect(responseData.message).toBe("Special closure deleted successfully");
    });

    it("should delete opening hours", async () => {
      mockReq.query = { type: "opening-hours" };
      mockReq.body = {
        id: "550e8400-e29b-41d4-a716-446655440000",
      };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.statusCode).toBe(200);
      const responseData = JSON.parse(mockRes._getData());
      expect(responseData.message).toBe("Opening hours deleted successfully");
    });

    it("should return 400 when delete type is missing", async () => {
      mockReq.query = {};

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.statusCode).toBe(400);
      const responseData = JSON.parse(mockRes._getData());
      expect(responseData.error).toBe(
        "Type parameter required: opening-hours or special-closure"
      );
    });

    it("should return 400 for invalid delete data", async () => {
      mockReq.query = { type: "special-closure" };
      mockReq.body = {
        id: "invalid-uuid",
      };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.statusCode).toBe(400);
      const responseData = JSON.parse(mockRes._getData());
      expect(responseData.error).toBe("Errores de validación");
    });
  });

  describe("Method not allowed", () => {
    it("should return 405 for unsupported methods", async () => {
      mockReq.method = "PATCH";

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.statusCode).toBe(405);
      const responseData = JSON.parse(mockRes._getData());
      expect(responseData.error).toBe("Method not allowed");
    });
  });

  describe("Error handling", () => {
    it("should handle errors", async () => {
      mockReq.query = { csp_id: "550e8400-e29b-41d4-a716-446655440000" };
      mockService.getCSPAvailabilityStatus.mockRejectedValue(
        new Error("DB error")
      );

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.statusCode).toBe(500);
      const responseData = JSON.parse(mockRes._getData());
      expect(responseData.error).toBe("Error interno del servidor");
    });
  });
});
