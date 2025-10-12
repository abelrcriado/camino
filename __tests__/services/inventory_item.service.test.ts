import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { InventoryItemService } from "../../src/services/inventory_item.service";
import { InventoryItemRepository } from "../../src/repositories/inventory_item.repository";
import type {
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  InventoryItem,
} from "../../src/dto/inventory_item.dto";

describe("InventoryItemService", () => {
  let service: InventoryItemService;
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
      findByInventory: jest.fn() as jest.Mock,
      findByType: jest.fn() as jest.Mock,
    };

    service = new InventoryItemService(
      mockRepository as InventoryItemRepository
    );
  });

  describe("createInventoryItem", () => {
    it("should create inventory item successfully", async () => {
      const createData: CreateInventoryItemDto = {
        inventory_id: "inv-123",
        name: "Continental Grand Prix 5000",
        description: "Road bike tire 700x25c",
        sku: "TIRE-GP5000-700-25",
        price: 59.99,
        quantity: 10,
        type: "tire",
      };

      const createdItem: InventoryItem = {
        id: "item-123",
        inventory_id: "inv-123",
        name: "Continental Grand Prix 5000",
        description: "Road bike tire 700x25c",
        sku: "TIRE-GP5000-700-25",
        price: 59.99,
        quantity: 10,
        type: "tire",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockRepository.create.mockResolvedValue({
        data: [createdItem],
        error: null,
      });

      const result = await service.createInventoryItem(createData);

      expect(result).toEqual(createdItem);
      expect(mockRepository.create).toHaveBeenCalledWith(createData);
    });
  });

  describe("updateInventoryItem", () => {
    it("should update inventory item successfully", async () => {
      const updateData: UpdateInventoryItemDto = {
        id: "item-1",
        quantity: 15,
        price: 54.99,
      };

      const updatedItem: InventoryItem = {
        id: "item-1",
        inventory_id: "inv-123",
        name: "Continental Grand Prix 5000",
        description: "Road bike tire 700x25c",
        sku: "TIRE-GP5000-700-25",
        price: 54.99,
        quantity: 15,
        type: "tire",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockRepository.update.mockResolvedValue({
        data: [updatedItem],
        error: null,
      });

      const result = await service.updateInventoryItem(updateData);

      expect(result).toEqual(updatedItem);
      expect(mockRepository.update).toHaveBeenCalledWith("item-1", {
        quantity: 15,
        price: 54.99,
      });
    });
  });

  describe("findByInventory", () => {
    it("should return items for inventory", async () => {
      const mockItems: InventoryItem[] = [
        {
          id: "item-1",
          inventory_id: "inv-123",
          name: "Tire Continental",
          description: "Road bike tire",
          sku: "TIRE-001",
          price: 59.99,
          quantity: 10,
          type: "tire",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "item-2",
          inventory_id: "inv-123",
          name: "Brake Pads Shimano",
          description: "Disc brake pads",
          sku: "BRAKE-002",
          price: 24.99,
          quantity: 20,
          type: "brake",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockRepository.findByInventory.mockResolvedValue({
        data: mockItems,
        error: null,
      });

      const result = await service.findByInventory("inv-123");

      expect(result).toEqual(mockItems);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByInventory).toHaveBeenCalledWith("inv-123");
    });

    it("should return empty array when inventory has no items", async () => {
      mockRepository.findByInventory.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.findByInventory("inv-no-items");

      expect(result).toEqual([]);
    });

    it("should throw error when repository fails", async () => {
      mockRepository.findByInventory.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      await expect(service.findByInventory("inv-123")).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("findByType", () => {
    it("should return items of specific type", async () => {
      const mockTires: InventoryItem[] = [
        {
          id: "item-1",
          inventory_id: "inv-123",
          name: "Continental GP5000",
          description: "Road tire",
          sku: "TIRE-001",
          price: 59.99,
          quantity: 10,
          type: "tire",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "item-2",
          inventory_id: "inv-456",
          name: "Schwalbe Marathon",
          description: "Touring tire",
          sku: "TIRE-002",
          price: 44.99,
          quantity: 8,
          type: "tire",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockRepository.findByType.mockResolvedValue({
        data: mockTires,
        error: null,
      });

      const result = await service.findByType("tire");

      expect(result).toEqual(mockTires);
      expect(result).toHaveLength(2);
      expect(result.every((item) => item.type === "tire")).toBe(true);
      expect(mockRepository.findByType).toHaveBeenCalledWith("tire");
    });

    it("should return empty array when no items of type exist", async () => {
      mockRepository.findByType.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.findByType("non-existent-type");

      expect(result).toEqual([]);
    });

    it("should throw error when repository fails", async () => {
      mockRepository.findByType.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      await expect(service.findByType("tire")).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("delete (inherited)", () => {
    it("should delete inventory item successfully", async () => {
      mockRepository.delete.mockResolvedValue({
        error: null,
      });

      await expect(service.delete("item-1")).resolves.not.toThrow();
      expect(mockRepository.delete).toHaveBeenCalledWith("item-1");
    });
  });
});
