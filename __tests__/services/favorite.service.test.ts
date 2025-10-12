import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { FavoriteService } from "../../src/services/favorite.service";
import { FavoriteRepository } from "../../src/repositories/favorite.repository";
import {
  ConflictError,
  DatabaseError,
  NotFoundError,
} from "../../src/errors/custom-errors";
import type {
  CreateFavoriteDto,
  UpdateFavoriteDto,
  Favorite,
} from "../../src/dto/favorite.dto";

describe("FavoriteService", () => {
  let service: FavoriteService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Crear mock del repository
    mockRepository = {
      findAll: jest.fn() as jest.Mock,
      findById: jest.fn() as jest.Mock,
      create: jest.fn() as jest.Mock,
      update: jest.fn() as jest.Mock,
      delete: jest.fn() as jest.Mock,
      findDuplicate: jest.fn() as jest.Mock,
      findByUser: jest.fn() as jest.Mock,
      findByServicePoint: jest.fn() as jest.Mock,
    };

    service = new FavoriteService(mockRepository as FavoriteRepository);
  });

  // ============================================================================
  // Tests heredados de BaseService
  // ============================================================================

  describe("findAll (inherited)", () => {
    it("should return paginated favorites", async () => {
      const mockFavorites = [
        { id: "1", user_id: "user-1", service_point_id: "sp-1" },
        { id: "2", user_id: "user-1", service_point_id: "sp-2" },
      ];

      mockRepository.findAll.mockResolvedValue({
        data: mockFavorites,
        error: null,
        count: 2,
      });

      const result = await service.findAll({}, { page: 1, limit: 10 });

      expect(result.data).toEqual(mockFavorites);
      expect(result.pagination.total).toBe(2);
    });
  });

  describe("findById (inherited)", () => {
    it("should return favorite when found", async () => {
      const mockFavorite = {
        id: "fav-id",
        user_id: "user-1",
        service_point_id: "sp-1",
      };
      mockRepository.findById.mockResolvedValue({
        data: mockFavorite,
        error: null,
      });

      const result = await service.findById("fav-id");

      expect(result).toEqual(mockFavorite);
    });

    it("should throw NotFoundError when favorite not found", async () => {
      mockRepository.findById.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(service.findById("non-existent")).rejects.toThrow(
        NotFoundError
      );
    });
  });

  // ============================================================================
  // Tests específicos de FavoriteService
  // ============================================================================

  describe("createFavorite", () => {
    it("should create favorite successfully when not duplicate", async () => {
      const createData: CreateFavoriteDto = {
        user_id: "user-123",
        service_point_id: "sp-456",
      };

      const createdFavorite: Favorite = {
        id: "fav-789",
        ...createData,
        workshop_id: undefined,
        created_at: new Date().toISOString(),
      };

      // Simular que no existe duplicado
      mockRepository.findDuplicate.mockResolvedValue({
        data: null,
        error: null,
      });

      // Simular creación exitosa
      mockRepository.create.mockResolvedValue({
        data: [createdFavorite],
        error: null,
      });

      const result = await service.createFavorite(createData);

      expect(result).toEqual(createdFavorite);
      expect(mockRepository.findDuplicate).toHaveBeenCalledWith(
        "user-123",
        "sp-456"
      );
      expect(mockRepository.create).toHaveBeenCalledWith(createData);
    });

    it("should throw ConflictError when favorite already exists", async () => {
      const createData: CreateFavoriteDto = {
        user_id: "user-123",
        service_point_id: "sp-456",
      };

      // Simular que ya existe el favorito
      mockRepository.findDuplicate.mockResolvedValue({
        data: { id: "existing-fav", ...createData },
        error: null,
      });

      await expect(service.createFavorite(createData)).rejects.toThrow(
        ConflictError
      );
      await expect(service.createFavorite(createData)).rejects.toThrow(
        "El favorito ya existe"
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("should create favorite with optional workshop_id", async () => {
      const createData: CreateFavoriteDto = {
        user_id: "user-123",
        service_point_id: "sp-456",
        workshop_id: "workshop-789",
      };

      const createdFavorite: Favorite = {
        id: "fav-abc",
        ...createData,
        created_at: new Date().toISOString(),
      };

      mockRepository.findDuplicate.mockResolvedValue({
        data: null,
        error: null,
      });

      mockRepository.create.mockResolvedValue({
        data: [createdFavorite],
        error: null,
      });

      const result = await service.createFavorite(createData);

      expect(result).toEqual(createdFavorite);
      expect(result.workshop_id).toBe("workshop-789");
    });
  });

  describe("updateFavorite", () => {
    it("should update favorite successfully", async () => {
      const updateData: UpdateFavoriteDto = {
        id: "fav-id",
        workshop_id: "new-workshop-id",
      };

      const updatedFavorite: Favorite = {
        id: "fav-id",
        user_id: "user-123",
        service_point_id: "sp-456",
        workshop_id: "new-workshop-id",
        created_at: new Date().toISOString(),
      };

      mockRepository.update.mockResolvedValue({
        data: [updatedFavorite],
        error: null,
      });

      const result = await service.updateFavorite(updateData);

      expect(result).toEqual(updatedFavorite);
      expect(mockRepository.update).toHaveBeenCalledWith("fav-id", {
        workshop_id: "new-workshop-id",
      });
    });

    it("should throw NotFoundError when favorite does not exist", async () => {
      const updateData: UpdateFavoriteDto = {
        id: "non-existent-id",
        service_point_id: "sp-new",
      };

      mockRepository.update.mockResolvedValue({
        data: [],
        error: null,
      });

      await expect(service.updateFavorite(updateData)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("findByUser", () => {
    it("should return all favorites for a user", async () => {
      const mockFavorites: Favorite[] = [
        {
          id: "fav-1",
          user_id: "user-123",
          service_point_id: "sp-1",
          workshop_id: undefined,
          created_at: new Date().toISOString(),
        },
        {
          id: "fav-2",
          user_id: "user-123",
          service_point_id: "sp-2",
          workshop_id: "workshop-1",
          created_at: new Date().toISOString(),
        },
      ];

      mockRepository.findByUser.mockResolvedValue({
        data: mockFavorites,
        error: null,
      });

      const result = await service.findByUser("user-123");

      expect(result).toEqual(mockFavorites);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByUser).toHaveBeenCalledWith("user-123");
    });

    it("should return empty array when user has no favorites", async () => {
      mockRepository.findByUser.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.findByUser("user-no-favs");

      expect(result).toEqual([]);
    });

    it("should throw DatabaseError when repository returns error", async () => {
      mockRepository.findByUser.mockResolvedValue({
        data: null,
        error: { message: "Query failed" },
      });

      await expect(service.findByUser("user-123")).rejects.toThrow(
        DatabaseError
      );
      await expect(service.findByUser("user-123")).rejects.toThrow(
        "Query failed"
      );
    });
  });

  describe("findByServicePoint", () => {
    it("should return all favorites for a service point", async () => {
      const mockFavorites: Favorite[] = [
        {
          id: "fav-1",
          user_id: "user-1",
          service_point_id: "sp-123",
          workshop_id: undefined,
          created_at: new Date().toISOString(),
        },
        {
          id: "fav-2",
          user_id: "user-2",
          service_point_id: "sp-123",
          workshop_id: undefined,
          created_at: new Date().toISOString(),
        },
      ];

      mockRepository.findByServicePoint.mockResolvedValue({
        data: mockFavorites,
        error: null,
      });

      const result = await service.findByServicePoint("sp-123");

      expect(result).toEqual(mockFavorites);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByServicePoint).toHaveBeenCalledWith("sp-123");
    });

    it("should return empty array when service point has no favorites", async () => {
      mockRepository.findByServicePoint.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.findByServicePoint("sp-no-favs");

      expect(result).toEqual([]);
    });

    it("should throw DatabaseError when repository returns error", async () => {
      mockRepository.findByServicePoint.mockResolvedValue({
        data: null,
        error: { message: "Database connection lost" },
      });

      await expect(service.findByServicePoint("sp-123")).rejects.toThrow(
        DatabaseError
      );
      await expect(service.findByServicePoint("sp-123")).rejects.toThrow(
        "Database connection lost"
      );
    });
  });

  describe("delete (inherited)", () => {
    it("should delete favorite successfully", async () => {
      mockRepository.delete.mockResolvedValue({
        error: null,
      });

      await expect(service.delete("fav-id")).resolves.not.toThrow();
      expect(mockRepository.delete).toHaveBeenCalledWith("fav-id");
    });
  });
});
