import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { InventoryService } from "../../src/services/inventory.service";
import { InventoryRepository } from "../../src/repositories/inventory.repository";
import type { UpdateInventoryDto } from "../../src/dto/inventory.dto";
import { DatabaseError } from "../../src/errors/custom-errors";
import { InventoryFactory } from "../helpers/factories";

describe("InventoryService", () => {
  let service: InventoryService;
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
      findByServicePoint: jest.fn() as jest.Mock,
      findLowStock: jest.fn() as jest.Mock,
    };

    service = new InventoryService(mockRepository as InventoryRepository);
  });

  describe("createInventory", () => {
    it("should create inventory successfully", async () => {
      const createData = InventoryFactory.createDto();
      const createdInventory = InventoryFactory.create(createData);

      mockRepository.create.mockResolvedValue({
        data: [createdInventory],
        error: null,
      });

      const result = await service.createInventory(createData);

      expect(result).toEqual(createdInventory);
      expect(mockRepository.create).toHaveBeenCalledWith(createData);
    });
  });

  describe("updateInventory", () => {
    it("should update inventory successfully", async () => {
      const inventoryId = "inv-1";
      const updateData: UpdateInventoryDto = {
        id: inventoryId,
        quantity: 75,
        min_stock: 15,
      };

      const updatedInventory = InventoryFactory.create({
        id: inventoryId,
        quantity: 75,
        min_stock: 15,
      });

      mockRepository.update.mockResolvedValue({
        data: [updatedInventory],
        error: null,
      });

      const result = await service.updateInventory(updateData);

      expect(result).toEqual(updatedInventory);
      expect(mockRepository.update).toHaveBeenCalledWith(inventoryId, {
        quantity: 75,
        min_stock: 15,
      });
    });
  });

  describe("findByServicePoint", () => {
    it("should return inventory items for service point", async () => {
      const servicePointId = "sp-123";
      const mockInventory = InventoryFactory.createMany(2, {
        service_point_id: servicePointId,
      });

      mockRepository.findByServicePoint.mockResolvedValue({
        data: mockInventory,
        error: null,
      });

      const result = await service.findByServicePoint(servicePointId);

      expect(result).toEqual(mockInventory);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByServicePoint).toHaveBeenCalledWith(
        servicePointId
      );
    });

    it("should return empty array when service point has no inventory", async () => {
      mockRepository.findByServicePoint.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.findByServicePoint("sp-no-inventory");

      expect(result).toEqual([]);
    });

    it("should throw error when repository fails", async () => {
      mockRepository.findByServicePoint.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      await expect(service.findByServicePoint("sp-123")).rejects.toThrow(
        DatabaseError
      );
    });
  });

  describe("findLowStock", () => {
    it("should return items with low stock", async () => {
      // Crear items con low stock: quantity < min_stock
      const mockLowStockItems = [
        InventoryFactory.create({ quantity: 4, min_stock: 5 }),
        InventoryFactory.create({ quantity: 2, min_stock: 10 }),
      ];

      mockRepository.findLowStock.mockResolvedValue({
        data: mockLowStockItems,
        error: null,
      });

      const result = await service.findLowStock();

      expect(result).toEqual(mockLowStockItems);
      expect(result).toHaveLength(2);
      expect(result.every((item) => item.quantity < item.min_stock)).toBe(true);
      expect(mockRepository.findLowStock).toHaveBeenCalledWith();
    });

    it("should return empty array when no items have low stock", async () => {
      mockRepository.findLowStock.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.findLowStock();

      expect(result).toEqual([]);
    });

    it("should throw error when repository fails", async () => {
      mockRepository.findLowStock.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      await expect(service.findLowStock()).rejects.toThrow(DatabaseError);
    });
  });

  describe("delete (inherited)", () => {
    it("should delete inventory successfully", async () => {
      mockRepository.delete.mockResolvedValue({
        error: null,
      });

      await expect(service.delete("inv-1")).resolves.not.toThrow();
      expect(mockRepository.delete).toHaveBeenCalledWith("inv-1");
    });
  });
});
