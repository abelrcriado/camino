/**
 * Tests para producto.repository.ts
 * Tests con mocks Supabase y dependency injection
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { SupabaseClient } from "@supabase/supabase-js";
import { ProductoRepository } from "@/repositories/producto.repository";

type MockedFunction = ReturnType<typeof jest.fn>;

// Mock Supabase client
const mockSupabase = {
  from: jest.fn() as MockedFunction,
} as unknown as SupabaseClient;

describe("ProductoRepository", () => {
  let repository: ProductoRepository;

  const mockProducto = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    sku: "TEST-001",
    nombre: "Producto Test",
    descripcion: "Descripción test",
    category_id: "cat-123",
    costo_base: 100,
    precio_venta: 200,
    unidad_medida: "unidad",
    is_active: true,
    created_at: "2025-10-10T10:00:00Z",
    updated_at: "2025-10-10T10:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new ProductoRepository(mockSupabase);
  });

  describe("findBySku", () => {
    it("debe encontrar producto por SKU", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProducto,
          error: null,
        }),
      } as any;

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.findBySku("TEST-001");

      expect(result).toEqual(mockProducto);
      expect(mockSupabase.from).toHaveBeenCalledWith("productos");
      expect(mockChain.eq).toHaveBeenCalledWith("sku", "TEST-001");
    });

    it("debe retornar null si no encuentra producto", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: "PGRST116" },
        }),
      } as any;

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.findBySku("NONEXISTENT");

      expect(result).toBeNull();
    });

    it("debe propagar error de base de datos", async () => {
      const dbError = { code: "PGRST500", message: "Database error" };
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: dbError,
        }),
      } as any;

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      await expect(repository.findBySku("TEST-001")).rejects.toEqual(dbError);
    });
  });

  describe("skuExists", () => {
    it("debe retornar true si SKU existe", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: mockProducto.id },
          error: null,
        }),
      } as any;

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.skuExists("TEST-001");

      expect(result).toBe(true);
      expect(mockChain.eq).toHaveBeenCalledWith("sku", "TEST-001");
    });

    it("debe retornar false si SKU no existe", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: "PGRST116" },
        }),
      } as any;

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.skuExists("NONEXISTENT");

      expect(result).toBe(false);
    });

    it("debe excluir ID específico en validación", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: "PGRST116" },
        }),
      } as any;

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const excludeId = "456e7890-e89b-12d3-a456-426614174000";
      await repository.skuExists("TEST-001", excludeId);

      expect(mockChain.neq).toHaveBeenCalledWith("id", excludeId);
    });

    it("debe propagar error de base de datos", async () => {
      const dbError = { code: "PGRST500", message: "Database error" };
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: dbError,
        }),
      } as any;

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      await expect(repository.skuExists("TEST-001")).rejects.toEqual(dbError);
    });
  });

  describe("findConStock", () => {
    const mockProductosInventario = [
      {
        producto_id: "123",
        sku: "TEST-001",
        nombre: "Producto 1",
        category_id: "cat-1",
        stock_total: 100,
      },
      {
        producto_id: "456",
        sku: "TEST-002",
        nombre: "Producto 2",
        category_id: "cat-1",
        stock_total: 50,
      },
    ];

    it("debe obtener productos sin filtros", async () => {
      const mockChain = {
        select: jest.fn().mockResolvedValue({
          data: mockProductosInventario,
          error: null,
        }),
      } as any;

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.findConStock();

      expect(result).toEqual(mockProductosInventario);
      expect(mockSupabase.from).toHaveBeenCalledWith("v_productos_inventario");
    });

    it("debe aplicar filtro por SKU", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [mockProductosInventario[0]],
          error: null,
        }),
      } as any;

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      await repository.findConStock({ sku: "TEST-001" });

      expect(mockChain.eq).toHaveBeenCalledWith("sku", "TEST-001");
    });

    it("debe aplicar filtro por nombre (like)", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockResolvedValue({
          data: mockProductosInventario,
          error: null,
        }),
      } as any;

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      await repository.findConStock({ nombre: "Producto" });

      expect(mockChain.ilike).toHaveBeenCalledWith("nombre", "%Producto%");
    });

    it("debe aplicar filtro de búsqueda general", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockResolvedValue({
          data: mockProductosInventario,
          error: null,
        }),
      } as any;

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      await repository.findConStock({ search: "test" });

      expect(mockChain.or).toHaveBeenCalled();
    });

    it("debe aplicar filtros combinados", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValue({
          data: mockProductosInventario,
          error: null,
        }),
      } as any;

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      await repository.findConStock({
        category_id: "cat-1",
        precio_min: 100,
        precio_max: 500,
      });

      expect(mockChain.eq).toHaveBeenCalledWith("category_id", "cat-1");
      expect(mockChain.gte).toHaveBeenCalledWith("precio_venta", 100);
      expect(mockChain.lte).toHaveBeenCalledWith("precio_venta", 500);
    });

    it("debe retornar array vacío en caso de error", async () => {
      const mockChain = {
        select: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Error" },
        }),
      } as any;

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      await expect(repository.findConStock()).rejects.toBeTruthy();
    });
  });

  describe("checkDisponible", () => {
    it("debe retornar true si producto está activo", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { is_active: true },
          error: null,
        }),
      } as any;

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.checkDisponible(mockProducto.id);

      expect(result).toBe(true);
      expect(mockChain.eq).toHaveBeenCalledWith("id", mockProducto.id);
    });

    it("debe retornar false si producto está inactivo", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { is_active: false },
          error: null,
        }),
      } as any;

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.checkDisponible(mockProducto.id);

      expect(result).toBe(false);
    });

    it("debe retornar false si producto no existe", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: "PGRST116" },
        }),
      } as any;

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.checkDisponible("nonexistent-id");

      expect(result).toBe(false);
    });

    it("debe propagar error de base de datos", async () => {
      const dbError = { code: "PGRST500", message: "Database error" };
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: dbError,
        }),
      } as any;

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      await expect(repository.checkDisponible(mockProducto.id)).rejects.toEqual(
        dbError
      );
    });
  });

  describe("getProximosCaducar", () => {
    const mockProductosPerecederos = [
      { ...mockProducto, perecedero: true, dias_caducidad: 15 },
      { ...mockProducto, id: "456", perecedero: true, meses_caducidad: 1 },
    ];

    it("debe obtener productos próximos a caducar con umbral default", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockResolvedValue({
          data: mockProductosPerecederos,
          error: null,
        }),
      } as any;

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.getProximosCaducar();

      expect(result).toEqual(mockProductosPerecederos);
      expect(mockSupabase.from).toHaveBeenCalledWith("productos");
    });

    it("debe aplicar umbral personalizado", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockResolvedValue({
          data: mockProductosPerecederos,
          error: null,
        }),
      } as any;

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      await repository.getProximosCaducar(60);

      expect(mockChain.or).toHaveBeenCalled();
    });

    it("debe retornar array vacío si no hay productos", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      } as any;

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.getProximosCaducar();

      expect(result).toEqual([]);
    });
  });

  describe("getCategorias", () => {
    const mockCategorias = [
      { category_id: "cat-1", category_name: "Bebidas" },
      { category_id: "cat-2", category_name: "Snacks" },
    ];

    it("debe obtener categorías únicas", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        not: jest.fn().mockResolvedValue({
          data: mockCategorias,
          error: null,
        }),
      } as any;

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.getCategorias();

      expect(result).toEqual(mockCategorias);
      expect(mockSupabase.from).toHaveBeenCalledWith("v_productos_inventario");
      expect(mockChain.eq).toHaveBeenCalledWith("is_active", true);
    });

    it("debe eliminar duplicados", async () => {
      const mockDuplicados = [
        { category_id: "cat-1", category_name: "Bebidas" },
        { category_id: "cat-1", category_name: "Bebidas" },
        { category_id: "cat-2", category_name: "Snacks" },
      ];
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        not: jest.fn().mockResolvedValue({
          data: mockDuplicados,
          error: null,
        }),
      } as any;

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.getCategorias();

      expect(result.length).toBe(2);
    });
  });

  describe("getMarcas", () => {
    const mockMarcas = [
      { marca: "Coca-Cola" },
      { marca: "Pepsi" },
      { marca: "Fanta" },
    ];

    it("debe obtener marcas únicas", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        not: jest.fn().mockResolvedValue({
          data: mockMarcas,
          error: null,
        }),
      } as any;

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.getMarcas();

      expect(result).toEqual(["Coca-Cola", "Pepsi", "Fanta"]);
      expect(mockSupabase.from).toHaveBeenCalledWith("productos");
      expect(mockChain.eq).toHaveBeenCalledWith("is_active", true);
    });

    it("debe eliminar duplicados", async () => {
      const mockDuplicados = [
        { marca: "Coca-Cola" },
        { marca: "Coca-Cola" },
        { marca: "Pepsi" },
      ];
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        not: jest.fn().mockResolvedValue({
          data: mockDuplicados,
          error: null,
        }),
      } as any;

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.getMarcas();

      expect(result.length).toBe(2);
      expect(result).toContain("Coca-Cola");
      expect(result).toContain("Pepsi");
    });
  });
});
