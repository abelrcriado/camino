/**
 * Tests para /api/ventas-app/index.ts
 * Endpoint para listar y crear ventas de la app
 */

import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../pages/api/ventas-app/index";
import { VentaAppController } from "@/api/controllers/venta_app.controller";

// Mock del controller
jest.mock("@/api/controllers/venta_app.controller");

describe("/api/ventas-app", () => {
  let mockHandle: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock del controller
    mockHandle = jest.fn();
    (
      VentaAppController as jest.MockedClass<typeof VentaAppController>
    ).mockImplementation(() => {
      return {
        handle: mockHandle,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
    });
  });

  describe("GET /api/ventas-app", () => {
    it("debe listar todas las ventas sin filtros", async () => {
      const mockVentas = [
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          user_id: "550e8400-e29b-41d4-a716-446655440002",
          slot_id: "550e8400-e29b-41d4-a716-446655440003",
          cantidad: 2,
          precio_unitario: 15.5,
          precio_total: 31.0,
          estado: "pagada",
          codigo_retiro: "ABC123",
          created_at: "2025-01-15T10:00:00Z",
        },
      ];

      mockHandle.mockImplementation((req, res) => {
        return res.status(200).json({
          data: mockVentas,
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {},
      });

      await handler(req, res);

      expect(mockHandle).toHaveBeenCalledWith(req, res);
      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.data).toEqual(mockVentas);
      expect(data.pagination).toBeDefined();
    });

    it("debe filtrar ventas por user_id", async () => {
      const userId = "550e8400-e29b-41d4-a716-446655440002";
      const mockVentas = [
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          user_id: userId,
          slot_id: "550e8400-e29b-41d4-a716-446655440003",
          cantidad: 1,
          precio_total: 15.5,
          estado: "pagada",
        },
      ];

      mockHandle.mockImplementation((req, res) => {
        return res.status(200).json({
          data: mockVentas,
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { user_id: userId },
      });

      await handler(req, res);

      expect(mockHandle).toHaveBeenCalledWith(req, res);
      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.data).toHaveLength(1);
      expect(data.data[0].user_id).toBe(userId);
    });

    it("debe filtrar ventas por estado", async () => {
      const mockVentas = [
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          user_id: "550e8400-e29b-41d4-a716-446655440002",
          slot_id: "550e8400-e29b-41d4-a716-446655440003",
          cantidad: 1,
          precio_total: 15.5,
          estado: "retirada",
        },
      ];

      mockHandle.mockImplementation((req, res) => {
        return res.status(200).json({
          data: mockVentas,
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { estado: "retirada" },
      });

      await handler(req, res);

      expect(mockHandle).toHaveBeenCalledWith(req, res);
      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.data).toHaveLength(1);
      expect(data.data[0].estado).toBe("retirada");
    });

    it("debe filtrar ventas por slot_id", async () => {
      const slotId = "550e8400-e29b-41d4-a716-446655440003";
      const mockVentas = [
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          user_id: "550e8400-e29b-41d4-a716-446655440002",
          slot_id: slotId,
          cantidad: 1,
          precio_total: 15.5,
          estado: "pagada",
        },
      ];

      mockHandle.mockImplementation((req, res) => {
        return res.status(200).json({
          data: mockVentas,
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { slot_id: slotId },
      });

      await handler(req, res);

      expect(mockHandle).toHaveBeenCalledWith(req, res);
      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.data).toHaveLength(1);
      expect(data.data[0].slot_id).toBe(slotId);
    });

    it("debe combinar múltiples filtros", async () => {
      const userId = "550e8400-e29b-41d4-a716-446655440002";
      const slotId = "550e8400-e29b-41d4-a716-446655440003";
      const mockVentas = [
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          user_id: userId,
          slot_id: slotId,
          cantidad: 1,
          precio_total: 15.5,
          estado: "pagada",
        },
      ];

      mockHandle.mockImplementation((req, res) => {
        return res.status(200).json({
          data: mockVentas,
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { user_id: userId, slot_id: slotId, estado: "pagada" },
      });

      await handler(req, res);

      expect(mockHandle).toHaveBeenCalledWith(req, res);
      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.data).toHaveLength(1);
      expect(data.data[0].user_id).toBe(userId);
      expect(data.data[0].slot_id).toBe(slotId);
      expect(data.data[0].estado).toBe("pagada");
    });

    it("debe soportar paginación", async () => {
      mockHandle.mockImplementation((req, res) => {
        return res.status(200).json({
          data: [],
          pagination: { page: 2, limit: 20, total: 50, totalPages: 3 },
        });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { page: "2", limit: "20" },
      });

      await handler(req, res);

      expect(mockHandle).toHaveBeenCalledWith(req, res);
      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.limit).toBe(20);
    });

    it("debe retornar array vacío si no hay ventas", async () => {
      mockHandle.mockImplementation((req, res) => {
        return res.status(200).json({
          data: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { estado: "expirada" },
      });

      await handler(req, res);

      expect(mockHandle).toHaveBeenCalledWith(req, res);
      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.data).toEqual([]);
      expect(data.pagination.total).toBe(0);
    });
  });

  describe("POST /api/ventas-app", () => {
    it("debe crear una nueva venta exitosamente", async () => {
      const nuevaVenta = {
        user_id: "550e8400-e29b-41d4-a716-446655440002",
        slot_id: "550e8400-e29b-41d4-a716-446655440003",
        cantidad: 2,
        precio_unitario: 15.5,
      };

      const mockResponse = [
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          ...nuevaVenta,
          precio_total: 31.0,
          estado: "reservada",
          codigo_retiro: "XYZ789",
          created_at: "2025-01-15T10:00:00Z",
        },
      ];

      mockHandle.mockImplementation((req, res) => {
        return res.status(201).json({ data: mockResponse });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: nuevaVenta,
      });

      await handler(req, res);

      expect(mockHandle).toHaveBeenCalledWith(req, res);
      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.data).toEqual(mockResponse);
      expect(data.data[0].precio_total).toBe(31.0);
      expect(data.data[0].estado).toBe("reservada");
      expect(data.data[0].codigo_retiro).toBeDefined();
    });

    it("debe calcular precio_total correctamente", async () => {
      const nuevaVenta = {
        user_id: "550e8400-e29b-41d4-a716-446655440002",
        slot_id: "550e8400-e29b-41d4-a716-446655440003",
        cantidad: 3,
        precio_unitario: 10.0,
      };

      const mockResponse = [
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          ...nuevaVenta,
          precio_total: 30.0,
          estado: "reservada",
          codigo_retiro: "ABC123",
        },
      ];

      mockHandle.mockImplementation((req, res) => {
        return res.status(201).json({ data: mockResponse });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: nuevaVenta,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.data[0].precio_total).toBe(30.0);
    });

    it("debe retornar 400 si falta user_id", async () => {
      mockHandle.mockImplementation((req, res) => {
        return res.status(400).json({ error: "user_id es requerido" });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          slot_id: "550e8400-e29b-41d4-a716-446655440003",
          cantidad: 2,
          precio_unitario: 15.5,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("user_id");
    });

    it("debe retornar 400 si falta slot_id", async () => {
      mockHandle.mockImplementation((req, res) => {
        return res.status(400).json({ error: "slot_id es requerido" });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          user_id: "550e8400-e29b-41d4-a716-446655440002",
          cantidad: 2,
          precio_unitario: 15.5,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("slot_id");
    });

    it("debe retornar 400 si cantidad no es válida", async () => {
      mockHandle.mockImplementation((req, res) => {
        return res
          .status(400)
          .json({ error: "La cantidad debe ser mayor a 0" });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          user_id: "550e8400-e29b-41d4-a716-446655440002",
          slot_id: "550e8400-e29b-41d4-a716-446655440003",
          cantidad: 0,
          precio_unitario: 15.5,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("cantidad");
    });

    it("debe retornar 400 si precio_unitario no es válido", async () => {
      mockHandle.mockImplementation((req, res) => {
        return res
          .status(400)
          .json({ error: "El precio unitario debe ser mayor a 0" });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          user_id: "550e8400-e29b-41d4-a716-446655440002",
          slot_id: "550e8400-e29b-41d4-a716-446655440003",
          cantidad: 2,
          precio_unitario: -5.0,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("precio");
    });

    it("debe retornar 400 si stock es insuficiente", async () => {
      mockHandle.mockImplementation((req, res) => {
        return res.status(400).json({ error: "Stock insuficiente en el slot" });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          user_id: "550e8400-e29b-41d4-a716-446655440002",
          slot_id: "550e8400-e29b-41d4-a716-446655440003",
          cantidad: 100,
          precio_unitario: 15.5,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("Stock insuficiente");
    });

    it("debe retornar 404 si el usuario no existe", async () => {
      mockHandle.mockImplementation((req, res) => {
        return res.status(404).json({ error: "Usuario no encontrado" });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          user_id: "550e8400-e29b-41d4-a716-446655440999",
          slot_id: "550e8400-e29b-41d4-a716-446655440003",
          cantidad: 2,
          precio_unitario: 15.5,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("Usuario no encontrado");
    });

    it("debe retornar 404 si el slot no existe", async () => {
      mockHandle.mockImplementation((req, res) => {
        return res.status(404).json({ error: "Slot no encontrado" });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          user_id: "550e8400-e29b-41d4-a716-446655440002",
          slot_id: "550e8400-e29b-41d4-a716-446655440999",
          cantidad: 2,
          precio_unitario: 15.5,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("Slot no encontrado");
    });
  });

  describe("Métodos HTTP no permitidos", () => {
    const unsupportedMethods: ("PUT" | "DELETE" | "PATCH")[] = [
      "PUT",
      "DELETE",
      "PATCH",
    ];

    unsupportedMethods.forEach((method) => {
      it(`debe retornar 405 para método ${method}`, async () => {
        mockHandle.mockImplementation((req, res) => {
          return res.status(405).json({ error: "Método no permitido" });
        });

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method,
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(405);
        const data = JSON.parse(res._getData());
        expect(data.error).toContain("Método no permitido");
      });
    });
  });

  describe("Manejo de errores", () => {
    it("debe manejar errores internos del controller (GET)", async () => {
      mockHandle.mockImplementation(() => {
        throw new Error("Database connection failed");
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe("Error interno del servidor");
      expect(data.code).toBe("INTERNAL_SERVER_ERROR");
    });

    it("debe manejar errores internos del controller (POST)", async () => {
      mockHandle.mockImplementation(() => {
        throw new Error("Stock reservation failed");
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          user_id: "550e8400-e29b-41d4-a716-446655440002",
          slot_id: "550e8400-e29b-41d4-a716-446655440003",
          cantidad: 2,
          precio_unitario: 15.5,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe("Error interno del servidor");
      expect(data.code).toBe("INTERNAL_SERVER_ERROR");
    });

    it("debe manejar objetos de error no estándar", async () => {
      mockHandle.mockImplementation(() => {
        throw { custom: "error object" };
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe("Error interno del servidor");
      expect(data.code).toBe("INTERNAL_SERVER_ERROR");
    });
  });

  describe("Integración", () => {
    it("debe instanciar el controller correctamente", async () => {
      mockHandle.mockImplementation((req, res) => {
        return res.status(200).json({ data: [], pagination: {} });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {},
      });

      await handler(req, res);

      expect(VentaAppController).toHaveBeenCalledTimes(1);
      expect(mockHandle).toHaveBeenCalledWith(req, res);
    });
  });
});
