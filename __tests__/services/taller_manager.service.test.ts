import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { TallerManagerService } from "../../src/services/taller_manager.service";
import { TallerManagerRepository } from "../../src/repositories/taller_manager.repository";
import type {
  CreateTallerManagerDto,
  UpdateTallerManagerDto,
  TallerManager,
} from "../../src/dto/taller_manager.dto";
import { DatabaseError } from "../../src/errors/custom-errors";

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
      const createData: CreateTallerManagerDto = {
        workshop_id: "workshop-123",
        user_id: "user-123",
        name: "Carlos García",
        email: "carlos@workshop.com",
        phone: "+34666777888",
        role: "manager",
      };

      const createdManager: TallerManager = {
        id: "manager-123",
        workshop_id: "workshop-123",
        user_id: "user-123",
        name: "Carlos García",
        email: "carlos@workshop.com",
        phone: "+34666777888",
        role: "manager",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

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
      const updateData: UpdateTallerManagerDto = {
        id: "manager-1",
        phone: "+34999888777",
        role: "senior_manager",
      };

      const updatedManager: TallerManager = {
        id: "manager-1",
        workshop_id: "workshop-123",
        user_id: "user-123",
        name: "Carlos García",
        email: "carlos@workshop.com",
        phone: "+34999888777",
        role: "senior_manager",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockRepository.update.mockResolvedValue({
        data: [updatedManager],
        error: null,
      });

      const result = await service.updateTallerManager(updateData);

      expect(result).toEqual(updatedManager);
      expect(mockRepository.update).toHaveBeenCalledWith("manager-1", {
        phone: "+34999888777",
        role: "senior_manager",
      });
    });
  });

  describe("findByWorkshop", () => {
    it("should return managers for workshop", async () => {
      const mockManagers: TallerManager[] = [
        {
          id: "manager-1",
          workshop_id: "workshop-123",
          user_id: "user-123",
          name: "Carlos García",
          email: "carlos@workshop.com",
          phone: "+34666777888",
          role: "manager",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "manager-2",
          workshop_id: "workshop-123",
          user_id: "user-456",
          name: "María López",
          email: "maria@workshop.com",
          phone: "+34555444333",
          role: "assistant",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockRepository.findByWorkshop.mockResolvedValue({
        data: mockManagers,
        error: null,
      });

      const result = await service.findByWorkshop("workshop-123");

      expect(result).toEqual(mockManagers);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByWorkshop).toHaveBeenCalledWith(
        "workshop-123"
      );
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
      const mockUserManagers: TallerManager[] = [
        {
          id: "manager-1",
          workshop_id: "workshop-123",
          user_id: "user-123",
          name: "Carlos García",
          email: "carlos@workshop.com",
          phone: "+34666777888",
          role: "manager",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "manager-2",
          workshop_id: "workshop-456",
          user_id: "user-123",
          name: "Carlos García",
          email: "carlos@workshop.com",
          phone: "+34666777888",
          role: "supervisor",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockRepository.findByUser.mockResolvedValue({
        data: mockUserManagers,
        error: null,
      });

      const result = await service.findByUser("user-123");

      expect(result).toEqual(mockUserManagers);
      expect(result).toHaveLength(2);
      expect(result.every((manager) => manager.user_id === "user-123")).toBe(
        true
      );
      expect(mockRepository.findByUser).toHaveBeenCalledWith("user-123");
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
