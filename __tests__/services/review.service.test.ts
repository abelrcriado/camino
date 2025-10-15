import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { ReviewService } from "../../src/services/review.service";
import { ReviewRepository } from "../../src/repositories/review.repository";
import type { UpdateReviewDto } from "../../src/dto/review.dto";
import { DatabaseError } from "../../src/errors/custom-errors";
import { ReviewFactory } from "../helpers/factories";

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
      const createData = ReviewFactory.createDto();
      const createdReview = ReviewFactory.create(createData);

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
      const reviewId = "review-test-id";
      const updateData: UpdateReviewDto = {
        id: reviewId,
        rating: 4,
        comment: "Updated comment",
      };

      const updatedReview = ReviewFactory.create({
        id: reviewId,
        rating: 4,
        comment: "Updated comment",
      });

      mockRepository.update.mockResolvedValue({
        data: [updatedReview],
        error: null,
      });

      const result = await service.updateReview(updateData);

      expect(result).toEqual(updatedReview);
      expect(mockRepository.update).toHaveBeenCalledWith(reviewId, {
        rating: 4,
        comment: "Updated comment",
      });
    });
  });

  describe("findByUser", () => {
    it("should return reviews for user", async () => {
      const userId = "user-123";
      const mockReviews = ReviewFactory.createMany(2, { user_id: userId });

      mockRepository.findByUser.mockResolvedValue({
        data: mockReviews,
        error: null,
      });

      const result = await service.findByUser(userId);

      expect(result).toEqual(mockReviews);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByUser).toHaveBeenCalledWith(userId);
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
        DatabaseError
      );
    });
  });

  describe("findByServicePoint", () => {
    it("should return reviews for service point", async () => {
      const servicePointId = "sp-123";
      const mockReviews = ReviewFactory.createMany(1, {
        service_point_id: servicePointId,
      });

      mockRepository.findByServicePoint.mockResolvedValue({
        data: mockReviews,
        error: null,
      });

      const result = await service.findByServicePoint(servicePointId);

      expect(result).toEqual(mockReviews);
      expect(mockRepository.findByServicePoint).toHaveBeenCalledWith(
        servicePointId
      );
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
        DatabaseError
      );
    });
  });

  describe("findByWorkshop", () => {
    it("should return reviews for workshop", async () => {
      const workshopId = "workshop-123";
      const mockReviews = ReviewFactory.createMany(2, {
        workshop_id: workshopId,
      });

      mockRepository.findByWorkshop.mockResolvedValue({
        data: mockReviews,
        error: null,
      });

      const result = await service.findByWorkshop(workshopId);

      expect(result).toEqual(mockReviews);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByWorkshop).toHaveBeenCalledWith(workshopId);
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
        DatabaseError
      );
    });
  });

  describe("findByRating", () => {
    it("should return reviews with specific rating", async () => {
      const rating = 5;
      const mockReviews = ReviewFactory.createMany(2, { rating });

      mockRepository.findByRating.mockResolvedValue({
        data: mockReviews,
        error: null,
      });

      const result = await service.findByRating(rating);

      expect(result).toEqual(mockReviews);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByRating).toHaveBeenCalledWith(rating);
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

      await expect(service.findByRating(3)).rejects.toThrow(DatabaseError);
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
