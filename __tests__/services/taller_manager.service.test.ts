import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { TallerManagerService } from "@/api/services/taller_manager.service";
import { TallerManagerRepository } from "@/api/repositories/taller_manager.repository";
import type { UpdateTallerManagerDto } from "@/shared/dto/taller_manager.dto";
import { DatabaseError } from "@/api/errors/custom-errors";
import { TallerManagerFactory } from "../helpers/factories";

describe("TallerManagerService", () => {
  let service: TallerManagerService;
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
      findByWorkshop: jest.fn() as jest.Mock,
      findByUser: jest.fn() as jest.Mock,
    };

    service = new TallerManagerService(
      mockRepository as TallerManagerRepository
    );
  });

  describe("createTallerManager", () => {
    it("should create taller manager successfully", async () => {
      const createData = TallerManagerFactory.createDto();
      const createdManager = TallerManagerFactory.create(createData);

      mockRepository.create.mockResolvedValue({
        data: [createdManager],
        error: null,
      });

      const result = await service.createTallerManager(createData);

      expect(result).toEqual(createdManager);
      expect(mockRepository.create).toHaveBeenCalledWith(createData);
    });
  });

  describe("updateTallerManager", () => {
    it("should update taller manager successfully", async () => {
      const managerId = "manager-1";
      const updateData: UpdateTallerManagerDto = {
        id: managerId,
        phone: "+34999888777",
        role: "senior_manager",
      };

      const updatedManager = TallerManagerFactory.create({
        id: managerId,
        phone: "+34999888777",
        role: "senior_manager",
      });

      mockRepository.update.mockResolvedValue({
        data: [updatedManager],
        error: null,
      });

      const result = await service.updateTallerManager(updateData);

      expect(result).toEqual(updatedManager);
      expect(mockRepository.update).toHaveBeenCalledWith(managerId, {
        phone: "+34999888777",
        role: "senior_manager",
      });
    });
  });

  describe("findByWorkshop", () => {
    it("should return managers for workshop", async () => {
      const workshopId = "workshop-123";
      const mockManagers = TallerManagerFactory.createMany(2, {
        workshop_id: workshopId,
      });

      mockRepository.findByWorkshop.mockResolvedValue({
        data: mockManagers,
        error: null,
      });

      const result = await service.findByWorkshop(workshopId);

      expect(result).toEqual(mockManagers);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByWorkshop).toHaveBeenCalledWith(workshopId);
    });

    it("should return empty array when workshop has no managers", async () => {
      mockRepository.findByWorkshop.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.findByWorkshop("workshop-no-managers");

      expect(result).toEqual([]);
    });

    it("should throw error when repository fails", async () => {
      mockRepository.findByWorkshop.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      await expect(service.findByWorkshop("workshop-123")).rejects.toThrow(
        DatabaseError
      );
    });
  });

  describe("findByUser", () => {
    it("should return manager records for user", async () => {
      const userId = "user-123";
      const mockUserManagers = TallerManagerFactory.createMany(2, {
        user_id: userId,
      });

      mockRepository.findByUser.mockResolvedValue({
        data: mockUserManagers,
        error: null,
      });

      const result = await service.findByUser(userId);

      expect(result).toEqual(mockUserManagers);
      expect(result).toHaveLength(2);
      expect(result.every((manager) => manager.user_id === userId)).toBe(true);
      expect(mockRepository.findByUser).toHaveBeenCalledWith(userId);
    });

    it("should return empty array when user has no manager records", async () => {
      mockRepository.findByUser.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.findByUser("user-no-records");

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

  describe("delete (inherited)", () => {
    it("should delete taller manager successfully", async () => {
      mockRepository.delete.mockResolvedValue({
        error: null,
      });

      await expect(service.delete("manager-1")).resolves.not.toThrow();
      expect(mockRepository.delete).toHaveBeenCalledWith("manager-1");
    });
  });
});
