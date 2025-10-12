/**
 * Tests para /api/precios/[id].ts
 * Endpoint para operaciones sobre precios individuales
 */

import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../pages/api/precios/[id]";
import { PrecioController } from "../../../src/controllers/precio.controller";

// Mock del controller
jest.mock("../../../src/controllers/precio.controller");

describe("/api/precios/[id]", () => {
  let mockHandleRequest: jest.Mock;
  const validUuid = "550e8400-e29b-41d4-a716-446655440001";
  const invalidUuid = "invalid-uuid-format";

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock del controller
    mockHandleRequest = jest.fn();
    (
      PrecioController as jest.MockedClass<typeof PrecioController>
    ).mockImplementation(() => {
      return {
        handleRequest: mockHandleRequest,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
    });
  });

  describe("GET /api/precios/[id]", () => {
    it("debe obtener un precio por ID válido", async () => {
      const mockPrecio = {
        id: validUuid,
        entidad_tipo: "SERVICE_POINT",
        entidad_id: "550e8400-e29b-41d4-a716-446655440002",
        producto_id: "550e8400-e29b-41d4-a716-446655440003",
        precio: 25.5,
        moneda: "EUR",
        is_active: true,
        created_at: "2025-01-15T10:00:00Z",
      };

      mockHandleRequest.mockImplementation((req, res) => {
        return res.status(200).json(mockPrecio);
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(mockHandleRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ id: validUuid }),
        }),
        res
      );
      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.id).toBe(validUuid);
      expect(data.precio).toBe(25.5);
      expect(data.moneda).toBe("EUR");
    });

    it("debe incluir tipo de entidad en la respuesta", async () => {
      const mockPrecio = {
        id: validUuid,
        entidad_tipo: "UBICACION",
        entidad_id: "550e8400-e29b-41d4-a716-446655440002",
        producto_id: "550e8400-e29b-41d4-a716-446655440003",
        precio: 20.0,
        moneda: "EUR",
        is_active: true,
      };

      mockHandleRequest.mockImplementation((req, res) => {
        return res.status(200).json(mockPrecio);
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.entidad_tipo).toBe("UBICACION");
    });

    it("debe retornar 400 si el ID no está presente", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {},
      });

      await handler(req, res);

      expect(mockHandleRequest).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("ID de precio es requerido");
    });

    it("debe retornar 400 si el ID no es string", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: ["array", "of", "ids"] },
      });

      await handler(req, res);

      expect(mockHandleRequest).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("ID de precio es requerido");
    });

    it("debe retornar 400 si el ID no es UUID válido", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: invalidUuid },
      });

      await handler(req, res);

      expect(mockHandleRequest).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("ID de precio inválido");
    });

    it("debe inyectar el ID en req.query antes de delegar", async () => {
      mockHandleRequest.mockImplementation((req, res) => {
        return res.status(200).json({ id: req.query.id });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(mockHandleRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ id: validUuid }),
        }),
        res
      );
    });

    it("debe retornar 404 si el precio no existe", async () => {
      mockHandleRequest.mockImplementation((req, res) => {
        return res.status(404).json({ error: "Precio no encontrado" });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("Precio no encontrado");
    });
  });

  describe("PUT /api/precios/[id]", () => {
    it("debe actualizar un precio exitosamente", async () => {
      const updateData = {
        precio: 30.0,
        moneda: "EUR",
        is_active: true,
      };

      const mockResponse = [
        {
          id: validUuid,
          entidad_tipo: "SERVICE_POINT",
          entidad_id: "550e8400-e29b-41d4-a716-446655440002",
          producto_id: "550e8400-e29b-41d4-a716-446655440003",
          ...updateData,
          updated_at: "2025-01-15T11:00:00Z",
        },
      ];

      mockHandleRequest.mockImplementation((req, res) => {
        return res.status(200).json(mockResponse);
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        query: { id: validUuid },
        body: updateData,
      });

      await handler(req, res);

      expect(mockHandleRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ id: validUuid }),
          body: expect.objectContaining({ ...updateData, id: validUuid }),
        }),
        res
      );
      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(Array.isArray(data)).toBe(true);
      expect(data[0].precio).toBe(30.0);
    });

    it("debe inyectar el ID en req.body para PUT", async () => {
      mockHandleRequest.mockImplementation((req, res) => {
        return res.status(200).json([{ id: req.body.id }]);
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        query: { id: validUuid },
        body: { precio: 25.0 },
      });

      await handler(req, res);

      expect(mockHandleRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({ id: validUuid }),
        }),
        res
      );
    });

    it("debe permitir actualizar solo el precio", async () => {
      const mockResponse = [
        {
          id: validUuid,
          precio: 35.0,
        },
      ];

      mockHandleRequest.mockImplementation((req, res) => {
        return res.status(200).json(mockResponse);
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        query: { id: validUuid },
        body: { precio: 35.0 },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data[0].precio).toBe(35.0);
    });

    it("debe permitir actualizar solo la moneda", async () => {
      const mockResponse = [
        {
          id: validUuid,
          moneda: "USD",
        },
      ];

      mockHandleRequest.mockImplementation((req, res) => {
        return res.status(200).json(mockResponse);
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        query: { id: validUuid },
        body: { moneda: "USD" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data[0].moneda).toBe("USD");
    });

    it("debe permitir actualizar solo is_active", async () => {
      const mockResponse = [
        {
          id: validUuid,
          is_active: false,
        },
      ];

      mockHandleRequest.mockImplementation((req, res) => {
        return res.status(200).json(mockResponse);
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        query: { id: validUuid },
        body: { is_active: false },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data[0].is_active).toBe(false);
    });

    it("debe retornar 400 para validaciones fallidas", async () => {
      mockHandleRequest.mockImplementation((req, res) => {
        return res.status(400).json({ error: "El precio debe ser mayor a 0" });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        query: { id: validUuid },
        body: { precio: -10.0 },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("precio");
    });
  });

  describe("DELETE /api/precios/[id]", () => {
    it("debe eliminar un precio exitosamente", async () => {
      mockHandleRequest.mockImplementation((req, res) => {
        return res
          .status(200)
          .json({ message: "Precio eliminado exitosamente" });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(mockHandleRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ id: validUuid }),
        }),
        res
      );
      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.message).toContain("Precio eliminado exitosamente");
    });

    it("debe inyectar el ID en req.query para DELETE", async () => {
      mockHandleRequest.mockImplementation((req, res) => {
        return res.status(200).json({ message: "Eliminado" });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(mockHandleRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ id: validUuid }),
        }),
        res
      );
    });

    it("debe retornar 404 si el precio no existe", async () => {
      mockHandleRequest.mockImplementation((req, res) => {
        return res.status(404).json({ error: "Precio no encontrado" });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("Precio no encontrado");
    });
  });

  describe("Métodos HTTP no permitidos", () => {
    const unsupportedMethods: ("POST" | "PATCH")[] = ["POST", "PATCH"];

    unsupportedMethods.forEach((method) => {
      it(`debe retornar 405 para método ${method}`, async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method,
          query: { id: validUuid },
        });

        await handler(req, res);

        expect(mockHandleRequest).not.toHaveBeenCalled();
        expect(res._getStatusCode()).toBe(405);
        const data = JSON.parse(res._getData());
        expect(data.error).toContain("Método no permitido");
      });
    });
  });

  describe("Manejo de errores", () => {
    it("debe retornar 500 si el controller lanza error (GET - asyncHandler)", async () => {
      mockHandleRequest.mockImplementation(() => {
        throw new Error("Database query failed");
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.code).toBe("INTERNAL_SERVER_ERROR");
      expect(data.error).toBeDefined();
    });

    it("debe retornar 500 si el controller lanza error (PUT - asyncHandler)", async () => {
      mockHandleRequest.mockImplementation(() => {
        throw new Error("Update failed");
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        query: { id: validUuid },
        body: { precio: 30.0 },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.code).toBe("INTERNAL_SERVER_ERROR");
      expect(data.error).toBeDefined();
    });

    it("debe retornar 500 si el controller lanza error (DELETE - asyncHandler)", async () => {
      mockHandleRequest.mockImplementation(() => {
        throw new Error("Delete failed");
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.code).toBe("INTERNAL_SERVER_ERROR");
      expect(data.error).toBeDefined();
    });
  });

  describe("Integración", () => {
    it("debe instanciar el controller correctamente", async () => {
      mockHandleRequest.mockImplementation((req, res) => {
        return res.status(200).json({ id: validUuid });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(PrecioController).toHaveBeenCalledTimes(1);
      expect(mockHandleRequest).toHaveBeenCalledWith(
        expect.objectContaining({ query: { id: validUuid } }),
        res
      );
    });
  });
});
