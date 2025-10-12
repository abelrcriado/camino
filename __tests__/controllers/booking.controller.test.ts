import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { BookingController } from "../../src/controllers/booking.controller";
import { BookingService } from "../../src/services/booking.service";
import type { NextApiRequest, NextApiResponse } from "next";

describe("BookingController", () => {
  let controller: BookingController;
  let mockService: jest.Mocked<BookingService>;
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockService = {
      findAllBookings: jest.fn(),
      findById: jest.fn(),
      createBooking: jest.fn(),
      updateBooking: jest.fn(),
      delete: jest.fn(),
      cancelBooking: jest.fn(),
      confirmBooking: jest.fn(),
      completeBooking: jest.fn(),
      findActiveBookings: jest.fn(),
      findUpcomingBookings: jest.fn(),
      findByUserAndStatus: jest.fn(),
    } as unknown as jest.Mocked<BookingService>;

    controller = new BookingController(mockService);

    mockReq = {
      method: "GET",
      query: {},
      body: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    };
  });

  describe("handle - Method Routing", () => {
    it("should route GET requests to getAll", async () => {
      mockReq.method = "GET";
      mockService.findAllBookings.mockResolvedValue({
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
      });

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.findAllBookings).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("should return 405 for unsupported methods", async () => {
      mockReq.method = "PATCH";

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.setHeader).toHaveBeenCalledWith("Allow", [
        "GET",
        "POST",
        "PUT",
        "DELETE",
      ]);
      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Method PATCH Not Allowed",
      });
    });
  });

  describe("GET - Find Bookings", () => {
    it("should return paginated bookings with default pagination", async () => {
      mockReq.method = "GET";

      const mockBookings = [
        {
          id: "booking-1",
          user_id: "user-123",
          service_type: "repair",
          start_time: "2025-06-15T10:00:00Z",
          end_time: "2025-06-15T11:00:00Z",
          status: "pending",
        },
      ];

      mockService.findAllBookings.mockResolvedValue({
        data: mockBookings,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasMore: false,
        },
      });

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.findAllBookings).toHaveBeenCalledWith(
        {},
        { page: 1, limit: 10 }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: mockBookings,
        pagination: expect.any(Object),
      });
    });

    it("should apply filters correctly", async () => {
      mockReq.method = "GET";
      mockReq.query = {
        user_id: "user-123",
        status: "confirmed",
        service_type: "repair",
      };

      mockService.findAllBookings.mockResolvedValue({
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
      });

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.findAllBookings).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "user-123",
          status: "confirmed",
          service_type: "repair",
        }),
        expect.any(Object)
      );
    });

    it("should handle action=upcoming", async () => {
      mockReq.method = "GET";
      mockReq.query = { action: "upcoming", days: "14" };

      const mockUpcoming = [
        {
          id: "booking-1",
          user_id: "user-123",
          service_type: "repair",
          start_time: "2025-06-20T10:00:00Z",
          end_time: "2025-06-20T11:00:00Z",
          status: "confirmed",
        },
      ];

      mockService.findUpcomingBookings.mockResolvedValue(mockUpcoming);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.findUpcomingBookings).toHaveBeenCalledWith(14);
      expect(mockRes.json).toHaveBeenCalledWith({ data: mockUpcoming });
    });

    it("should handle action=active", async () => {
      mockReq.method = "GET";
      mockReq.query = { action: "active" };

      const mockActive = [
        {
          id: "booking-1",
          user_id: "user-123",
          service_type: "repair",
          start_time: "2025-06-15T10:00:00Z",
          end_time: "2025-06-15T11:00:00Z",
          status: "confirmed",
        },
      ];

      mockService.findActiveBookings.mockResolvedValue(mockActive);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.findActiveBookings).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({ data: mockActive });
    });

    it("should handle action=user-status", async () => {
      mockReq.method = "GET";
      mockReq.query = {
        action: "user-status",
        user_id: "user-123",
        status: "confirmed",
      };

      const mockBookings = [
        {
          id: "booking-1",
          user_id: "user-123",
          service_type: "repair",
          start_time: "2025-06-15T10:00:00Z",
          end_time: "2025-06-15T11:00:00Z",
          status: "confirmed",
        },
      ];

      mockService.findByUserAndStatus.mockResolvedValue(mockBookings);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.findByUserAndStatus).toHaveBeenCalledWith(
        "user-123",
        "confirmed"
      );
      expect(mockRes.json).toHaveBeenCalledWith({ data: mockBookings });
    });

    it("should set cache headers", async () => {
      mockReq.method = "GET";

      mockService.findAllBookings.mockResolvedValue({
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
      });

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "Cache-Control",
        "private, max-age=0, must-revalidate"
      );
    });
  });

  describe("POST - Create Booking", () => {
    it("should create booking with valid data", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        user_id: "123e4567-e89b-12d3-a456-426614174000",
        service_point_id: "223e4567-e89b-12d3-a456-426614174000",
        service_type: "repair",
        start_time: "2025-06-15T10:00:00Z",
        end_time: "2025-06-15T11:00:00Z",
        notes: "Brake adjustment",
      };

      const createdBooking = {
        id: "booking-123",
        ...mockReq.body,
        status: "pending",
        payment_status: "pending",
      };

      mockService.createBooking.mockResolvedValue(createdBooking);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.createBooking).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith([createdBooking]);
    });

    it("should return 400 for invalid UUID", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        user_id: "invalid-uuid",
        service_type: "repair",
        start_time: "2025-06-15T10:00:00Z",
        end_time: "2025-06-15T11:00:00Z",
      };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.createBooking).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Errores de validación",
        })
      );
    });

    it("should return 400 for invalid datetime format", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        user_id: "123e4567-e89b-12d3-a456-426614174000",
        service_type: "repair",
        start_time: "invalid-date",
        end_time: "2025-06-15T11:00:00Z",
      };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.createBooking).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 for invalid service_type", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        user_id: "123e4567-e89b-12d3-a456-426614174000",
        service_type: "invalid-type",
        start_time: "2025-06-15T10:00:00Z",
        end_time: "2025-06-15T11:00:00Z",
      };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.createBooking).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe("PUT - Update Booking", () => {
    it("should handle action=cancel", async () => {
      mockReq.method = "PUT";
      mockReq.query = { action: "cancel" };
      mockReq.body = { id: "123e4567-e89b-12d3-a456-426614174000" };

      const cancelledBooking = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        status: "cancelled",
      };

      mockService.cancelBooking.mockResolvedValue(cancelledBooking);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.cancelBooking).toHaveBeenCalledWith(
        "123e4567-e89b-12d3-a456-426614174000"
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith([cancelledBooking]);
    });

    it("should handle action=confirm", async () => {
      mockReq.method = "PUT";
      mockReq.query = { action: "confirm" };
      mockReq.body = { id: "123e4567-e89b-12d3-a456-426614174000" };

      const confirmedBooking = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        status: "confirmed",
      };

      mockService.confirmBooking.mockResolvedValue(confirmedBooking);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.confirmBooking).toHaveBeenCalledWith(
        "123e4567-e89b-12d3-a456-426614174000"
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("should handle action=complete with actual_cost", async () => {
      mockReq.method = "PUT";
      mockReq.query = { action: "complete" };
      mockReq.body = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        actual_cost: 35.5,
      };

      const completedBooking = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        status: "completed",
        actual_cost: 35.5,
      };

      mockService.completeBooking.mockResolvedValue(completedBooking);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.completeBooking).toHaveBeenCalledWith(
        "123e4567-e89b-12d3-a456-426614174000",
        35.5
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("should update booking normally without action", async () => {
      mockReq.method = "PUT";
      mockReq.body = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        notes: "Updated notes",
      };

      const updatedBooking = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        notes: "Updated notes",
      };

      mockService.updateBooking.mockResolvedValue(updatedBooking);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.updateBooking).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("should return 400 when id is missing", async () => {
      mockReq.method = "PUT";
      mockReq.body = { notes: "Updated notes" };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Errores de validación",
        details: [{ message: "Booking ID is required" }],
      });
    });

    it("should return 400 for invalid UUID", async () => {
      mockReq.method = "PUT";
      mockReq.body = { id: "invalid-uuid", notes: "Updated" };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Errores de validación",
        details: [{ message: "Invalid UUID format" }],
      });
    });
  });

  describe("DELETE - Delete Booking", () => {
    it("should delete booking with valid id", async () => {
      mockReq.method = "DELETE";
      mockReq.body = { id: "123e4567-e89b-12d3-a456-426614174000" };

      mockService.delete.mockResolvedValue(undefined);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.delete).toHaveBeenCalledWith(
        "123e4567-e89b-12d3-a456-426614174000"
      );
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.end).toHaveBeenCalled();
    });

    it("should return 400 when id is missing", async () => {
      mockReq.method = "DELETE";
      mockReq.body = {};

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.delete).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 for invalid UUID", async () => {
      mockReq.method = "DELETE";
      mockReq.body = { id: "invalid-uuid" };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.delete).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe("Error Handling", () => {
    it("should return 404 when booking not found", async () => {
      mockReq.method = "GET";
      mockReq.query = { action: "active" };

      mockService.findActiveBookings.mockRejectedValue(
        new Error("Booking not found")
      );

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Booking not found",
      });
    });

    it("should return 400 for validation errors from service", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        user_id: "123e4567-e89b-12d3-a456-426614174000",
        service_type: "repair",
        start_time: "2025-06-15T12:00:00Z",
        end_time: "2025-06-15T10:00:00Z",
      };

      mockService.createBooking.mockRejectedValue(
        new Error("Start time must be before end time")
      );

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
        })
      );
    });

    it("should return 500 for unexpected errors", async () => {
      mockReq.method = "GET";

      mockService.findAllBookings.mockRejectedValue(
        new Error("Database connection failed")
      );

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });
  });
});
