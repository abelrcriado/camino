/* eslint-disable @typescript-eslint/no-explicit-any */
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../../pages/api/productos/sku/[sku]";
import { ProductoService } from "@/api/services/producto.service";
import { ProductoRepository } from "@/api/repositories/producto.repository";

// Mock de dependencias
jest.mock("@/api/services/producto.service");
jest.mock("@/api/repositories/producto.repository");

describe("/api/productos/sku/[sku]", () => {
  let mockFindBySku: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFindBySku = jest.fn();

    (
      ProductoRepository as jest.MockedClass<typeof ProductoRepository>
    ).mockImplementation(() => ({} as any));

    (
      ProductoService as jest.MockedClass<typeof ProductoService>
    ).mockImplementation(
      () =>
        ({
          findBySku: mockFindBySku,
        } as any)
    );
  });

  describe("GET /api/productos/sku/[sku]", () => {
    it("debe retornar un producto por SKU exitosamente", async () => {
      const testSku = "BIKE-PUMP-001";
      const mockProducto = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        nombre: "Bomba de aire portátil",
        sku: testSku,
        category_id: "cat-123",
        subcategory_id: "subcat-456",
        descripcion: "Bomba compacta para ciclistas",
        marca: "Shimano",
        modelo: "PRO-2024",
        precio_base: 15.99,
        is_active: true,
        perecedero: false,
        imagen_url: "https://example.com/pump.jpg",
      };

      mockFindBySku.mockResolvedValue(mockProducto);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { sku: testSku },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual(mockProducto);
      expect(mockFindBySku).toHaveBeenCalledTimes(1);
      expect(mockFindBySku).toHaveBeenCalledWith(testSku);
    });

    it("debe retornar 400 si el SKU no está presente", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "SKU es requerido",
      });
      expect(mockFindBySku).not.toHaveBeenCalled();
    });

    it("debe retornar 400 si el SKU no es string", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { sku: ["array", "of", "skus"] },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "SKU es requerido",
      });
      expect(mockFindBySku).not.toHaveBeenCalled();
    });

    it("debe retornar 400 si el SKU está vacío", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { sku: "   " }, // Solo espacios
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "SKU no puede estar vacío",
      });
      expect(mockFindBySku).not.toHaveBeenCalled();
    });

    it("debe retornar 404 si el producto no existe", async () => {
      mockFindBySku.mockResolvedValue(null);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { sku: "NONEXISTENT-SKU" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({
        error: "Producto no encontrado",
      });
    });

    it("debe buscar por SKU con caracteres especiales", async () => {
      const specialSku = "BIKE-PUMP_001-V2";
      mockFindBySku.mockResolvedValue({
        id: "123",
        sku: specialSku,
        nombre: "Test",
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { sku: specialSku },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockFindBySku).toHaveBeenCalledWith(specialSku);
    });

    it("debe preservar espacios en SKU si existen", async () => {
      const skuWithSpaces = "BIKE PUMP 001";
      mockFindBySku.mockResolvedValue({
        id: "123",
        sku: skuWithSpaces,
        nombre: "Test",
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { sku: skuWithSpaces },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockFindBySku).toHaveBeenCalledWith(skuWithSpaces);
    });

    it("debe retornar 500 para errores internos (asyncHandler)", async () => {
      mockFindBySku.mockRejectedValue(new Error("Database connection failed"));

      const { req, res} = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { sku: "BIKE-PUMP-001" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = res._getJSONData();
      expect(data.code).toBe("INTERNAL_SERVER_ERROR");
      expect(data.error).toBeDefined();
    });

    it("debe manejar errores no-Error objects (asyncHandler)", async () => {
      mockFindBySku.mockRejectedValue("String error");

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { sku: "BIKE-PUMP-001" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = res._getJSONData();
      expect(data.code).toBe("INTERNAL_SERVER_ERROR");
      expect(data.error).toBeDefined();
    });
  });

  describe("Métodos HTTP no permitidos", () => {
    const testSku = "BIKE-PUMP-001";

    it("debe retornar 405 para POST", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { sku: testSku },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res._getJSONData()).toEqual({
        error: "Método no permitido",
      });
      expect(mockFindBySku).not.toHaveBeenCalled();
    });

    it("debe retornar 405 para PUT", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        query: { sku: testSku },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(mockFindBySku).not.toHaveBeenCalled();
    });

    it("debe retornar 405 para DELETE", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        query: { sku: testSku },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(mockFindBySku).not.toHaveBeenCalled();
    });
  });

  describe("Integración con servicio", () => {
    it("debe crear instancias de ProductoRepository y ProductoService", async () => {
      mockFindBySku.mockResolvedValue({ id: "123", sku: "TEST" });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { sku: "TEST" },
      });

      await handler(req, res);

      expect(ProductoRepository).toHaveBeenCalledTimes(1);
      expect(ProductoService).toHaveBeenCalledTimes(1);
      expect(ProductoService).toHaveBeenCalledWith(expect.any(Object));
    });
  });
});
