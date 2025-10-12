import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { InventoryService } from "../../src/services/inventory.service";
import { InventoryRepository } from "../../src/repositories/inventory.repository";
import type {
  CreateInventoryDto,
  UpdateInventoryDto,
  Inventory,
} from "../../src/dto/inventory.dto";

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
      const createData: CreateInventoryDto = {
        service_point_id: "sp-123",
        name: "Bike Tires",
        description: "Road bike tires 700x23c",
        quantity: 50,
        min_stock: 10,
        max_stock: 100,
      };

      const createdInventory: Inventory = {
        id: "inv-123",
        service_point_id: "sp-123",
        name: "Bike Tires",
        description: "Road bike tires 700x23c",
        quantity: 50,
        min_stock: 10,
        max_stock: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

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
      const updateData: UpdateInventoryDto = {
        id: "inv-1",
        quantity: 75,
        min_stock: 15,
      };

      const updatedInventory: Inventory = {
        id: "inv-1",
        service_point_id: "sp-123",
        name: "Bike Tires",
        description: "Road bike tires 700x23c",
        quantity: 75,
        min_stock: 15,
        max_stock: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockRepository.update.mockResolvedValue({
        data: [updatedInventory],
        error: null,
      });

      const result = await service.updateInventory(updateData);

      expect(result).toEqual(updatedInventory);
      expect(mockRepository.update).toHaveBeenCalledWith("inv-1", {
        quantity: 75,
        min_stock: 15,
      });
    });
  });

  describe("findByServicePoint", () => {
    it("should return inventory items for service point", async () => {
      const mockInventory: Inventory[] = [
        {
          id: "inv-1",
          service_point_id: "sp-123",
          name: "Bike Tires",
          description: "Road bike tires",
          quantity: 50,
          min_stock: 10,
          max_stock: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "inv-2",
          service_point_id: "sp-123",
          name: "Brake Pads",
          description: "Disc brake pads",
          quantity: 30,
          min_stock: 5,
          max_stock: 50,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockRepository.findByServicePoint.mockResolvedValue({
        data: mockInventory,
        error: null,
      });

      const result = await service.findByServicePoint("sp-123");

      expect(result).toEqual(mockInventory);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByServicePoint).toHaveBeenCalledWith("sp-123");
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
        "Database error"
      );
    });
  });

  describe("findLowStock", () => {
    it("should return items with low stock", async () => {
      const mockLowStockItems: Inventory[] = [
        {
          id: "inv-1",
          service_point_id: "sp-123",
          name: "Brake Pads",
          description: "Disc brake pads",
          quantity: 4,
          min_stock: 5,
          max_stock: 50,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "inv-2",
          service_point_id: "sp-456",
          name: "Chain Lubricant",
          description: "Bike chain oil",
          quantity: 2,
          min_stock: 10,
          max_stock: 30,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
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

      await expect(service.findLowStock()).rejects.toThrow("Database error");
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
