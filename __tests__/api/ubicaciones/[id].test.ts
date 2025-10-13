/* eslint-disable @typescript-eslint/no-explicit-any */
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../pages/api/ubicaciones/[id]";
import { LocationController } from "../../../src/controllers/location.controller";

// Mock del controller
jest.mock("../../../src/controllers/location.controller");

describe("/api/ubicaciones/[id]", () => {
  let mockHandle: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockHandle = jest.fn();
    (
      LocationController as jest.MockedClass<typeof LocationController>
    ).mockImplementation(
      () =>
        ({
          handle: mockHandle,
        } as any)
    );
  });

  describe("GET /api/ubicaciones/[id]", () => {
    it("debe obtener una ubicación exitosamente con ID válido", async () => {
      const testId = "123e4567-e89b-12d3-a456-426614174000";
      const mockLocation = {
        id: testId,
        city: "Santiago de Compostela",
        province: "A Coruña",
        camino_id: "323e4567-e89b-12d3-a456-426614174000",
        address: "Plaza del Obradoiro",
        postal_code: "15704",
        latitude: 42.8805,
        longitude: -8.5456,
      };

      mockHandle.mockImplementation(async (_req, res) => {
        return res.status(200).json(mockLocation);
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
        error: "ID de ubicación es requerido",
      });
      expect(mockHandle).not.toHaveBeenCalled();
    });

    it("debe retornar 400 si el ID no es string", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
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

  describe("PUT /api/ubicaciones/[id]", () => {
    it("debe actualizar una ubicación exitosamente", async () => {
      const testId = "123e4567-e89b-12d3-a456-426614174000";
      const updateData = {
        city: "Santiago (actualizado)",
        address: "Nueva dirección",
        postal_code: "15705",
      };

      const mockUpdated = {
        id: testId,
        ...updateData,
        province: "A Coruña",
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
      const updateData = { city: "Nueva Ciudad" };

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

    it("debe actualizar coordenadas geográficas", async () => {
      const testId = "123e4567-e89b-12d3-a456-426614174000";
      const updateData = {
        latitude: 42.8805,
        longitude: -8.5456,
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
            latitude: 42.8805,
            longitude: -8.5456,
          }),
        }),
        res
      );
    });
  });

  describe("DELETE /api/ubicaciones/[id]", () => {
    it("debe eliminar una ubicación exitosamente", async () => {
      const testId = "123e4567-e89b-12d3-a456-426614174000";

      mockHandle.mockImplementation(async (_req, res) => {
        return res
          .status(200)
          .json({ message: "Ubicación eliminada exitosamente" });
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
          .json({ message: "Ubicación eliminada exitosamente" });
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

    it("debe retornar 405 para POST (no soportado en endpoints con ID)", async () => {
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
        error: "ID de ubicación es requerido",
      });
      expect(mockHandle).not.toHaveBeenCalled();
    });
  });
});
