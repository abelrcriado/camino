/* eslint-disable @typescript-eslint/no-explicit-any */
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../../pages/api/ubicaciones/[id]/service-points";
import { ServicePointService } from "../../../../src/services/service-point.service";
import { ServicePointRepository } from "../../../../src/repositories/service-point.repository";

// Mock de dependencias
jest.mock("../../../../src/services/service-point.service");
jest.mock("../../../../src/repositories/service-point.repository");

describe("/api/ubicaciones/[id]/service-points", () => {
  let mockGetByLocation: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetByLocation = jest.fn();

    (
      ServicePointRepository as jest.MockedClass<typeof ServicePointRepository>
    ).mockImplementation(() => ({} as any));

    (
      ServicePointService as jest.MockedClass<typeof ServicePointService>
    ).mockImplementation(
      () =>
        ({
          getByLocation: mockGetByLocation,
        } as any)
    );
  });

  describe("GET /api/ubicaciones/[id]/service-points", () => {
    const validUuid = "123e4567-e89b-12d3-a456-426614174000";

    it("debe retornar service points de una ubicación sin filtros", async () => {
      const mockServicePoints = [
        {
          id: "sp1",
          name: "CSP Santiago",
          type: "CSP",
          location_id: validUuid,
          status: "active",
          has_workshop: true,
          has_vending_machine: false,
        },
        {
          id: "sp2",
          name: "CSS Santiago Centro",
          type: "CSS",
          location_id: validUuid,
          status: "active",
          has_workshop: false,
          has_vending_machine: true,
        },
        {
          id: "sp3",
          name: "CSH Santiago Principal",
          type: "CSH",
          location_id: validUuid,
          status: "inactive",
          has_workshop: true,
          has_vending_machine: true,
        },
      ];

      mockGetByLocation.mockResolvedValue(mockServicePoints);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = res._getJSONData();
      expect(response).toEqual({
        data: mockServicePoints,
        total: 3,
        location: { id: validUuid },
      });
      expect(mockGetByLocation).toHaveBeenCalledTimes(1);
      expect(mockGetByLocation).toHaveBeenCalledWith(validUuid);
    });

    it("debe filtrar service points por tipo", async () => {
      const allServicePoints = [
        {
          id: "sp1",
          name: "CSP Santiago",
          type: "CSP",
          location_id: validUuid,
          status: "active",
        },
        {
          id: "sp2",
          name: "CSS Santiago",
          type: "CSS",
          location_id: validUuid,
          status: "active",
        },
      ];

      mockGetByLocation.mockResolvedValue(allServicePoints);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid, type: "CSP" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = res._getJSONData();
      expect(response.data).toHaveLength(1);
      expect(response.data[0].type).toBe("CSP");
      expect(response.total).toBe(1);
    });

    it("debe filtrar service points por status", async () => {
      const allServicePoints = [
        {
          id: "sp1",
          name: "CSP Active",
          type: "CSP",
          location_id: validUuid,
          status: "active",
        },
        {
          id: "sp2",
          name: "CSP Inactive",
          type: "CSP",
          location_id: validUuid,
          status: "inactive",
        },
        {
          id: "sp3",
          name: "CSP Maintenance",
          type: "CSP",
          location_id: validUuid,
          status: "maintenance",
        },
      ];

      mockGetByLocation.mockResolvedValue(allServicePoints);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid, status: "active" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = res._getJSONData();
      expect(response.data).toHaveLength(1);
      expect(response.data[0].status).toBe("active");
      expect(response.total).toBe(1);
    });

    it("debe filtrar por tipo y status simultáneamente", async () => {
      const allServicePoints = [
        {
          id: "sp1",
          name: "CSP Active",
          type: "CSP",
          location_id: validUuid,
          status: "active",
        },
        {
          id: "sp2",
          name: "CSP Inactive",
          type: "CSP",
          location_id: validUuid,
          status: "inactive",
        },
        {
          id: "sp3",
          name: "CSS Active",
          type: "CSS",
          location_id: validUuid,
          status: "active",
        },
      ];

      mockGetByLocation.mockResolvedValue(allServicePoints);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid, type: "CSP", status: "active" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = res._getJSONData();
      expect(response.data).toHaveLength(1);
      expect(response.data[0].type).toBe("CSP");
      expect(response.data[0].status).toBe("active");
    });

    it("debe retornar array vacío si no hay service points que coincidan con filtros", async () => {
      const allServicePoints = [
        {
          id: "sp1",
          type: "CSP",
          status: "active",
          location_id: validUuid,
        },
      ];

      mockGetByLocation.mockResolvedValue(allServicePoints);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid, type: "CSS" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = res._getJSONData();
      expect(response.data).toEqual([]);
      expect(response.total).toBe(0);
    });

    it("debe ignorar filtros si son arrays", async () => {
      const allServicePoints = [
        {
          id: "sp1",
          type: "CSP",
          status: "active",
          location_id: validUuid,
        },
        {
          id: "sp2",
          type: "CSS",
          status: "inactive",
          location_id: validUuid,
        },
      ];

      mockGetByLocation.mockResolvedValue(allServicePoints);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid, type: ["CSP", "CSS"] }, // Array, should be ignored
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = res._getJSONData();
      expect(response.data).toHaveLength(2); // Sin filtrar
      expect(response.total).toBe(2);
    });
  });

  describe("Validación de parámetros", () => {
    it("debe retornar 400 si el ID no está presente", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "ID de ubicación es requerido",
      });
      expect(mockGetByLocation).not.toHaveBeenCalled();
    });

    it("debe retornar 400 si el ID no es string", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: ["array"] },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "ID de ubicación es requerido",
      });
      expect(mockGetByLocation).not.toHaveBeenCalled();
    });

    it("debe retornar 400 si el ID no es UUID válido", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: "invalid-uuid" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "ID de ubicación inválido",
      });
      expect(mockGetByLocation).not.toHaveBeenCalled();
    });

    it("debe validar UUID correctamente", async () => {
      const validUuid = "123e4567-e89b-12d3-a456-426614174000";
      mockGetByLocation.mockResolvedValue([]);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockGetByLocation).toHaveBeenCalledWith(validUuid);
    });
  });

  describe("Manejo de errores", () => {
    const validUuid = "123e4567-e89b-12d3-a456-426614174000";

    it("debe retornar 404 si la ubicación no existe", async () => {
      const errorMessage = "Ubicación no encontrada";
      mockGetByLocation.mockRejectedValue(new Error(errorMessage));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({
        error: errorMessage,
      });
    });

    it("debe retornar 500 para errores internos", async () => {
      mockGetByLocation.mockRejectedValue(new Error("Database error"));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(res._getJSONData()).toEqual({
        error: "Error al obtener service points de la ubicación",
      });
    });

    it("debe manejar errores no-Error objects", async () => {
      mockGetByLocation.mockRejectedValue("String error");

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(res._getJSONData()).toEqual({
        error: "Error al obtener service points de la ubicación",
      });
    });

    it("debe detectar error 404 con variaciones de mensaje", async () => {
      // El endpoint busca "no encontrad" (sin a/o final)
      const variations = ["Ubicación no encontrada", "Location no encontrado"];

      for (const errorMsg of variations) {
        jest.clearAllMocks();
        mockGetByLocation.mockRejectedValue(new Error(errorMsg));

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: "GET",
          query: { id: validUuid },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(404);
        expect(res._getJSONData()).toEqual({ error: errorMsg });
      }
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
      expect(mockGetByLocation).not.toHaveBeenCalled();
    });

    it("debe retornar 405 para PUT", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(mockGetByLocation).not.toHaveBeenCalled();
    });

    it("debe retornar 405 para DELETE", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(mockGetByLocation).not.toHaveBeenCalled();
    });
  });

  describe("Integración con servicio", () => {
    it("debe crear instancias de ServicePointRepository y ServicePointService", async () => {
      const validUuid = "123e4567-e89b-12d3-a456-426614174000";
      mockGetByLocation.mockResolvedValue([]);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(ServicePointRepository).toHaveBeenCalledTimes(1);
      expect(ServicePointService).toHaveBeenCalledTimes(1);
      expect(ServicePointService).toHaveBeenCalledWith(expect.any(Object));
    });
  });
});
