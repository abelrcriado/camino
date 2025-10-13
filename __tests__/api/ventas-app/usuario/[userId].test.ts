/**
 * Tests para /api/ventas-app/usuario/[userId].ts
 * Endpoint para obtener ventas de un usuario específico
 */

import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../../pages/api/ventas-app/usuario/[userId]";
import { VentaAppService } from "../../../../src/services/venta_app.service";

// Mock del servicio
jest.mock("../../../../src/services/venta_app.service");

describe("/api/ventas-app/usuario/[userId]", () => {
  let mockGetVentas: jest.Mock;
  const validUserId = "550e8400-e29b-41d4-a716-446655440002";
  const invalidUuid = "invalid-uuid-format";

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock del servicio
    mockGetVentas = jest.fn();
    (
      VentaAppService as jest.MockedClass<typeof VentaAppService>
    ).mockImplementation(() => {
      return {
        getVentas: mockGetVentas,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
    });
  });

  describe("GET /api/ventas-app/usuario/[userId]", () => {
    it("debe obtener todas las ventas de un usuario", async () => {
      const mockVentas = [
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          user_id: validUserId,
          slot_id: "550e8400-e29b-41d4-a716-446655440003",
          cantidad: 2,
          precio_total: 31.0,
          estado: "pagada",
          codigo_retiro: "ABC123",
          created_at: "2025-01-15T10:00:00Z",
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440004",
          user_id: validUserId,
          slot_id: "550e8400-e29b-41d4-a716-446655440005",
          cantidad: 1,
          precio_total: 15.5,
          estado: "retirada",
          codigo_retiro: "XYZ789",
          created_at: "2025-01-14T08:00:00Z",
        },
      ];

      mockGetVentas.mockResolvedValue({
        data: mockVentas,
        count: 2,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { userId: validUserId },
      });

      await handler(req, res);

      expect(mockGetVentas).toHaveBeenCalledWith({
        user_id: validUserId,
      });
      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.data).toEqual(mockVentas);
      expect(data.pagination.total).toBe(2);
      expect(data.user.id).toBe(validUserId);
    });

    it("debe filtrar ventas por estado", async () => {
      const mockVentas = [
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          user_id: validUserId,
          slot_id: "550e8400-e29b-41d4-a716-446655440003",
          cantidad: 1,
          precio_total: 15.5,
          estado: "retirada",
          created_at: "2025-01-15T10:00:00Z",
        },
      ];

      mockGetVentas.mockResolvedValue({
        data: mockVentas,
        count: 1,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { userId: validUserId, estado: "retirada" },
      });

      await handler(req, res);

      expect(mockGetVentas).toHaveBeenCalledWith({
        user_id: validUserId,
        estado: "retirada",
      });
      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.data).toHaveLength(1);
      expect(data.data[0].estado).toBe("retirada");
    });

    it("debe aceptar estados válidos (reservada, pagada, retirada, cancelada, expirada)", async () => {
      const estadosValidos = [
        "reservada",
        "pagada",
        "retirada",
        "cancelada",
        "expirada",
      ];

      for (const estado of estadosValidos) {
        mockGetVentas.mockClear();
        mockGetVentas.mockResolvedValue({
          data: [],
          count: 0,
        });

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: "GET",
          query: { userId: validUserId, estado },
        });

        await handler(req, res);

        expect(mockGetVentas).toHaveBeenCalledWith({
          user_id: validUserId,
          estado,
        });
        expect(res._getStatusCode()).toBe(200);
      }
    });

    it("debe soportar paginación con valores por defecto", async () => {
      mockGetVentas.mockResolvedValue({
        data: [],
        count: 0,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { userId: validUserId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(10);
    });

    it("debe soportar paginación personalizada", async () => {
      mockGetVentas.mockResolvedValue({
        data: [],
        count: 50,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { userId: validUserId, page: "3", limit: "20" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.pagination.page).toBe(3);
      expect(data.pagination.limit).toBe(20);
      expect(data.pagination.total).toBe(50);
      expect(data.pagination.totalPages).toBe(3);
    });

    it("debe calcular totalPages correctamente", async () => {
      mockGetVentas.mockResolvedValue({
        data: [],
        count: 25,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { userId: validUserId, limit: "10" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.pagination.totalPages).toBe(3); // Math.ceil(25/10)
    });

    it("debe retornar array vacío si el usuario no tiene ventas", async () => {
      mockGetVentas.mockResolvedValue({
        data: [],
        count: 0,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { userId: validUserId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.data).toEqual([]);
      expect(data.pagination.total).toBe(0);
      expect(data.pagination.totalPages).toBe(0);
    });

    it("debe retornar 400 si userId no está presente", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {},
      });

      await handler(req, res);

      expect(mockGetVentas).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("ID de usuario es requerido");
    });

    it("debe retornar 400 si userId no es string", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { userId: ["array", "of", "ids"] },
      });

      await handler(req, res);

      expect(mockGetVentas).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("ID debe ser un string");
    });

    it("debe retornar 400 si userId no es UUID válido", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { userId: invalidUuid },
      });

      await handler(req, res);

      expect(mockGetVentas).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("usuario debe ser un UUID válido");
    });

    it("debe retornar 400 si page es menor a 1", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { userId: validUserId, page: "0" },
      });

      await handler(req, res);

      expect(mockGetVentas).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("número de página debe ser mayor a 0");
    });

    it("debe retornar 400 si limit es menor a 1", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { userId: validUserId, limit: "0" },
      });

      await handler(req, res);

      expect(mockGetVentas).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("límite debe estar entre 1 y 100");
    });

    it("debe retornar 400 si limit es mayor a 100", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { userId: validUserId, limit: "200" },
      });

      await handler(req, res);

      expect(mockGetVentas).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("límite debe estar entre 1 y 100");
    });

    it("debe retornar 500 si el usuario no existe (asyncHandler convierte a 500)", async () => {
      mockGetVentas.mockRejectedValue(new Error("Usuario no encontrado"));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { userId: validUserId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.code).toBe("INTERNAL_SERVER_ERROR");
      expect(data.error).toBeDefined();
    });
  });

  describe("Métodos HTTP no permitidos", () => {
    const unsupportedMethods: ("POST" | "PUT" | "DELETE" | "PATCH")[] = [
      "POST",
      "PUT",
      "DELETE",
      "PATCH",
    ];

    unsupportedMethods.forEach((method) => {
      it(`debe retornar 405 para método ${method}`, async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method,
          query: { userId: validUserId },
        });

        await handler(req, res);

        expect(mockGetVentas).not.toHaveBeenCalled();
        expect(res._getStatusCode()).toBe(405);
        const data = JSON.parse(res._getData());
        expect(data.error).toContain("Método no permitido");
      });
    });
  });

  describe("Manejo de errores", () => {
    it("debe retornar 500 para errores internos del servicio (asyncHandler)", async () => {
      mockGetVentas.mockRejectedValue(new Error("Database connection failed"));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { userId: validUserId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.code).toBe("INTERNAL_SERVER_ERROR");
      expect(data.error).toBeDefined();
    });
  });

  describe("Integración", () => {
    it("debe instanciar el servicio correctamente", async () => {
      mockGetVentas.mockResolvedValue({
        data: [],
        count: 0,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { userId: validUserId },
      });

      await handler(req, res);

      expect(VentaAppService).toHaveBeenCalledTimes(1);
      expect(mockGetVentas).toHaveBeenCalledWith({
        user_id: validUserId,
      });
    });
  });
});
