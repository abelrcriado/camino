/* eslint-disable @typescript-eslint/no-explicit-any */
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../pages/api/ubicaciones/index";
import { LocationController } from "@/api/controllers/location.controller";

// Mock del controller
jest.mock("@/api/controllers/location.controller");

describe("/api/ubicaciones", () => {
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

  describe("GET /api/ubicaciones", () => {
    it("debe listar todas las ubicaciones sin filtros", async () => {
      const mockLocations = [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          city: "Santiago de Compostela",
          province: "A Coruña",
          camino_id: null,
        },
        {
          id: "223e4567-e89b-12d3-a456-426614174000",
          city: "Sarria",
          province: "Lugo",
          camino_id: "323e4567-e89b-12d3-a456-426614174000",
        },
      ];

      const mockPagination = {
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
        hasMore: false,
      };

      mockHandle.mockImplementation(async (_req, res) => {
        return res.status(200).json({
          data: mockLocations,
          pagination: mockPagination,
        });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockHandle).toHaveBeenCalledTimes(1);
    });

    it("debe filtrar ubicaciones por camino_id", async () => {
      const caminoId = "323e4567-e89b-12d3-a456-426614174000";

      mockHandle.mockImplementation(async (_req, res) => {
        return res.status(200).json({
          data: [
            {
              id: "223e4567-e89b-12d3-a456-426614174000",
              city: "Sarria",
              province: "Lugo",
              camino_id: caminoId,
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
            hasMore: false,
          },
        });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { camino_id: caminoId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockHandle).toHaveBeenCalledWith(
        expect.objectContaining({
          query: { camino_id: caminoId },
        }),
        res
      );
    });

    it("debe filtrar ubicaciones por provincia", async () => {
      mockHandle.mockImplementation(async (_req, res) => {
        return res.status(200).json({
          data: [
            {
              id: "123e4567-e89b-12d3-a456-426614174000",
              city: "Santiago de Compostela",
              province: "A Coruña",
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
            hasMore: false,
          },
        });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { province: "A Coruña" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockHandle).toHaveBeenCalledWith(
        expect.objectContaining({
          query: { province: "A Coruña" },
        }),
        res
      );
    });

    it("debe filtrar ubicaciones por ciudad", async () => {
      mockHandle.mockImplementation(async (_req, res) => {
        return res.status(200).json({
          data: [
            {
              id: "223e4567-e89b-12d3-a456-426614174000",
              city: "Sarria",
              province: "Lugo",
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
            hasMore: false,
          },
        });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { city: "Sarria" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockHandle).toHaveBeenCalledWith(
        expect.objectContaining({
          query: { city: "Sarria" },
        }),
        res
      );
    });

    it("debe soportar paginación con page y limit", async () => {
      mockHandle.mockImplementation(async (_req, res) => {
        return res.status(200).json({
          data: [],
          pagination: {
            page: 2,
            limit: 10,
            total: 25,
            totalPages: 3,
            hasMore: true,
          },
        });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { page: "2", limit: "10" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockHandle).toHaveBeenCalledWith(
        expect.objectContaining({
          query: { page: "2", limit: "10" },
        }),
        res
      );
    });

    it("debe combinar múltiples filtros", async () => {
      const caminoId = "323e4567-e89b-12d3-a456-426614174000";

      mockHandle.mockImplementation(async (_req, res) => {
        return res.status(200).json({
          data: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasMore: false,
          },
        });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {
          camino_id: caminoId,
          province: "Lugo",
          city: "Sarria",
          page: "1",
          limit: "20",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockHandle).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            camino_id: caminoId,
            province: "Lugo",
            city: "Sarria",
          }),
        }),
        res
      );
    });
  });

  describe("POST /api/ubicaciones", () => {
    it("debe crear una nueva ubicación con campos obligatorios", async () => {
      const newLocation = {
        city: "Ponferrada",
        province: "León",
      };

      const createdLocation = {
        id: "423e4567-e89b-12d3-a456-426614174000",
        ...newLocation,
        created_at: new Date().toISOString(),
      };

      mockHandle.mockImplementation(async (_req, res) => {
        return res.status(201).json([createdLocation]);
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: newLocation,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(mockHandle).toHaveBeenCalledTimes(1);
      expect(mockHandle).toHaveBeenCalledWith(
        expect.objectContaining({
          body: newLocation,
        }),
        res
      );
    });

    it("debe crear ubicación con todos los campos opcionales", async () => {
      const newLocation = {
        city: "Astorga",
        province: "León",
        camino_id: "323e4567-e89b-12d3-a456-426614174000",
        address: "Plaza Mayor 1",
        postal_code: "24700",
        latitude: 42.4578,
        longitude: -6.0535,
      };

      mockHandle.mockImplementation(async (_req, res) => {
        return res.status(201).json([{ id: "new-id", ...newLocation }]);
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: newLocation,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(mockHandle).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            address: "Plaza Mayor 1",
            postal_code: "24700",
            latitude: 42.4578,
            longitude: -6.0535,
          }),
        }),
        res
      );
    });
  });

  describe("PUT /api/ubicaciones", () => {
    it("debe actualizar una ubicación existente", async () => {
      const updateData = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        city: "Santiago (actualizado)",
        province: "A Coruña",
      };

      mockHandle.mockImplementation(async (_req, res) => {
        return res.status(200).json([updateData]);
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        body: updateData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockHandle).toHaveBeenCalledWith(
        expect.objectContaining({
          body: updateData,
        }),
        res
      );
    });

    it("debe actualizar solo campos específicos", async () => {
      const updateData = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        address: "Nueva dirección",
        postal_code: "15705",
      };

      mockHandle.mockImplementation(async (_req, res) => {
        return res.status(200).json([
          {
            id: updateData.id,
            city: "Santiago de Compostela",
            province: "A Coruña",
            address: updateData.address,
            postal_code: updateData.postal_code,
          },
        ]);
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        body: updateData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockHandle).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            id: updateData.id,
            address: "Nueva dirección",
          }),
        }),
        res
      );
    });
  });

  describe("DELETE /api/ubicaciones", () => {
    it("debe eliminar una ubicación por ID", async () => {
      const locationId = "123e4567-e89b-12d3-a456-426614174000";

      mockHandle.mockImplementation(async (_req, res) => {
        return res
          .status(200)
          .json({ message: "Ubicación eliminada exitosamente" });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        body: { id: locationId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockHandle).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { id: locationId },
        }),
        res
      );
    });
  });

  describe("Delegación al controller", () => {
    it("debe delegar todos los métodos HTTP al LocationController", async () => {
      const methods: ("GET" | "POST" | "PUT" | "DELETE")[] = [
        "GET",
        "POST",
        "PUT",
        "DELETE",
      ];

      for (const method of methods) {
        jest.clearAllMocks();

        mockHandle.mockImplementation(async (_req, res) => {
          return res.status(200).json({});
        });

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method,
          query: method === "GET" ? {} : undefined,
          body: method !== "GET" ? {} : undefined,
        });

        await handler(req, res);

        expect(LocationController).toHaveBeenCalledTimes(1);
        expect(mockHandle).toHaveBeenCalledTimes(1);
      }
    });
  });
});
