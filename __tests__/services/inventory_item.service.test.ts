import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { InventoryItemService } from "@/api/services/inventory_item.service";
import { InventoryItemRepository } from "@/api/repositories/inventory_item.repository";
import type { UpdateInventoryItemDto } from "@/shared/dto/inventory_item.dto";
import { DatabaseError } from "@/api/errors/custom-errors";
import { InventoryItemFactory } from "../helpers/factories";

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
      const createData = InventoryItemFactory.createDto();
      const createdItem = InventoryItemFactory.create(createData);

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
      const itemId = "item-1";
      const updateData: UpdateInventoryItemDto = {
        id: itemId,
        quantity: 15,
        price: 54.99,
      };

      const updatedItem = InventoryItemFactory.create({
        id: itemId,
        quantity: 15,
        price: 54.99,
      });

      mockRepository.update.mockResolvedValue({
        data: [updatedItem],
        error: null,
      });

      const result = await service.updateInventoryItem(updateData);

      expect(result).toEqual(updatedItem);
      expect(mockRepository.update).toHaveBeenCalledWith(itemId, {
        quantity: 15,
        price: 54.99,
      });
    });
  });

  describe("findByInventory", () => {
    it("should return items for inventory", async () => {
      const inventoryId = "inv-123";
      const mockItems = InventoryItemFactory.createMany(2, {
        inventory_id: inventoryId,
      });

      mockRepository.findByInventory.mockResolvedValue({
        data: mockItems,
        error: null,
      });

      const result = await service.findByInventory(inventoryId);

      expect(result).toEqual(mockItems);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByInventory).toHaveBeenCalledWith(inventoryId);
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
        DatabaseError
      );
    });
  });

  describe("findByType", () => {
    it("should return items of specific type", async () => {
      const itemType = "tire";
      const mockTires = InventoryItemFactory.createMany(2, { type: itemType });

      mockRepository.findByType.mockResolvedValue({
        data: mockTires,
        error: null,
      });

      const result = await service.findByType(itemType);

      expect(result).toEqual(mockTires);
      expect(result).toHaveLength(2);
      expect(result.every((item) => item.type === itemType)).toBe(true);
      expect(mockRepository.findByType).toHaveBeenCalledWith(itemType);
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
        DatabaseError
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
