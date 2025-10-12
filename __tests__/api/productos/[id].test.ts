/* eslint-disable @typescript-eslint/no-explicit-any */
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../pages/api/productos/[id]";
import { ProductoController } from "../../../src/controllers/producto.controller";

// Mock del controller
jest.mock("../../../src/controllers/producto.controller");

describe("/api/productos/[id]", () => {
  let mockHandle: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockHandle = jest.fn();
    (
      ProductoController as jest.MockedClass<typeof ProductoController>
    ).mockImplementation(
      () =>
        ({
          handle: mockHandle,
        } as any)
    );
  });

  describe("GET /api/productos/[id]", () => {
    it("debe obtener un producto exitosamente con ID válido", async () => {
      const testId = "123e4567-e89b-12d3-a456-426614174000";
      const mockProducto = {
        id: testId,
        nombre: "Bomba de aire portátil",
        sku: "BIKE-PUMP-001",
        category_id: "cat-123",
        precio_base: 15.99,
        is_active: true,
        perecedero: false,
      };

      mockHandle.mockImplementation(async (_req, res) => {
        return res.status(200).json(mockProducto);
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: testId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockHandle).toHaveBeenCalledTimes(1);
      expect(mockHandle).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          query: { id: testId },
        }),
        res
      );
    });

    it("debe retornar 400 si el ID no está presente", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "ID de producto es requerido",
      });
      expect(mockHandle).not.toHaveBeenCalled();
    });

    it("debe retornar 400 si el ID no es string", async () => {
      const { req, res} = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: ["multiple", "ids"] },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "ID debe ser un string",
      });
      expect(mockHandle).not.toHaveBeenCalled();
    });
  });

  describe("PUT /api/productos/[id]", () => {
    it("debe actualizar un producto exitosamente", async () => {
      const testId = "123e4567-e89b-12d3-a456-426614174000";
      const updateData = {
        nombre: "Bomba actualizada",
        precio_base: 18.99,
        is_active: false,
      };

      const mockUpdated = {
        id: testId,
        ...updateData,
        sku: "BIKE-PUMP-001",
      };

      mockHandle.mockImplementation(async (_req, res) => {
        return res.status(200).json([mockUpdated]);
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        query: { id: testId },
        body: updateData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockHandle).toHaveBeenCalledTimes(1);
      expect(mockHandle).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "PUT",
          body: { ...updateData, id: testId },
        }),
        res
      );
    });

    it("debe inyectar el ID en el body para actualización", async () => {
      const testId = "123e4567-e89b-12d3-a456-426614174000";
      const updateData = {
        marca: "Shimano",
        modelo: "PRO-2024",
      };

      mockHandle.mockImplementation(async (_req, res) => {
        return res.status(200).json([{ id: testId, ...updateData }]);
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        query: { id: testId },
        body: updateData,
      });

      await handler(req, res);

      expect(mockHandle).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({ id: testId }),
        }),
        res
      );
    });

    it("debe actualizar categorías del producto", async () => {
      const testId = "123e4567-e89b-12d3-a456-426614174000";
      const updateData = {
        category_id: "cat-456",
        subcategory_id: "subcat-789",
      };

      mockHandle.mockImplementation(async (_req, res) => {
        return res.status(200).json([{ id: testId, ...updateData }]);
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        query: { id: testId },
        body: updateData,
      });

      await handler(req, res);

      expect(mockHandle).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            category_id: "cat-456",
            subcategory_id: "subcat-789",
          }),
        }),
        res
      );
    });

    it("debe actualizar flags booleanos", async () => {
      const testId = "123e4567-e89b-12d3-a456-426614174000";
      const updateData = {
        is_active: true,
        perecedero: true,
      };

      mockHandle.mockImplementation(async (_req, res) => {
        return res.status(200).json([{ id: testId, ...updateData }]);
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        query: { id: testId },
        body: updateData,
      });

      await handler(req, res);

      expect(mockHandle).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            is_active: true,
            perecedero: true,
          }),
        }),
        res
      );
    });
  });

  describe("DELETE /api/productos/[id]", () => {
    it("debe eliminar un producto exitosamente", async () => {
      const testId = "123e4567-e89b-12d3-a456-426614174000";

      mockHandle.mockImplementation(async (_req, res) => {
        return res
          .status(200)
          .json({ message: "Producto eliminado exitosamente" });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        query: { id: testId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockHandle).toHaveBeenCalledTimes(1);
      expect(mockHandle).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "DELETE",
          body: { id: testId },
        }),
        res
      );
    });

    it("debe inyectar el ID en el body para eliminación", async () => {
      const testId = "123e4567-e89b-12d3-a456-426614174000";

      mockHandle.mockImplementation(async (_req, res) => {
        return res
          .status(200)
          .json({ message: "Producto eliminado exitosamente" });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        query: { id: testId },
      });

      await handler(req, res);

      // Verificar que el body contiene SOLO el ID
      expect(mockHandle).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { id: testId },
        }),
        res
      );
    });
  });

  describe("Método HTTP no permitido", () => {
    it("debe retornar 405 para métodos no soportados", async () => {
      const testId = "123e4567-e89b-12d3-a456-426614174000";

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PATCH",
        query: { id: testId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res._getJSONData()).toEqual({
        error: "Método no permitido",
      });
      expect(mockHandle).not.toHaveBeenCalled();
    });

    it("debe retornar 405 para POST", async () => {
      const testId = "123e4567-e89b-12d3-a456-426614174000";

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: testId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(mockHandle).not.toHaveBeenCalled();
    });
  });

  describe("Validación de parámetros", () => {
    it("debe validar que el ID sea string antes de delegar", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: 123 as any },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(mockHandle).not.toHaveBeenCalled();
    });

    it("debe validar que el ID esté presente antes de delegar", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        query: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "ID de producto es requerido",
      });
      expect(mockHandle).not.toHaveBeenCalled();
    });
  });
});
