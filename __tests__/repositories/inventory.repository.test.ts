import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { InventoryRepository } from "../../src/repositories/inventory.repository";
import { Inventory } from "../../src/dto/inventory.dto";
import { SupabaseClient } from "@supabase/supabase-js";

// Mock Supabase client
/* eslint-disable @typescript-eslint/no-explicit-any */
const mockSupabase = {
  from: jest.fn(),
  select: jest.fn(),
  eq: jest.fn(),
  filter: jest.fn(),
  single: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
} as any as SupabaseClient;
/* eslint-enable @typescript-eslint/no-explicit-any */

describe("InventoryRepository", () => {
  let repository: InventoryRepository;

  const mockInventory: Inventory = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    service_point_id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Aceite de Motor 5W-30",
    description: "Aceite sintético de alta calidad",
    quantity: 100,
    min_stock: 20,
    max_stock: 200,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (mockSupabase.from as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.select as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.eq as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.filter as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.insert as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.update as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.delete as jest.Mock).mockReturnValue(mockSupabase);

    repository = new InventoryRepository(mockSupabase);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Constructor", () => {
    it("should initialize with correct table name 'inventories'", () => {
      expect(repository).toBeInstanceOf(InventoryRepository);
    });

    it("should accept optional SupabaseClient", () => {
      const customRepo = new InventoryRepository(mockSupabase);
      expect(customRepo).toBeInstanceOf(InventoryRepository);
    });
  });

  describe("findByServicePoint", () => {
    it("should find inventories by service point ID successfully", async () => {
      const mockInventories = [
        mockInventory,
        { ...mockInventory, id: "diff-id", quantity: 150 },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: mockInventories,
        error: null,
      });

      const result = await repository.findByServicePoint(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("inventories");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "service_point_id",
        "550e8400-e29b-41d4-a716-446655440001"
      );
      expect(result.data).toEqual(mockInventories);
    });

    it("should return empty array when no inventories found", async () => {
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findByServicePoint(
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

      const result = await repository.findByServicePoint(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(result.error).toEqual(dbError);
    });

    it("should find multiple inventory items for same service point", async () => {
      const inventories = [
        mockInventory,
        {
          ...mockInventory,
          id: "id-2",
          name: "Filtro de Aceite",
          quantity: 50,
        },
        {
          ...mockInventory,
          id: "id-3",
          name: "Pastillas de Freno",
          quantity: 200,
        },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: inventories,
        error: null,
      });

      const result = await repository.findByServicePoint(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(result.data).toHaveLength(3);
    });
  });

  describe("findLowStock", () => {
    it("should find inventories with low stock", async () => {
      const lowStockItems = [
        { ...mockInventory, quantity: 15, min_stock: 20 },
        { ...mockInventory, id: "id-2", quantity: 10, min_stock: 15 },
      ];
      (mockSupabase.filter as jest.Mock).mockResolvedValue({
        data: lowStockItems,
        error: null,
      });

      const result = await repository.findLowStock();

      expect(mockSupabase.from).toHaveBeenCalledWith("inventories");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.filter).toHaveBeenCalledWith(
        "quantity",
        "lte",
        "min_stock"
      );
      expect(result.data).toEqual(lowStockItems);
    });

    it("should return empty array when no low stock items", async () => {
      (mockSupabase.filter as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findLowStock();

      expect(result.data).toEqual([]);
    });

    it("should return error on database failure", async () => {
      const dbError = { message: "Query failed" };
      (mockSupabase.filter as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      const result = await repository.findLowStock();

      expect(result.error).toEqual(dbError);
    });

    it("should identify items at or below min_stock", async () => {
      const atMinStock = { ...mockInventory, quantity: 20, min_stock: 20 };
      (mockSupabase.filter as jest.Mock).mockResolvedValue({
        data: [atMinStock],
        error: null,
      });

      const result = await repository.findLowStock();

      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].quantity).toBe(20);
      expect(result.data?.[0].min_stock).toBe(20);
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
