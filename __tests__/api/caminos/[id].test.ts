/* eslint-disable @typescript-eslint/no-explicit-any */
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../pages/api/caminos/[id]";
import { CaminoController } from "@/api/controllers/camino.controller";

// Mock del controller
jest.mock("@/api/controllers/camino.controller");

describe("/api/caminos/[id]", () => {
  let mockHandle: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockHandle = jest.fn();
    (
      CaminoController as jest.MockedClass<typeof CaminoController>
    ).mockImplementation(
      () =>
        ({
          handle: mockHandle,
        } as any)
    );
  });

  describe("GET /api/caminos/[id]", () => {
    it("debe obtener un camino exitosamente con ID válido", async () => {
      const testId = "123e4567-e89b-12d3-a456-426614174000";
      const mockCamino = {
        id: testId,
        nombre: "Camino Francés",
        codigo: "CF-001",
        descripcion: "Ruta principal del Camino de Santiago",
        distancia_km: 780,
        dificultad: "media",
        punto_inicio: "Saint-Jean-Pied-de-Port",
        punto_fin: "Santiago de Compostela",
        zona_operativa: "Norte",
        region: "Galicia",
        estado_operativo: "activo",
        created_at: "2024-01-01T00:00:00Z",
      };

      mockHandle.mockImplementation(async (_req, res) => {
        return res.status(200).json(mockCamino);
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
        error: "ID de camino es requerido",
      });
      expect(mockHandle).not.toHaveBeenCalled();
    });

    it("debe retornar 400 si el ID no es string", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: 123 },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "ID debe ser un string",
      });
      expect(mockHandle).not.toHaveBeenCalled();
    });
  });

  describe("PUT /api/caminos/[id]", () => {
    it("debe actualizar un camino exitosamente", async () => {
      const testId = "123e4567-e89b-12d3-a456-426614174000";
      const updateData = {
        nombre: "Camino Francés Actualizado",
        descripcion: "Nueva descripción",
        distancia_km: 785,
      };

      const mockUpdated = {
        id: testId,
        ...updateData,
        codigo: "CF-001",
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
    });

    it("debe inyectar el ID en el body para actualización", async () => {
      const testId = "123e4567-e89b-12d3-a456-426614174000";

      mockHandle.mockImplementation(async (_req, res) => {
        return res.status(200).json([{ id: testId }]);
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        query: { id: testId },
        body: { nombre: "Test" },
      });

      await handler(req, res);

      expect(mockHandle).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({ id: testId }),
        }),
        res
      );
    });

    it("debe actualizar campos específicos del camino", async () => {
      const testId = "123e4567-e89b-12d3-a456-426614174000";
      const updateData = {
        zona_operativa: "Sur",
        region: "Andalucía",
        estado_operativo: "mantenimiento",
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

      expect(res._getStatusCode()).toBe(200);
      expect(mockHandle).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining(updateData),
        }),
        res
      );
    });
  });

  describe("DELETE /api/caminos/[id]", () => {
    it("debe eliminar un camino exitosamente", async () => {
      const testId = "123e4567-e89b-12d3-a456-426614174000";

      mockHandle.mockImplementation(async (_req, res) => {
        return res.status(200).json({ message: "Camino eliminado exitosamente" });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        query: { id: testId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockHandle).toHaveBeenCalledTimes(1);
    });

    it("debe inyectar el ID en el body para eliminación", async () => {
      const testId = "123e4567-e89b-12d3-a456-426614174000";

      mockHandle.mockImplementation(async (_req, res) => {
        return res.status(200).json({ message: "Eliminado" });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        query: { id: testId },
      });

      await handler(req, res);

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
        query: { id: 12345 },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(mockHandle).not.toHaveBeenCalled();
    });

    it("debe validar que el ID esté presente antes de delegar", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toHaveProperty("error");
      expect(mockHandle).not.toHaveBeenCalled();
    });
  });
});
