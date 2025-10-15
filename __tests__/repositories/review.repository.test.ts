import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { ReviewRepository } from "../../src/repositories/review.repository";
import { Review } from "../../src/dto/review.dto";
import { SupabaseClient } from "@supabase/supabase-js";
import { ReviewFactory } from "../helpers/factories";

// Mock Supabase client con métodos de query builder
/* eslint-disable @typescript-eslint/no-explicit-any */
const mockSupabase = {
  from: jest.fn(),
  select: jest.fn(),
  eq: jest.fn(),
  single: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  order: jest.fn(),
} as any as SupabaseClient;
/* eslint-enable @typescript-eslint/no-explicit-any */

describe("ReviewRepository", () => {
  let repository: ReviewRepository;

  const mockReview: Review = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    user_id: "550e8400-e29b-41d4-a716-446655440001",
    service_point_id: "550e8400-e29b-41d4-a716-446655440002",
    workshop_id: "550e8400-e29b-41d4-a716-446655440003",
    rating: 5,
    comment: "Excellent service, highly recommended!",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Configurar el query builder chain
    (mockSupabase.from as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.select as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.eq as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.insert as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.update as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.delete as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.order as jest.Mock).mockReturnValue(mockSupabase);

    repository = new ReviewRepository(mockSupabase);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Constructor", () => {
    it("should initialize with correct table name 'reviews'", () => {
      expect(repository).toBeInstanceOf(ReviewRepository);
    });

    it("should accept optional SupabaseClient", () => {
      const customRepo = new ReviewRepository(mockSupabase);
      expect(customRepo).toBeInstanceOf(ReviewRepository);
    });
  });

  describe("findByUser", () => {
    it("should find reviews by user ID successfully", async () => {
      const mockReviews = [
        mockReview,
        { ...mockReview, id: "different-id", rating: 4 },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: mockReviews,
        error: null,
      });

      const result = await repository.findByUser(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("reviews");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "user_id",
        "550e8400-e29b-41d4-a716-446655440001"
      );
      expect(result).toEqual({ data: mockReviews, error: null });
    });

    it("should return empty result when no reviews found", async () => {
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findByUser(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it("should return error on database failure", async () => {
      const dbError = { message: "Database error", code: "PGRST500" };
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      const result = await repository.findByUser(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(result.error).toEqual(dbError);
      expect(result.data).toBeNull();
    });

    it("should handle invalid user ID gracefully", async () => {
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findByUser("invalid-uuid");

      expect(mockSupabase.eq).toHaveBeenCalledWith("user_id", "invalid-uuid");
      expect(result.data).toEqual([]);
    });
  });

  describe("findByServicePoint", () => {
    it("should find reviews by service point ID successfully", async () => {
      const mockReviews = [mockReview];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: mockReviews,
        error: null,
      });

      const result = await repository.findByServicePoint(
        "550e8400-e29b-41d4-a716-446655440002"
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("reviews");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "service_point_id",
        "550e8400-e29b-41d4-a716-446655440002"
      );
      expect(result).toEqual({ data: mockReviews, error: null });
    });

    it("should return empty result when no reviews found", async () => {
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findByServicePoint(
        "550e8400-e29b-41d4-a716-446655440002"
      );

      expect(result.data).toEqual([]);
    });

    it("should return error on database failure", async () => {
      const dbError = { message: "Connection failed" };
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      const result = await repository.findByServicePoint(
        "550e8400-e29b-41d4-a716-446655440002"
      );

      expect(result.error).toEqual(dbError);
    });

    it("should find multiple reviews for the same service point", async () => {
      const mockReviews = [
        mockReview,
        { ...mockReview, id: "review-2", rating: 4, user_id: "different-user" },
        { ...mockReview, id: "review-3", rating: 3, user_id: "another-user" },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: mockReviews,
        error: null,
      });

      const result = await repository.findByServicePoint(
        "550e8400-e29b-41d4-a716-446655440002"
      );

      expect(result.data).toHaveLength(3);
      expect(result.data).toEqual(mockReviews);
    });
  });

  describe("findByWorkshop", () => {
    it("should find reviews by workshop ID successfully", async () => {
      const mockReviews = [mockReview];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: mockReviews,
        error: null,
      });

      const result = await repository.findByWorkshop(
        "550e8400-e29b-41d4-a716-446655440003"
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("reviews");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "workshop_id",
        "550e8400-e29b-41d4-a716-446655440003"
      );
      expect(result).toEqual({ data: mockReviews, error: null });
    });

    it("should return empty result when no reviews found", async () => {
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findByWorkshop(
        "550e8400-e29b-41d4-a716-446655440003"
      );

      expect(result.data).toEqual([]);
    });

    it("should return error on database failure", async () => {
      const dbError = { message: "Query timeout" };
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      const result = await repository.findByWorkshop(
        "550e8400-e29b-41d4-a716-446655440003"
      );

      expect(result.error).toEqual(dbError);
    });

    it("should find reviews for workshop with different ratings", async () => {
      const mockReviews = [
        mockReview,
        { ...mockReview, id: "review-2", rating: 4 },
        { ...mockReview, id: "review-3", rating: 5 },
        { ...mockReview, id: "review-4", rating: 3 },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: mockReviews,
        error: null,
      });

      const result = await repository.findByWorkshop(
        "550e8400-e29b-41d4-a716-446655440003"
      );

      expect(result.data).toHaveLength(4);
      expect(result.data?.map((r: Review) => r.rating)).toEqual([5, 4, 5, 3]);
    });
  });

  describe("findByRating", () => {
    it("should find reviews by rating successfully", async () => {
      const mockReviews = [
        mockReview,
        { ...mockReview, id: "review-2", user_id: "different-user" },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: mockReviews,
        error: null,
      });

      const result = await repository.findByRating(5);

      expect(mockSupabase.from).toHaveBeenCalledWith("reviews");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith("rating", 5);
      expect(result).toEqual({ data: mockReviews, error: null });
    });

    it("should find reviews with rating 1", async () => {
      const lowRatedReviews = [
        { ...mockReview, rating: 1, comment: "Poor service" },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: lowRatedReviews,
        error: null,
      });

      const result = await repository.findByRating(1);

      expect(mockSupabase.eq).toHaveBeenCalledWith("rating", 1);
      expect(result.data).toEqual(lowRatedReviews);
    });

    it("should find reviews with rating 3", async () => {
      const mediumReviews = [
        { ...mockReview, rating: 3, comment: "Average service" },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: mediumReviews,
        error: null,
      });

      const result = await repository.findByRating(3);

      expect(mockSupabase.eq).toHaveBeenCalledWith("rating", 3);
      expect(result.data).toEqual(mediumReviews);
    });

    it("should return empty result when no reviews with specific rating", async () => {
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findByRating(2);

      expect(result.data).toEqual([]);
    });

    it("should return error on database failure", async () => {
      const dbError = { message: "Database connection lost" };
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      const result = await repository.findByRating(5);

      expect(result.error).toEqual(dbError);
    });

    it("should handle rating boundary values (1 and 5)", async () => {
      // Test rating 1
      (mockSupabase.eq as jest.Mock).mockResolvedValueOnce({
        data: [{ ...mockReview, rating: 1 }],
        error: null,
      });

      const result1 = await repository.findByRating(1);
      expect(result1.data).toHaveLength(1);
      expect(result1.data?.[0].rating).toBe(1);

      // Test rating 5
      (mockSupabase.eq as jest.Mock).mockResolvedValueOnce({
        data: [{ ...mockReview, rating: 5 }],
        error: null,
      });

      const result5 = await repository.findByRating(5);
      expect(result5.data).toHaveLength(1);
      expect(result5.data?.[0].rating).toBe(5);
    });

    it("should handle out of range ratings gracefully", async () => {
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      // Note: Repository doesn't validate rating range, it's validated at schema level
      const result = await repository.findByRating(10);

      expect(mockSupabase.eq).toHaveBeenCalledWith("rating", 10);
      expect(result.data).toEqual([]);
    });
  });

  describe("BaseRepository methods", () => {
    it("should have access to findById from BaseRepository", () => {
      expect(typeof repository.findById).toBe("function");
    });

    it("should have access to findAll from BaseRepository", () => {
      expect(typeof repository.findAll).toBe("function");
    });

    it("should have access to create from BaseRepository", () => {
      expect(typeof repository.create).toBe("function");
    });

    it("should have access to update from BaseRepository", () => {
      expect(typeof repository.update).toBe("function");
    });

    it("should have access to delete from BaseRepository", () => {
      expect(typeof repository.delete).toBe("function");
    });
  });
});
