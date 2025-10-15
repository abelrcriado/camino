import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { InventoryItemRepository } from "../../src/repositories/inventory_item.repository";
import { InventoryItem } from "../../src/dto/inventory_item.dto";
import { SupabaseClient } from "@supabase/supabase-js";
import { InventoryItemFactory } from "../helpers/factories";

// Mock Supabase client
/* eslint-disable @typescript-eslint/no-explicit-any */
const mockSupabase = {
  from: jest.fn(),
  select: jest.fn(),
  eq: jest.fn(),
  single: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
} as any as SupabaseClient;
/* eslint-enable @typescript-eslint/no-explicit-any */

describe("InventoryItemRepository", () => {
  let repository: InventoryItemRepository;

  const mockInventoryItem: InventoryItem = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    inventory_id: "550e8400-e29b-41d4-a716-446655440001",
    type: "oil",
    name: "Aceite 5W-30",
    description: "Aceite sintético",
    quantity: 50,
    price: 25.5,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (mockSupabase.from as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.select as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.eq as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.insert as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.update as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.delete as jest.Mock).mockReturnValue(mockSupabase);

    repository = new InventoryItemRepository(mockSupabase);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Constructor", () => {
    it("should initialize with correct table name 'inventory_items'", () => {
      expect(repository).toBeInstanceOf(InventoryItemRepository);
    });

    it("should accept optional SupabaseClient", () => {
      const customRepo = new InventoryItemRepository(mockSupabase);
      expect(customRepo).toBeInstanceOf(InventoryItemRepository);
    });
  });

  describe("findByInventory", () => {
    it("should find items by inventory ID successfully", async () => {
      const mockItems = [
        mockInventoryItem,
        { ...mockInventoryItem, id: "diff-id", name: "Filtro" },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: mockItems,
        error: null,
      });

      const result = await repository.findByInventory(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("inventory_items");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "inventory_id",
        "550e8400-e29b-41d4-a716-446655440001"
      );
      expect(result.data).toEqual(mockItems);
    });

    it("should return empty array when no items found", async () => {
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findByInventory(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(result.data).toEqual([]);
    });

    it("should return error on database failure", async () => {
      const dbError = { message: "Database error" };
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      const result = await repository.findByInventory(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(result.error).toEqual(dbError);
    });

    it("should find multiple items for same inventory", async () => {
      const items = [
        mockInventoryItem,
        {
          ...mockInventoryItem,
          id: "id-2",
          type: "filter",
          name: "Filtro de Aire",
        },
        { ...mockInventoryItem, id: "id-3", type: "brake", name: "Pastillas" },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: items,
        error: null,
      });

      const result = await repository.findByInventory(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(result.data).toHaveLength(3);
    });
  });

  describe("findByType", () => {
    it("should find items by type successfully", async () => {
      const oilItems = [
        mockInventoryItem,
        { ...mockInventoryItem, id: "id-2", name: "Aceite 10W-40" },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: oilItems,
        error: null,
      });

      const result = await repository.findByType("oil");

      expect(mockSupabase.from).toHaveBeenCalledWith("inventory_items");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith("type", "oil");
      expect(result.data).toEqual(oilItems);
    });

    it("should return empty array when no items of type found", async () => {
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findByType("oil");

      expect(result.data).toEqual([]);
    });

    it("should return error on database failure", async () => {
      const dbError = { message: "Query failed" };
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      const result = await repository.findByType("oil");

      expect(result.error).toEqual(dbError);
    });

    it("should find items with different types", async () => {
      const filterItems = [
        { ...mockInventoryItem, type: "filter", name: "Filtro de Aceite" },
        {
          ...mockInventoryItem,
          id: "id-2",
          type: "filter",
          name: "Filtro de Aire",
        },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: filterItems,
        error: null,
      });

      const result = await repository.findByType("filter");

      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].type).toBe("filter");
    });
  });

  describe("BaseRepository methods", () => {
    it("should have access to findById", () => {
      expect(typeof repository.findById).toBe("function");
    });

    it("should have access to findAll", () => {
      expect(typeof repository.findAll).toBe("function");
    });

    it("should have access to create", () => {
      expect(typeof repository.create).toBe("function");
    });

    it("should have access to update", () => {
      expect(typeof repository.update).toBe("function");
    });

    it("should have access to delete", () => {
      expect(typeof repository.delete).toBe("function");
    });
  });
});
