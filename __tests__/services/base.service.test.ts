import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { BaseService } from "../../src/services/base.service";
import { BaseRepository } from "../../src/repositories/base.repository";
import { NotFoundError, DatabaseError } from "../../src/errors/custom-errors";
import type {
  PaginationParams,
  QueryFilters,
  SortParams,
} from "../../src/types/common.types";

// Clase concreta para testing (BaseService es abstracta)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class TestService extends BaseService<any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(repository: BaseRepository<any>) {
    super(repository);
  }
}

describe("BaseService", () => {
  let service: TestService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockRepository: any;

  beforeEach(() => {
    // Reset mocks antes de cada test
    jest.clearAllMocks();

    // Crear mock manual del repository
    mockRepository = {
      findAll: jest.fn() as jest.Mock,
      findById: jest.fn() as jest.Mock,
      create: jest.fn() as jest.Mock,
      update: jest.fn() as jest.Mock,
      delete: jest.fn() as jest.Mock,
    };

    // Crear instancia del service con el mock
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    service = new TestService(mockRepository as BaseRepository<any>);
  });

  describe("findAll", () => {
    it("should return paginated data successfully", async () => {
      const mockData = [
        { id: "1", name: "Test 1" },
        { id: "2", name: "Test 2" },
      ];
      const mockCount = 10;

      mockRepository.findAll.mockResolvedValue({
        data: mockData,
        error: null,
        count: mockCount,
      });

      const pagination: PaginationParams = { page: 1, limit: 2 };
      const result = await service.findAll({}, pagination);

      expect(result).toEqual({
        data: mockData,
        pagination: {
          page: 1,
          limit: 2,
          total: 10,
          totalPages: 5,
          hasMore: true,
        },
      });
      expect(mockRepository.findAll).toHaveBeenCalledWith(
        {},
        pagination,
        undefined
      );
    });

    it("should use default pagination values when not provided", async () => {
      const mockData = [{ id: "1" }];
      mockRepository.findAll.mockResolvedValue({
        data: mockData,
        error: null,
        count: 1,
      });

      const result = await service.findAll();

      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasMore: false,
      });
    });

    it("should return empty array when no data", async () => {
      mockRepository.findAll.mockResolvedValue({
        data: null,
        error: null,
        count: 0,
      });

      const result = await service.findAll();

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it("should apply filters correctly", async () => {
      const filters: QueryFilters = { status: "active" };
      mockRepository.findAll.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      await service.findAll(filters);

      expect(mockRepository.findAll).toHaveBeenCalledWith(
        filters,
        undefined,
        undefined
      );
    });

    it("should apply sorting correctly", async () => {
      const sort: SortParams = { field: "created_at", order: "desc" };
      mockRepository.findAll.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      await service.findAll({}, undefined, sort);

      expect(mockRepository.findAll).toHaveBeenCalledWith({}, undefined, sort);
    });

    it("should calculate hasMore correctly when on last page", async () => {
      mockRepository.findAll.mockResolvedValue({
        data: [{ id: "1" }],
        error: null,
        count: 5,
      });

      const result = await service.findAll({}, { page: 5, limit: 1 });

      expect(result.pagination.hasMore).toBe(false);
    });

    it("should throw DatabaseError when repository returns error", async () => {
      mockRepository.findAll.mockResolvedValue({
        data: null,
        error: {
          message: "Database connection failed",
          details: null,
          hint: null,
        },
        count: null,
      });

      await expect(service.findAll()).rejects.toThrow(DatabaseError);
      await expect(service.findAll()).rejects.toThrow(
        "Database connection failed"
      );
    });
  });

  describe("findById", () => {
    it("should return data when record exists", async () => {
      const mockData = { id: "test-id-123", name: "Test Item" };
      mockRepository.findById.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await service.findById("test-id-123");

      expect(result).toEqual(mockData);
      expect(mockRepository.findById).toHaveBeenCalledWith("test-id-123");
    });

    it("should throw NotFoundError when record does not exist", async () => {
      mockRepository.findById.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(service.findById("non-existent-id")).rejects.toThrow(
        NotFoundError
      );
      await expect(service.findById("non-existent-id")).rejects.toThrow(
        "Registro con ID non-existent-id no encontrado"
      );
    });

    it("should throw DatabaseError when repository returns error", async () => {
      mockRepository.findById.mockResolvedValue({
        data: null,
        error: { message: "Query error", details: null, hint: null },
      });

      await expect(service.findById("test-id")).rejects.toThrow(DatabaseError);
      await expect(service.findById("test-id")).rejects.toThrow("Query error");
    });
  });

  describe("create", () => {
    it("should create and return new record successfully", async () => {
      const inputData = { name: "New Item" };
      const createdData = { id: "new-id-123", ...inputData };

      mockRepository.create.mockResolvedValue({
        data: [createdData],
        error: null,
      });

      const result = await service.create(inputData);

      expect(result).toEqual(createdData);
      expect(mockRepository.create).toHaveBeenCalledWith(inputData);
    });

    it("should throw DatabaseError when repository returns error", async () => {
      const inputData = { name: "Test" };
      mockRepository.create.mockResolvedValue({
        data: null,
        error: { message: "Constraint violation", details: null, hint: null },
      });

      await expect(service.create(inputData)).rejects.toThrow(DatabaseError);
      await expect(service.create(inputData)).rejects.toThrow(
        "Constraint violation"
      );
    });

    it("should throw DatabaseError when no data is returned", async () => {
      mockRepository.create.mockResolvedValue({
        data: [],
        error: null,
      });

      await expect(service.create({ name: "Test" })).rejects.toThrow(
        DatabaseError
      );
      await expect(service.create({ name: "Test" })).rejects.toThrow(
        "No se pudo crear el registro"
      );
    });

    it("should throw DatabaseError when data is null", async () => {
      mockRepository.create.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(service.create({ name: "Test" })).rejects.toThrow(
        DatabaseError
      );
    });
  });

  describe("update", () => {
    it("should update and return updated record successfully", async () => {
      const updateData = { name: "Updated Name" };
      const updatedRecord = { id: "update-id-123", ...updateData };

      mockRepository.update.mockResolvedValue({
        data: [updatedRecord],
        error: null,
      });

      const result = await service.update("update-id-123", updateData);

      expect(result).toEqual(updatedRecord);
      expect(mockRepository.update).toHaveBeenCalledWith(
        "update-id-123",
        updateData
      );
    });

    it("should throw NotFoundError when record does not exist", async () => {
      mockRepository.update.mockResolvedValue({
        data: [],
        error: null,
      });

      await expect(
        service.update("non-existent-id", { name: "Test" })
      ).rejects.toThrow(NotFoundError);
      await expect(
        service.update("non-existent-id", { name: "Test" })
      ).rejects.toThrow("Registro con ID non-existent-id no encontrado");
    });

    it("should throw NotFoundError when data is null", async () => {
      mockRepository.update.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(service.update("test-id", { name: "Test" })).rejects.toThrow(
        NotFoundError
      );
    });

    it("should throw DatabaseError when repository returns error", async () => {
      mockRepository.update.mockResolvedValue({
        data: null,
        error: { message: "Update failed", details: null, hint: null },
      });

      await expect(service.update("test-id", { name: "Test" })).rejects.toThrow(
        DatabaseError
      );
      await expect(service.update("test-id", { name: "Test" })).rejects.toThrow(
        "Update failed"
      );
    });
  });

  describe("delete", () => {
    it("should delete record successfully", async () => {
      mockRepository.delete.mockResolvedValue({
        error: null,
      });

      await expect(service.delete("delete-id-123")).resolves.not.toThrow();
      expect(mockRepository.delete).toHaveBeenCalledWith("delete-id-123");
    });

    it("should throw DatabaseError when repository returns error", async () => {
      mockRepository.delete.mockResolvedValue({
        error: { message: "Delete failed", details: null, hint: null },
      });

      await expect(service.delete("test-id")).rejects.toThrow(DatabaseError);
      await expect(service.delete("test-id")).rejects.toThrow("Delete failed");
    });

    it("should complete even if record does not exist", async () => {
      // Supabase delete no falla si el registro no existe
      mockRepository.delete.mockResolvedValue({
        error: null,
      });

      await expect(service.delete("non-existent-id")).resolves.not.toThrow();
    });
  });
});
