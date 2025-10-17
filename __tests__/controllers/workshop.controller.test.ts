import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { WorkshopController } from "@/api/controllers/workshop.controller";
import { WorkshopService } from "@/api/services/workshop.service";
import type { NextApiRequest, NextApiResponse } from "next";

describe("WorkshopController", () => {
  let controller: WorkshopController;
  let mockService: jest.Mocked<WorkshopService>;
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByServicePoint: jest.fn(),
      createWorkshop: jest.fn(),
      updateWorkshop: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<WorkshopService>;

    controller = new WorkshopController(mockService);

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
    it("should route GET requests", async () => {
      mockReq.method = "GET";
      mockService.findAll.mockResolvedValue({
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

      expect(mockService.findAll).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("should return 405 for unsupported methods", async () => {
      mockReq.method = "PATCH";

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(405);
    });
  });

  describe("GET - Find Workshops", () => {
    it("should filter by service_point_id", async () => {
      mockReq.method = "GET";
      mockReq.query = {
        service_point_id: "123e4567-e89b-12d3-a456-426614174000",
      };

      const mockWorkshops = [
        {
          id: "workshop-1",
          service_point_id: "123e4567-e89b-12d3-a456-426614174000",
          name: "Bike Repair",
          contact_phone: "+34 123 456 789",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
      ];
      mockService.findByServicePoint.mockResolvedValue(mockWorkshops);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.findByServicePoint).toHaveBeenCalledWith(
        "123e4567-e89b-12d3-a456-426614174000"
      );
    });
  });

  describe("POST - Create Workshop", () => {
    it("should create workshop with valid data", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        service_point_id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Expert Bike Workshop",
        contact_phone: "+34600123456",
      };

      const created = { id: "new", ...mockReq.body };
      mockService.createWorkshop.mockResolvedValue(created);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.createWorkshop).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it("should return 400 for invalid data", async () => {
      mockReq.method = "POST";
      mockReq.body = { name: "AB" }; // Too short

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe("PUT - Update Workshop", () => {
    it("should update workshop", async () => {
      mockReq.method = "PUT";
      mockReq.body = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Updated Name",
      };

      const updated = { ...mockReq.body };
      mockService.updateWorkshop.mockResolvedValue(updated);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.updateWorkshop).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("DELETE - Delete Workshop", () => {
    it("should delete workshop", async () => {
      mockReq.method = "DELETE";
      mockReq.body = { id: "123e4567-e89b-12d3-a456-426614174000" };

      mockService.delete.mockResolvedValue(undefined);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.delete).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(204);
    });
  });

  describe("Error Handling", () => {
    it("should handle errors", async () => {
      mockReq.method = "GET";
      mockService.findAll.mockRejectedValue(new Error("DB error"));

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
