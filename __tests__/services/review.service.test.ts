import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { ReviewService } from "../../src/services/review.service";
import { ReviewRepository } from "../../src/repositories/review.repository";
import type {
  CreateReviewDto,
  UpdateReviewDto,
  Review,
} from "../../src/dto/review.dto";

describe("ReviewService", () => {
  let service: ReviewService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepository = {
      findAll: jest.fn() as jest.Mock,
      findById: jest.fn() as jest.Mock,
      create: jest.fn() as jest.Mock,
      update: jest.fn() as jest.Mock,
      delete: jest.fn() as jest.Mock,
      findByUser: jest.fn() as jest.Mock,
      findByServicePoint: jest.fn() as jest.Mock,
      findByWorkshop: jest.fn() as jest.Mock,
      findByRating: jest.fn() as jest.Mock,
    };

    service = new ReviewService(mockRepository as ReviewRepository);
  });

  describe("createReview", () => {
    it("should create review successfully", async () => {
      const createData: CreateReviewDto = {
        user_id: "user-123",
        service_point_id: "sp-123",
        rating: 5,
        comment: "Excellent service!",
      };

      const createdReview: Review = {
        id: "review-123",
        user_id: "user-123",
        service_point_id: "sp-123",
        workshop_id: undefined,
        rating: 5,
        comment: "Excellent service!",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockRepository.create.mockResolvedValue({
        data: [createdReview],
        error: null,
      });

      const result = await service.createReview(createData);

      expect(result).toEqual(createdReview);
      expect(mockRepository.create).toHaveBeenCalledWith(createData);
    });
  });

  describe("updateReview", () => {
    it("should update review successfully", async () => {
      const updateData: UpdateReviewDto = {
        id: "review-1",
        rating: 4,
        comment: "Updated comment",
      };

      const updatedReview: Review = {
        id: "review-1",
        user_id: "user-123",
        service_point_id: "sp-123",
        workshop_id: undefined,
        rating: 4,
        comment: "Updated comment",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockRepository.update.mockResolvedValue({
        data: [updatedReview],
        error: null,
      });

      const result = await service.updateReview(updateData);

      expect(result).toEqual(updatedReview);
      expect(mockRepository.update).toHaveBeenCalledWith("review-1", {
        rating: 4,
        comment: "Updated comment",
      });
    });
  });

  describe("findByUser", () => {
    it("should return reviews for user", async () => {
      const mockReviews: Review[] = [
        {
          id: "review-1",
          user_id: "user-123",
          service_point_id: "sp-1",
          workshop_id: undefined,
          rating: 5,
          comment: "Great!",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "review-2",
          user_id: "user-123",
          service_point_id: "sp-2",
          workshop_id: undefined,
          rating: 4,
          comment: "Good",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockRepository.findByUser.mockResolvedValue({
        data: mockReviews,
        error: null,
      });

      const result = await service.findByUser("user-123");

      expect(result).toEqual(mockReviews);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByUser).toHaveBeenCalledWith("user-123");
    });

    it("should return empty array when user has no reviews", async () => {
      mockRepository.findByUser.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.findByUser("user-no-reviews");

      expect(result).toEqual([]);
    });

    it("should throw error when repository fails", async () => {
      mockRepository.findByUser.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      await expect(service.findByUser("user-123")).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("findByServicePoint", () => {
    it("should return reviews for service point", async () => {
      const mockReviews: Review[] = [
        {
          id: "review-1",
          user_id: "user-1",
          service_point_id: "sp-123",
          workshop_id: undefined,
          rating: 5,
          comment: "Excellent location",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockRepository.findByServicePoint.mockResolvedValue({
        data: mockReviews,
        error: null,
      });

      const result = await service.findByServicePoint("sp-123");

      expect(result).toEqual(mockReviews);
      expect(mockRepository.findByServicePoint).toHaveBeenCalledWith("sp-123");
    });

    it("should return empty array when service point has no reviews", async () => {
      mockRepository.findByServicePoint.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.findByServicePoint("sp-no-reviews");

      expect(result).toEqual([]);
    });

    it("should throw error when repository fails", async () => {
      mockRepository.findByServicePoint.mockResolvedValue({
        data: null,
        error: { message: "Query failed" },
      });

      await expect(service.findByServicePoint("sp-123")).rejects.toThrow(
        "Query failed"
      );
    });
  });

  describe("findByWorkshop", () => {
    it("should return reviews for workshop", async () => {
      const mockReviews: Review[] = [
        {
          id: "review-1",
          user_id: "user-1",
          service_point_id: undefined,
          workshop_id: "workshop-123",
          rating: 5,
          comment: "Great workshop",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "review-2",
          user_id: "user-2",
          service_point_id: undefined,
          workshop_id: "workshop-123",
          rating: 4,
          comment: "Good service",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockRepository.findByWorkshop.mockResolvedValue({
        data: mockReviews,
        error: null,
      });

      const result = await service.findByWorkshop("workshop-123");

      expect(result).toEqual(mockReviews);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByWorkshop).toHaveBeenCalledWith(
        "workshop-123"
      );
    });

    it("should return empty array when workshop has no reviews", async () => {
      mockRepository.findByWorkshop.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.findByWorkshop("workshop-no-reviews");

      expect(result).toEqual([]);
    });

    it("should throw error when repository fails", async () => {
      mockRepository.findByWorkshop.mockResolvedValue({
        data: null,
        error: { message: "Connection lost" },
      });

      await expect(service.findByWorkshop("workshop-123")).rejects.toThrow(
        "Connection lost"
      );
    });
  });

  describe("findByRating", () => {
    it("should return reviews with specific rating", async () => {
      const mockReviews: Review[] = [
        {
          id: "review-1",
          user_id: "user-1",
          service_point_id: "sp-1",
          workshop_id: undefined,
          rating: 5,
          comment: "Perfect!",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "review-2",
          user_id: "user-2",
          service_point_id: "sp-2",
          workshop_id: undefined,
          rating: 5,
          comment: "Amazing!",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockRepository.findByRating.mockResolvedValue({
        data: mockReviews,
        error: null,
      });

      const result = await service.findByRating(5);

      expect(result).toEqual(mockReviews);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByRating).toHaveBeenCalledWith(5);
    });

    it("should return empty array when no reviews with rating", async () => {
      mockRepository.findByRating.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.findByRating(1);

      expect(result).toEqual([]);
    });

    it("should throw error when repository fails", async () => {
      mockRepository.findByRating.mockResolvedValue({
        data: null,
        error: { message: "Invalid rating" },
      });

      await expect(service.findByRating(3)).rejects.toThrow("Invalid rating");
    });
  });

  describe("delete (inherited)", () => {
    it("should delete review successfully", async () => {
      mockRepository.delete.mockResolvedValue({
        error: null,
      });

      await expect(service.delete("review-1")).resolves.not.toThrow();
      expect(mockRepository.delete).toHaveBeenCalledWith("review-1");
    });
  });
});
