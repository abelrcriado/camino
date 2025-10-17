import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { FavoriteService } from "@/api/services/favorite.service";
import { FavoriteRepository } from "@/api/repositories/favorite.repository";
import {
  ConflictError,
  DatabaseError,
  NotFoundError,
} from "@/api/errors/custom-errors";
import type { UpdateFavoriteDto } from "@/shared/dto/favorite.dto";
import { FavoriteFactory } from "../helpers/factories";

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

  // ============================================================================s
  // Tests heredados de BaseService
  // ============================================================================

  describe("findAll (inherited)", () => {
    it("should return paginated favorites", async () => {
      const mockFavorites = FavoriteFactory.createMany(2, {
        user_id: "user-1",
      });

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
      const mockFavorite = FavoriteFactory.create();
      mockRepository.findById.mockResolvedValue({
        data: mockFavorite,
        error: null,
      });

      const result = await service.findById(mockFavorite.id);

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
      const createData = FavoriteFactory.createDto();
      const createdFavorite = FavoriteFactory.create(createData);

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
        createData.user_id,
        createData.service_point_id
      );
      expect(mockRepository.create).toHaveBeenCalledWith(createData);
    });

    it("should throw ConflictError when favorite already exists", async () => {
      const createData = FavoriteFactory.createDto();

      // Simular que ya existe el favorito
      mockRepository.findDuplicate.mockResolvedValue({
        data: FavoriteFactory.create(createData),
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
      const workshopId = "workshop-789";
      const createData = FavoriteFactory.createDto({ workshop_id: workshopId });
      const createdFavorite = FavoriteFactory.create(createData);

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
      expect(result.workshop_id).toBe(workshopId);
    });
  });

  describe("updateFavorite", () => {
    it("should update favorite successfully", async () => {
      const favoriteId = "fav-id";
      const workshopId = "new-workshop-id";
      const updateData: UpdateFavoriteDto = {
        id: favoriteId,
        workshop_id: workshopId,
      };

      const updatedFavorite = FavoriteFactory.create({
        id: favoriteId,
        workshop_id: workshopId,
      });

      mockRepository.update.mockResolvedValue({
        data: [updatedFavorite],
        error: null,
      });

      const result = await service.updateFavorite(updateData);

      expect(result).toEqual(updatedFavorite);
      expect(mockRepository.update).toHaveBeenCalledWith(favoriteId, {
        workshop_id: workshopId,
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
      const userId = "user-123";
      const mockFavorites = FavoriteFactory.createMany(2, { user_id: userId });

      mockRepository.findByUser.mockResolvedValue({
        data: mockFavorites,
        error: null,
      });

      const result = await service.findByUser(userId);

      expect(result).toEqual(mockFavorites);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByUser).toHaveBeenCalledWith(userId);
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
      const servicePointId = "sp-123";
      const mockFavorites = FavoriteFactory.createMany(2, {
        service_point_id: servicePointId,
      });

      mockRepository.findByServicePoint.mockResolvedValue({
        data: mockFavorites,
        error: null,
      });

      const result = await service.findByServicePoint(servicePointId);

      expect(result).toEqual(mockFavorites);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByServicePoint).toHaveBeenCalledWith(
        servicePointId
      );
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
