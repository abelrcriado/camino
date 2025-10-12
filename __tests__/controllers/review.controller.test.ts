import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { ReviewController } from "../../src/controllers/review.controller";
import { ReviewService } from "../../src/services/review.service";
import type { NextApiRequest, NextApiResponse } from "next";

const VALID_USER_ID = "550e8400-e29b-41d4-a716-446655440001";
const VALID_SERVICE_POINT_ID = "550e8400-e29b-41d4-a716-446655440002";
const VALID_WORKSHOP_ID = "550e8400-e29b-41d4-a716-446655440003";
const VALID_REVIEW_ID = "550e8400-e29b-41d4-a716-446655440004";

describe("ReviewController", () => {
  let controller: ReviewController;
  let mockService: jest.Mocked<ReviewService>;
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUser: jest.fn(),
      findByServicePoint: jest.fn(),
      findByWorkshop: jest.fn(),
      findByRating: jest.fn(),
      createReview: jest.fn(),
      updateReview: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ReviewService>;

    controller = new ReviewController(mockService);

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

      expect(mockRes.setHeader).toHaveBeenCalledWith("Allow", [
        "GET",
        "POST",
        "PUT",
        "DELETE",
      ]);
      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Method PATCH Not Allowed",
      });
    });
  });

  describe("GET - Find Reviews", () => {
    it("should return all reviews when no filters", async () => {
      mockReq.method = "GET";

      const mockReviews = [
        {
          id: "review-1",
          user_id: "550e8400-e29b-41d4-a716-446655440001",
          service_point_id: "550e8400-e29b-41d4-a716-446655440002",
          rating: 5,
          comment: "Excellent service",
        },
      ];

      mockService.findAll.mockResolvedValue({
        data: mockReviews,
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

      expect(mockService.findAll).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockReviews);
    });

    it("should filter by user_id", async () => {
      mockReq.method = "GET";
      mockReq.query = { user_id: "123e4567-e89b-12d3-a456-426614174000" };

      const mockReviews = [
        {
          id: "review-1",
          user_id: "123e4567-e89b-12d3-a456-426614174000",
          rating: 5,
          comment: "Great!",
        },
      ];

      mockService.findByUser.mockResolvedValue(mockReviews);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.findByUser).toHaveBeenCalledWith(
        "123e4567-e89b-12d3-a456-426614174000"
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockReviews);
    });

    it("should filter by service_point_id", async () => {
      mockReq.method = "GET";
      mockReq.query = {
        service_point_id: "550e8400-e29b-41d4-a716-446655440002",
      };

      const mockReviews = [
        {
          id: "review-1",
          service_point_id: "550e8400-e29b-41d4-a716-446655440002",
          rating: 4,
          comment: "Good",
        },
      ];

      mockService.findByServicePoint.mockResolvedValue(mockReviews);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.findByServicePoint).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440002"
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockReviews);
    });

    it("should filter by workshop_id", async () => {
      mockReq.method = "GET";
      mockReq.query = { workshop_id: "550e8400-e29b-41d4-a716-446655440003" };

      const mockReviews = [
        {
          id: "review-1",
          workshop_id: "550e8400-e29b-41d4-a716-446655440003",
          rating: 3,
          comment: "Average",
        },
      ];

      mockService.findByWorkshop.mockResolvedValue(mockReviews);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.findByWorkshop).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440003"
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockReviews);
    });

    it("should filter by rating", async () => {
      mockReq.method = "GET";
      mockReq.query = { rating: "5" };

      const mockReviews = [
        {
          id: "review-1",
          rating: 5,
          comment: "Perfect!",
        },
      ];

      mockService.findByRating.mockResolvedValue(mockReviews);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.findByRating).toHaveBeenCalledWith(5);
      expect(mockRes.json).toHaveBeenCalledWith(mockReviews);
    });

    it("should return 400 for invalid rating", async () => {
      mockReq.method = "GET";
      mockReq.query = { rating: "6" };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.findByRating).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
          details: expect.any(Array),
        })
      );
    });
  });

  describe("POST - Create Review", () => {
    it("should create review with valid data", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        user_id: "123e4567-e89b-12d3-a456-426614174000",
        service_point_id: "223e4567-e89b-12d3-a456-426614174000",
        rating: 5,
        comment: "Excellent service, highly recommended!",
      };

      const createdReview = {
        id: "review-new",
        ...mockReq.body,
      };

      mockService.createReview.mockResolvedValue(createdReview);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.createReview).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith([createdReview]);
    });

    it("should return 400 for invalid UUID", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        user_id: "invalid-uuid",
        rating: 5,
        comment: "Great!",
      };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.createReview).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 for invalid rating", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        user_id: "123e4567-e89b-12d3-a456-426614174000",
        rating: 6, // Invalid: > 5
        comment: "Great!",
      };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.createReview).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 for comment too long", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        user_id: "123e4567-e89b-12d3-a456-426614174000",
        rating: 5,
        comment: "a".repeat(5001), // > 5000 chars (max allowed by schema)
      };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.createReview).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe("PUT - Update Review", () => {
    it("should update review with valid data", async () => {
      mockReq.method = "PUT";
      mockReq.body = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        rating: 4,
        comment: "Updated comment",
      };

      const updatedReview = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        rating: 4,
        comment: "Updated comment",
      };

      mockService.updateReview.mockResolvedValue(updatedReview);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.updateReview).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith([updatedReview]);
    });

    it("should return 400 when id is missing", async () => {
      mockReq.method = "PUT";
      mockReq.body = { rating: 4 };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.updateReview).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
          details: expect.any(Array),
        })
      );
    });

    it("should return 400 for invalid UUID", async () => {
      mockReq.method = "PUT";
      mockReq.body = {
        id: "invalid-uuid",
        rating: 4,
      };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.updateReview).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
          details: expect.any(Array),
        })
      );
    });
  });

  describe("DELETE - Delete Review", () => {
    it("should delete review with valid id", async () => {
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
    it("should return 404 when review not found", async () => {
      mockReq.method = "GET";
      mockReq.query = { user_id: "550e8400-e29b-41d4-a716-446655440001" };

      mockService.findByUser.mockRejectedValue(new Error("Review not found"));

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 for validation errors", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        user_id: "123e4567-e89b-12d3-a456-426614174000",
        rating: 5,
        comment: "Great!",
      };

      mockService.createReview.mockRejectedValue(
        new Error("Error de validación: datos inválidos")
      );

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("should return 500 for unexpected errors", async () => {
      mockReq.method = "GET";

      mockService.findAll.mockRejectedValue(
        new Error("Database connection failed")
      );

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Error interno del servidor",
      });
    });
  });
});
