import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { CSPController } from "../../src/controllers/csp.controller";
import { CSPService } from "../../src/services/csp.service";
import type { NextApiRequest, NextApiResponse } from "next";

describe("CSPController", () => {
  let controller: CSPController;
  let mockService: jest.Mocked<CSPService>;
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockService = {
      findAllCSPs: jest.fn(),
      findById: jest.fn(),
      createCSP: jest.fn(),
      updateCSP: jest.fn(),
      deleteCSP: jest.fn(),
      findByLocation: jest.fn(),
    } as unknown as jest.Mocked<CSPService>;

    controller = new CSPController(mockService);

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
      mockService.findAllCSPs.mockResolvedValue({
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

      expect(mockService.findAllCSPs).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("should return 405 for unsupported methods", async () => {
      mockReq.method = "PATCH";

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Method not allowed",
      });
    });
  });

  describe("GET - Find CSPs", () => {
    it("should return paginated CSPs with default pagination", async () => {
      mockReq.method = "GET";

      const mockCSPs = [
        {
          id: "csp-1",
          name: "Camino Bike Station",
          city: "Madrid",
          country: "Spain",
          status: "active",
        },
      ];

      mockService.findAllCSPs.mockResolvedValue({
        data: mockCSPs,
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

      expect(mockService.findAllCSPs).toHaveBeenCalledWith(
        {},
        { page: 1, limit: 10 }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: mockCSPs,
          pagination: expect.any(Object),
        })
      );
    });

    it("should apply filters correctly", async () => {
      mockReq.method = "GET";
      mockReq.query = {
        city: "Barcelona",
        country: "Spain",
        status: "active",
        type: "bike_station",
      };

      mockService.findAllCSPs.mockResolvedValue({
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

      expect(mockService.findAllCSPs).toHaveBeenCalledWith(
        expect.objectContaining({
          city: "Barcelona",
          country: "Spain",
          status: "active",
          type: "bike_station",
        }),
        expect.any(Object)
      );
    });

    it("should return 400 for invalid status", async () => {
      mockReq.method = "GET";
      mockReq.query = { status: "invalid-status" };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.findAllCSPs).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Invalid status value",
      });
    });

    it("should set cache headers", async () => {
      mockReq.method = "GET";

      mockService.findAllCSPs.mockResolvedValue({
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
        "public, s-maxage=300, stale-while-revalidate=600"
      );
    });
  });

  describe("POST - Create CSP", () => {
    it("should create CSP with valid data", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        name: "New Bike Station",
        description: "Full service bike station",
        city: "Valencia",
        country: "ES",
        latitude: 39.4699,
        longitude: -0.3763,
        address: "123 Main St",
        type: "bike_station",
        image_url: "https://example.com/station.jpg",
      };

      const createdCSP = {
        id: "csp-new",
        ...mockReq.body,
        status: "active",
      };

      mockService.createCSP.mockResolvedValue(createdCSP);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.createCSP).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(createdCSP);
    });

    it("should return 400 for invalid latitude", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        name: "Invalid CSP",
        city: "Madrid",
        country: "Spain",
        latitude: 91, // Invalid: > 90
        longitude: 0,
      };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.createCSP).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 for invalid longitude", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        name: "Invalid CSP",
        city: "Madrid",
        country: "Spain",
        latitude: 40,
        longitude: 181, // Invalid: > 180
      };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.createCSP).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 for invalid status", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        name: "New Bike Station",
        city: "Valencia",
        country: "Spain",
        latitude: 39.4699,
        longitude: -0.3763,
        status: "invalid-status",
      };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.createCSP).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe("PUT - Update CSP", () => {
    it("should update CSP with valid data", async () => {
      mockReq.method = "PUT";
      mockReq.body = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Updated Station",
      };

      const updatedCSP = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Updated Station",
        type: "bike_station",
        latitude: 40.4168,
        longitude: -3.7038,
        city: "Madrid",
        country: "ES",
      };

      mockService.updateCSP.mockResolvedValue(updatedCSP);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.updateCSP).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(updatedCSP);
    });

    it("should return 400 when id is missing", async () => {
      mockReq.method = "PUT";
      mockReq.body = { name: "Updated Station" };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.updateCSP).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 for invalid UUID", async () => {
      mockReq.method = "PUT";
      mockReq.body = {
        id: "invalid-uuid",
        name: "Updated Station",
      };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.updateCSP).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe("DELETE - Delete CSP", () => {
    it("should delete CSP with valid id", async () => {
      mockReq.method = "DELETE";
      mockReq.body = { id: "123e4567-e89b-12d3-a456-426614174000" };

      mockService.deleteCSP.mockResolvedValue(undefined);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.deleteCSP).toHaveBeenCalledWith(
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

      expect(mockService.deleteCSP).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 for invalid UUID", async () => {
      mockReq.method = "DELETE";
      mockReq.body = { id: "invalid-uuid" };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.deleteCSP).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe("Error Handling", () => {
    it("should return 500 for service errors on GET", async () => {
      mockReq.method = "GET";

      mockService.findAllCSPs.mockRejectedValue(new Error("Database error"));

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Database error" });
    });

    it("should return 500 for service errors on POST with valid data", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        name: "New Station",
        description: "A new bike station in Madrid",
        city: "Madrid",
        country: "ES",
        latitude: 40.4168,
        longitude: -3.7038,
        type: "bike_station",
        image_url: "https://example.com/image.jpg",
      };

      mockService.createCSP.mockRejectedValue(new Error("Duplicate entry"));

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Duplicate entry" });
    });

    it("should handle unexpected errors", async () => {
      mockReq.method = "GET";

      mockService.findAllCSPs.mockRejectedValue(new Error("Unexpected error"));

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
