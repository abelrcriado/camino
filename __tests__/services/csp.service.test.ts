import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { CSPService } from "@/api/services/csp.service";
import { CSPRepository } from "@/api/repositories/csp.repository";
import type { UpdateCSPDto, CSP, CSPFilters } from "@/shared/dto/csp.dto";
import { DatabaseError } from "@/api/errors/custom-errors";
import { CSPFactory } from "../helpers/factories";

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
      const mockCSPs = CSPFactory.createMany(1, { status: "online" });

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
      const createData = CSPFactory.createDto({ status: "online" });
      const createdCSP = CSPFactory.create({
        name: createData.name,
        type: createData.type,
        status: "online",
      });

      mockRepository.create.mockResolvedValue({
        data: [createdCSP],
        error: null,
      });

      const result = await service.createCSP(createData);

      expect(result).toEqual(createdCSP);
      expect(mockRepository.create).toHaveBeenCalledWith(createData);
    });

    it("should default status to active if not provided", async () => {
      const createData = CSPFactory.createDto({
        type: "workshop",
        status: undefined,
      });
      const createdCSP = CSPFactory.create({
        name: createData.name,
        type: "workshop",
        status: "online",
      });

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
      const cspId = CSPFactory.create().id;
      const updateData: UpdateCSPDto = {
        id: cspId,
        name: "Updated Name",
        status: "offline",
      };

      const updatedCSP = CSPFactory.create({
        id: cspId,
        name: "Updated Name",
        status: "offline",
      });

      mockRepository.update.mockResolvedValue({
        data: [updatedCSP],
        error: null,
      });

      const result = await service.updateCSP(updateData);

      expect(result).toEqual(updatedCSP);
      expect(mockRepository.update).toHaveBeenCalledWith(cspId, {
        name: "Updated Name",
        status: "offline",
      });
    });
  });

  describe("deleteCSP", () => {
    it("should delete CSP successfully", async () => {
      const cspId = CSPFactory.create().id;

      mockRepository.delete.mockResolvedValue({
        error: null,
      });

      await expect(service.deleteCSP(cspId)).resolves.not.toThrow();
      expect(mockRepository.delete).toHaveBeenCalledWith(cspId);
    });
  });

  describe("findByType", () => {
    it("should return CSPs of specified type", async () => {
      const mockCSPs = CSPFactory.createMany(2, { type: "workshop", status: "online" });

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
      const mockCSPs = CSPFactory.createMany(1, { status: "online" });

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
