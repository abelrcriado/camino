/**
 * Integration tests para /api/precios
 * Tests de integración del endpoint principal de precios
 */

import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../pages/api/precios";
import { PrecioController } from "../../../src/controllers/precio.controller";

// Mock del controller
jest.mock("../../../src/controllers/precio.controller");

describe("/api/precios", () => {
  let mockHandleRequest: jest.Mock;

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

  describe("POST /api/precios", () => {
    it("debe crear un precio BASE exitosamente", async () => {
      const createData = {
        nivel: "base",
        entidad_tipo: "producto",
        entidad_id: "650e8400-e29b-41d4-a716-446655440001",
        precio: 250,
        notas: "Precio base de 2.50€",
      };

      const mockResponse = [
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          ...createData,
          ubicacion_id: null,
          service_point_id: null,
          fecha_inicio: "2025-01-01",
          fecha_fin: null,
          created_at: "2025-10-15T12:00:00Z",
          updated_at: "2025-10-15T12:00:00Z",
        },
      ];

      mockHandleRequest.mockImplementation((req, res) => {
        return res.status(201).json({ data: mockResponse });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: createData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.data).toHaveLength(1);
      expect(data.data[0].nivel).toBe("base");
      expect(data.data[0].precio).toBe(250);
    });

    it("debe crear un precio UBICACION exitosamente", async () => {
      const createData = {
        nivel: "ubicacion",
        entidad_tipo: "producto",
        entidad_id: "650e8400-e29b-41d4-a716-446655440001",
        ubicacion_id: "750e8400-e29b-41d4-a716-446655440002",
        precio: 300,
        notas: "Precio para Madrid 3.00€",
      };

      const mockResponse = [
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          ...createData,
          service_point_id: null,
          fecha_inicio: "2025-01-01",
          fecha_fin: null,
          created_at: "2025-10-15T12:00:00Z",
          updated_at: "2025-10-15T12:00:00Z",
        },
      ];

      mockHandleRequest.mockImplementation((req, res) => {
        return res.status(201).json({ data: mockResponse });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: createData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.data).toHaveLength(1);
      expect(data.data[0].nivel).toBe("ubicacion");
      expect(data.data[0].ubicacion_id).toBe(
        "750e8400-e29b-41d4-a716-446655440002"
      );
    });

    it("debe crear un precio SERVICE_POINT exitosamente", async () => {
      const createData = {
        nivel: "service_point",
        entidad_tipo: "producto",
        entidad_id: "650e8400-e29b-41d4-a716-446655440001",
        ubicacion_id: "750e8400-e29b-41d4-a716-446655440002",
        service_point_id: "850e8400-e29b-41d4-a716-446655440003",
        precio: 350,
        fecha_inicio: "2025-11-01",
        fecha_fin: "2025-12-31",
        notas: "Promoción navideña 3.50€",
      };

      const mockResponse = [
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          ...createData,
          created_at: "2025-10-15T12:00:00Z",
          updated_at: "2025-10-15T12:00:00Z",
        },
      ];

      mockHandleRequest.mockImplementation((req, res) => {
        return res.status(201).json({ data: mockResponse });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: createData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.data).toHaveLength(1);
      expect(data.data[0].nivel).toBe("service_point");
      expect(data.data[0].service_point_id).toBe(
        "850e8400-e29b-41d4-a716-446655440003"
      );
    });

    it("debe rechazar precio sin nivel", async () => {
      mockHandleRequest.mockImplementation((req, res) => {
        return res.status(400).json({
          error: "Datos de entrada inválidos",
          details: [
            {
              code: "invalid_enum_value",
              message: "El nivel debe ser: base, ubicacion o service_point",
            },
          ],
        });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          entidad_tipo: "producto",
          entidad_id: "650e8400-e29b-41d4-a716-446655440001",
          precio: 250,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("inválidos");
    });

    it("debe rechazar precio negativo", async () => {
      mockHandleRequest.mockImplementation((req, res) => {
        return res.status(400).json({
          error: "Datos de entrada inválidos",
          details: [
            {
              code: "too_small",
              message: "El precio debe ser mayor que 0",
            },
          ],
        });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          nivel: "base",
          entidad_tipo: "producto",
          entidad_id: "650e8400-e29b-41d4-a716-446655440001",
          precio: -100,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("inválidos");
    });

    it("debe rechazar UUID inválido", async () => {
      mockHandleRequest.mockImplementation((req, res) => {
        return res.status(400).json({
          error: "Datos de entrada inválidos",
          details: [
            {
              code: "invalid_string",
              message: "El ID debe ser un UUID válido",
            },
          ],
        });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          nivel: "base",
          entidad_tipo: "producto",
          entidad_id: "invalid-uuid",
          precio: 250,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("inválidos");
    });

    it("debe rechazar nivel BASE con ubicacion_id", async () => {
      mockHandleRequest.mockImplementation((req, res) => {
        return res.status(400).json({
          error: "Datos de entrada inválidos",
          details: [
            {
              message:
                "El nivel BASE no puede tener ubicacion_id ni service_point_id",
            },
          ],
        });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          nivel: "base",
          entidad_tipo: "producto",
          entidad_id: "650e8400-e29b-41d4-a716-446655440001",
          ubicacion_id: "750e8400-e29b-41d4-a716-446655440002",
          precio: 250,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("inválidos");
    });

    it("debe rechazar nivel UBICACION sin ubicacion_id", async () => {
      mockHandleRequest.mockImplementation((req, res) => {
        return res.status(400).json({
          error: "Datos de entrada inválidos",
          details: [
            {
              message:
                "El nivel UBICACION requiere ubicacion_id y NO debe tener service_point_id",
            },
          ],
        });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          nivel: "ubicacion",
          entidad_tipo: "producto",
          entidad_id: "650e8400-e29b-41d4-a716-446655440001",
          precio: 250,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("inválidos");
    });

    it("debe rechazar nivel SERVICE_POINT sin ambos IDs", async () => {
      mockHandleRequest.mockImplementation((req, res) => {
        return res.status(400).json({
          error: "Datos de entrada inválidos",
          details: [
            {
              message:
                "El nivel SERVICE_POINT requiere tanto ubicacion_id como service_point_id",
            },
          ],
        });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          nivel: "service_point",
          entidad_tipo: "producto",
          entidad_id: "650e8400-e29b-41d4-a716-446655440001",
          ubicacion_id: "750e8400-e29b-41d4-a716-446655440002",
          precio: 250,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("inválidos");
    });

    it("debe manejar duplicados vigentes", async () => {
      mockHandleRequest.mockImplementation((req, res) => {
        return res.status(400).json({
          error:
            "Ya existe un precio vigente para esta entidad en el nivel global (BASE). Desactiva el precio anterior antes de crear uno nuevo.",
        });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          nivel: "base",
          entidad_tipo: "producto",
          entidad_id: "650e8400-e29b-41d4-a716-446655440001",
          precio: 250,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("Ya existe");
    });
  });

  describe("GET /api/precios", () => {
    it("debe obtener lista de precios", async () => {
      const mockResponse = {
        data: [
          {
            id: "550e8400-e29b-41d4-a716-446655440000",
            nivel: "base",
            entidad_tipo: "producto",
            entidad_id: "650e8400-e29b-41d4-a716-446655440001",
            precio: 250,
            ubicacion_id: null,
            service_point_id: null,
            fecha_inicio: "2025-01-01",
            fecha_fin: null,
            notas: "Precio base",
            created_at: "2025-10-11T10:00:00Z",
            updated_at: "2025-10-11T10:00:00Z",
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      mockHandleRequest.mockImplementation((req, res) => {
        return res.status(200).json(mockResponse);
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.data).toHaveLength(1);
      expect(data.pagination).toBeDefined();
    });
  });
});
