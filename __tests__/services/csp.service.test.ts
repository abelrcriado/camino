import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { CSPService } from "../../src/services/csp.service";
import { CSPRepository } from "../../src/repositories/csp.repository";
import type {
  CreateCSPDto,
  UpdateCSPDto,
  CSP,
  CSPFilters,
} from "../../src/dto/csp.dto";
import { DatabaseError } from "../../src/errors/custom-errors";

describe("CSPService", () => {
  let service: CSPService;
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
      findByType: jest.fn() as jest.Mock,
      findActive: jest.fn() as jest.Mock,
    };

    service = new CSPService(mockRepository as CSPRepository);
  });

  describe("findAllCSPs", () => {
    it("should return paginated CSPs with default sorting", async () => {
      const mockCSPs: CSP[] = [
        {
          id: "csp-1",
          name: "CSP Madrid Centro",
          type: "service_point",
          latitude: 40.4168,
          longitude: -3.7038,
          city: "Madrid",
          country: "Spain",
          address: "Calle Principal 123",
          status: "online",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockRepository.findAll.mockResolvedValue({
        data: mockCSPs,
        error: null,
        count: 1,
      });

      const result = await service.findAllCSPs({}, { page: 1, limit: 10 });

      expect(result.data).toEqual(mockCSPs);
      expect(mockRepository.findAll).toHaveBeenCalledWith(
        {},
        { page: 1, limit: 10 },
        { field: "created_at", order: "desc" }
      );
    });

    it("should apply filters correctly", async () => {
      const filters: CSPFilters = {
        status: "online",
        type: "service_point",
      };

      mockRepository.findAll.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      await service.findAllCSPs(filters);

      expect(mockRepository.findAll).toHaveBeenCalledWith(filters, undefined, {
        field: "created_at",
        order: "desc",
      });
    });
  });

  describe("createCSP", () => {
    it("should create CSP with provided status", async () => {
      const createData: CreateCSPDto = {
        name: "New CSP",
        type: "service_point",
        latitude: 40.4168,
        longitude: -3.7038,
        city: "Madrid",
        country: "Spain",
        address: "Test Address",
        status: "online",
      };

      const createdCSP: CSP = {
        id: "csp-123",
        name: "New CSP",
        type: "service_point",
        latitude: 40.4168,
        longitude: -3.7038,
        city: "Madrid",
        country: "Spain",
        address: "Test Address",
        status: "online",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockRepository.create.mockResolvedValue({
        data: [createdCSP],
        error: null,
      });

      const result = await service.createCSP(createData);

      expect(result).toEqual(createdCSP);
      expect(mockRepository.create).toHaveBeenCalledWith(createData);
    });

    it("should default status to active if not provided", async () => {
      const createData: CreateCSPDto = {
        name: "New CSP",
        type: "workshop",
        latitude: 40.4168,
        longitude: -3.7038,
        city: "Madrid",
        country: "Spain",
        address: "Test Address",
      };

      const createdCSP: CSP = {
        id: "csp-456",
        name: "New CSP",
        type: "workshop",
        latitude: 40.4168,
        longitude: -3.7038,
        city: "Madrid",
        country: "Spain",
        address: "Test Address",
        status: "online",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockRepository.create.mockResolvedValue({
        data: [createdCSP],
        error: null,
      });

      await service.createCSP(createData);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createData,
        status: "online",
      });
    });
  });

  describe("updateCSP", () => {
    it("should update CSP successfully", async () => {
      const updateData: UpdateCSPDto = {
        id: "csp-1",
        name: "Updated Name",
        status: "inactive",
      };

      const updatedCSP: CSP = {
        id: "csp-1",
        name: "Updated Name",
        type: "service_point",
        latitude: 40.4168,
        longitude: -3.7038,
        city: "Madrid",
        country: "Spain",
        address: "Madrid, Spain",
        status: "inactive",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockRepository.update.mockResolvedValue({
        data: [updatedCSP],
        error: null,
      });

      const result = await service.updateCSP(updateData);

      expect(result).toEqual(updatedCSP);
      expect(mockRepository.update).toHaveBeenCalledWith("csp-1", {
        name: "Updated Name",
        status: "inactive",
      });
    });
  });

  describe("deleteCSP", () => {
    it("should delete CSP successfully", async () => {
      mockRepository.delete.mockResolvedValue({
        error: null,
      });

      await expect(service.deleteCSP("csp-1")).resolves.not.toThrow();
      expect(mockRepository.delete).toHaveBeenCalledWith("csp-1");
    });
  });

  describe("findByType", () => {
    it("should return CSPs of specified type", async () => {
      const mockCSPs: CSP[] = [
        {
          id: "csp-1",
          name: "Workshop 1",
          type: "workshop",
          latitude: 40.4168,
          longitude: -3.7038,
          city: "Madrid",
          country: "Spain",
          address: "Address 1",
          status: "online",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "csp-2",
          name: "Workshop 2",
          type: "workshop",
          latitude: 40.5,
          longitude: -3.6,
          city: "Madrid",
          country: "Spain",
          address: "Address 2",
          status: "online",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockRepository.findByType.mockResolvedValue({
        data: mockCSPs,
        error: null,
      });

      const result = await service.findByType("workshop");

      expect(result).toEqual(mockCSPs);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByType).toHaveBeenCalledWith("workshop");
    });

    it("should return empty array when no CSPs of type found", async () => {
      mockRepository.findByType.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.findByType("vending_machine");

      expect(result).toEqual([]);
    });

    it("should throw error when repository fails", async () => {
      mockRepository.findByType.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      await expect(service.findByType("workshop")).rejects.toThrow(
        DatabaseError
      );
    });
  });

  describe("findActiveCSPs", () => {
    it("should return active CSPs", async () => {
      const mockCSPs: CSP[] = [
        {
          id: "csp-1",
          name: "Active CSP 1",
          type: "service_point",
          latitude: 40.4168,
          longitude: -3.7038,
          city: "Madrid",
          country: "Spain",
          address: "Address 1",
          status: "online",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockRepository.findActive.mockResolvedValue({
        data: mockCSPs,
        error: null,
      });

      const result = await service.findActiveCSPs();

      expect(result).toEqual(mockCSPs);
      expect(mockRepository.findActive).toHaveBeenCalled();
    });

    it("should return empty array when no active CSPs", async () => {
      mockRepository.findActive.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.findActiveCSPs();

      expect(result).toEqual([]);
    });

    it("should throw error when repository fails", async () => {
      mockRepository.findActive.mockResolvedValue({
        data: null,
        error: { message: "Connection lost" },
      });

      await expect(service.findActiveCSPs()).rejects.toThrow(DatabaseError);
    });
  });
});
