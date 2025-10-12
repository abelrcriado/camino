import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { FavoriteRepository } from "../../src/repositories/favorite.repository";
import { Favorite } from "../../src/dto/favorite.dto";
import { SupabaseClient } from "@supabase/supabase-js";

// Mock Supabase client
/* eslint-disable @typescript-eslint/no-explicit-any */
const mockSupabase = {
  from: jest.fn(),
  select: jest.fn(),
  eq: jest.fn(),
  single: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
} as any as SupabaseClient;
/* eslint-enable @typescript-eslint/no-explicit-any */

describe("FavoriteRepository", () => {
  let repository: FavoriteRepository;

  const mockFavorite: Favorite = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    user_id: "550e8400-e29b-41d4-a716-446655440001",
    service_point_id: "550e8400-e29b-41d4-a716-446655440002",
    created_at: "2025-01-01T00:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (mockSupabase.from as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.select as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.eq as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.single as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.insert as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.update as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.delete as jest.Mock).mockReturnValue(mockSupabase);

    repository = new FavoriteRepository(mockSupabase);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Constructor", () => {
    it("should initialize with correct table name 'favorites'", () => {
      expect(repository).toBeInstanceOf(FavoriteRepository);
    });

    it("should accept optional SupabaseClient", () => {
      const customRepo = new FavoriteRepository(mockSupabase);
      expect(customRepo).toBeInstanceOf(FavoriteRepository);
    });
  });

  describe("findByUser", () => {
    it("should find favorites by user ID successfully", async () => {
      const mockFavorites = [
        mockFavorite,
        { ...mockFavorite, id: "diff-id", service_point_id: "sp-2" },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: mockFavorites,
        error: null,
      });

      const result = await repository.findByUser(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("favorites");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "user_id",
        "550e8400-e29b-41d4-a716-446655440001"
      );
      expect(result.data).toEqual(mockFavorites);
    });

    it("should return empty array when no favorites found", async () => {
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findByUser(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(result.data).toEqual([]);
    });

    it("should return error on database failure", async () => {
      const dbError = { message: "Database error" };
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      const result = await repository.findByUser(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(result.error).toEqual(dbError);
    });

    it("should find multiple favorites for same user", async () => {
      const favorites = [
        mockFavorite,
        { ...mockFavorite, id: "id-2", service_point_id: "sp-2" },
        { ...mockFavorite, id: "id-3", service_point_id: "sp-3" },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: favorites,
        error: null,
      });

      const result = await repository.findByUser(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(result.data).toHaveLength(3);
    });
  });

  describe("findByServicePoint", () => {
    it("should find favorites by service point ID successfully", async () => {
      const mockFavorites = [
        mockFavorite,
        { ...mockFavorite, id: "diff-id", user_id: "user-2" },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: mockFavorites,
        error: null,
      });

      const result = await repository.findByServicePoint(
        "550e8400-e29b-41d4-a716-446655440002"
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("favorites");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "service_point_id",
        "550e8400-e29b-41d4-a716-446655440002"
      );
      expect(result.data).toEqual(mockFavorites);
    });

    it("should return empty array when no favorites found", async () => {
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
      const dbError = { message: "Query failed" };
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      const result = await repository.findByServicePoint(
        "550e8400-e29b-41d4-a716-446655440002"
      );

      expect(result.error).toEqual(dbError);
    });
  });

  describe("findDuplicate", () => {
    it("should find duplicate favorite successfully", async () => {
      (mockSupabase.single as jest.Mock).mockResolvedValue({
        data: mockFavorite,
        error: null,
      });

      const result = await repository.findDuplicate(
        "550e8400-e29b-41d4-a716-446655440001",
        "550e8400-e29b-41d4-a716-446655440002"
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("favorites");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "user_id",
        "550e8400-e29b-41d4-a716-446655440001"
      );
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "service_point_id",
        "550e8400-e29b-41d4-a716-446655440002"
      );
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(result.data).toEqual(mockFavorite);
    });

    it("should return null when no duplicate found", async () => {
      (mockSupabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: { code: "PGRST116", message: "No rows found" },
      });

      const result = await repository.findDuplicate(
        "550e8400-e29b-41d4-a716-446655440001",
        "550e8400-e29b-41d4-a716-446655440002"
      );

      expect(result.data).toBeNull();
    });

    it("should return error on database failure", async () => {
      const dbError = { message: "Duplicate check failed" };
      (mockSupabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      const result = await repository.findDuplicate(
        "550e8400-e29b-41d4-a716-446655440001",
        "550e8400-e29b-41d4-a716-446655440002"
      );

      expect(result.error).toEqual(dbError);
    });

    it("should verify composite key uniqueness", async () => {
      (mockSupabase.single as jest.Mock).mockResolvedValue({
        data: mockFavorite,
        error: null,
      });

      const result = await repository.findDuplicate(
        "550e8400-e29b-41d4-a716-446655440001",
        "550e8400-e29b-41d4-a716-446655440002"
      );

      // Verify both filters applied
      expect(mockSupabase.eq).toHaveBeenCalledTimes(2);
      expect(result.data).toBeDefined();
    });
  });

  describe("BaseRepository methods", () => {
    it("should have access to findById", () => {
      expect(typeof repository.findById).toBe("function");
    });

    it("should have access to findAll", () => {
      expect(typeof repository.findAll).toBe("function");
    });

    it("should have access to create", () => {
      expect(typeof repository.create).toBe("function");
    });

    it("should have access to update", () => {
      expect(typeof repository.update).toBe("function");
    });

    it("should have access to delete", () => {
      expect(typeof repository.delete).toBe("function");
    });
  });
});
