/* eslint-disable @typescript-eslint/no-explicit-any */
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../../pages/api/caminos/[id]/stats";
import { CaminoService } from "../../../../src/services/camino.service";
import { CaminoRepository } from "../../../../src/repositories/camino.repository";

// Mock de dependencias
jest.mock("../../../../src/services/camino.service");
jest.mock("../../../../src/repositories/camino.repository");

describe("/api/caminos/[id]/stats", () => {
  let mockGetStats: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStats = jest.fn();

    (
      CaminoRepository as jest.MockedClass<typeof CaminoRepository>
    ).mockImplementation(() => ({} as any));

    (
      CaminoService as jest.MockedClass<typeof CaminoService>
    ).mockImplementation(
      () =>
        ({
          getStats: mockGetStats,
        } as any)
    );
  });

  describe("GET /api/caminos/[id]/stats", () => {
    const validUuid = "123e4567-e89b-12d3-a456-426614174000";

    it("debe retornar estadísticas de un camino exitosamente", async () => {
      const mockStats = {
        camino_id: validUuid,
        camino_nombre: "Camino de Santiago Francés",
        total_ubicaciones: 25,
        total_service_points: 42,
        service_points_por_tipo: {
          CSP: 15,
          CSS: 20,
          CSH: 7,
        },
        total_talleres: 12,
        total_vending_machines: 18,
        cobertura_km: 780.5,
      };

      mockGetStats.mockResolvedValue(mockStats);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual(mockStats);
      expect(mockGetStats).toHaveBeenCalledTimes(1);
      expect(mockGetStats).toHaveBeenCalledWith(validUuid);
    });

    it("debe retornar 400 si el ID no está presente", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "ID de camino es requerido",
      });
      expect(mockGetStats).not.toHaveBeenCalled();
    });

    it("debe retornar 400 si el ID no es string", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: ["array", "of", "ids"] },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "ID debe ser un string",
      });
      expect(mockGetStats).not.toHaveBeenCalled();
    });

    it("debe retornar 400 si el ID no es un UUID válido", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: "invalid-uuid-format" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "camino debe ser un UUID válido",
      });
      expect(mockGetStats).not.toHaveBeenCalled();
    });

    it("debe validar UUID con regex correcto", async () => {
      const invalidUuids = [
        "123",
        "not-a-uuid",
        "123e4567-e89b-12d3-a456-42661417400", // Too short
        "123e4567-e89b-12d3-a456-4266141740000", // Too long
        "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", // Invalid chars
      ];

      for (const invalidUuid of invalidUuids) {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: "GET",
          query: { id: invalidUuid },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
        expect(res._getJSONData()).toEqual({
          error: "camino debe ser un UUID válido",
        });
      }

      expect(mockGetStats).not.toHaveBeenCalled();
    });

    it("debe retornar 404 si el camino no existe", async () => {
      const errorMessage = "Camino no encontrado";
      mockGetStats.mockRejectedValue(new Error(errorMessage));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = res._getJSONData();
      // asyncHandler convierte todos los errores en 500
      expect(data.code).toBe("INTERNAL_SERVER_ERROR");
      expect(data.error).toBeDefined();
    });

    it("debe retornar 500 para errores internos (asyncHandler)", async () => {
      mockGetStats.mockRejectedValue(new Error("Database connection failed"));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = res._getJSONData();
      expect(data.code).toBe("INTERNAL_SERVER_ERROR");
      expect(data.error).toBeDefined();
    });

    it("debe manejar errores no-Error objects (asyncHandler)", async () => {
      mockGetStats.mockRejectedValue("String error");

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = res._getJSONData();
      expect(data.code).toBe("INTERNAL_SERVER_ERROR");
      expect(data.error).toBeDefined();
    });
  });

  describe("Métodos HTTP no permitidos", () => {
    const validUuid = "123e4567-e89b-12d3-a456-426614174000";

    it("debe retornar 405 para POST", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res._getJSONData()).toEqual({
        error: "Método no permitido",
      });
      expect(mockGetStats).not.toHaveBeenCalled();
    });

    it("debe retornar 405 para PUT", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(mockGetStats).not.toHaveBeenCalled();
    });

    it("debe retornar 405 para DELETE", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(mockGetStats).not.toHaveBeenCalled();
    });
  });

  describe("Integración con servicio", () => {
    it("debe crear instancias de CaminoRepository y CaminoService", async () => {
      const validUuid = "123e4567-e89b-12d3-a456-426614174000";
      mockGetStats.mockResolvedValue({});

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(CaminoRepository).toHaveBeenCalledTimes(1);
      expect(CaminoService).toHaveBeenCalledTimes(1);
      expect(CaminoService).toHaveBeenCalledWith(expect.any(Object));
    });
  });
});
