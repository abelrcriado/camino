/**
 * Tests para /api/precios/resolver.ts
 * Endpoint para resolver precio jerárquico según contexto
 */

import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../pages/api/precios/resolver";
import { PrecioService } from "@/api/services/precio.service";

// Mock del servicio
jest.mock("@/api/services/precio.service");

describe("/api/precios/resolver", () => {
  let mockResolverPrecio: jest.Mock;
  const validProductoId = "550e8400-e29b-41d4-a716-446655440001";
  const validServicePointId = "550e8400-e29b-41d4-a716-446655440002";
  const validUbicacionId = "550e8400-e29b-41d4-a716-446655440003";
  const invalidUuid = "invalid-uuid-format";

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock del servicio
    mockResolverPrecio = jest.fn();
    (
      PrecioService as jest.MockedClass<typeof PrecioService>
    ).mockImplementation(() => {
      return {
        resolverPrecio: mockResolverPrecio,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
    });
  });

  describe("POST /api/precios/resolver", () => {
    it("debe resolver precio de SERVICE_POINT (máxima prioridad)", async () => {
      const mockPrecio = {
        id: "550e8400-e29b-41d4-a716-446655440010",
        entidad_tipo: "SERVICE_POINT",
        entidad_id: validServicePointId,
        producto_id: validProductoId,
        precio: 30.0,
        moneda: "EUR",
        nivel: "service_point",
      };

      mockResolverPrecio.mockResolvedValue(mockPrecio);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          producto_id: validProductoId,
          service_point_id: validServicePointId,
          ubicacion_id: validUbicacionId,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.precio).toEqual(mockPrecio);
      expect(data.resolucion.nivel_aplicado).toBe("SERVICE_POINT");
      expect(data.resolucion.producto_id).toBe(validProductoId);
      expect(data.resolucion.service_point_id).toBe(validServicePointId);
      expect(data.resolucion.ubicacion_id).toBe(validUbicacionId);
    });

    it("debe resolver precio de UBICACION (prioridad media)", async () => {
      const mockPrecio = {
        id: "550e8400-e29b-41d4-a716-446655440011",
        entidad_tipo: "UBICACION",
        entidad_id: validUbicacionId,
        producto_id: validProductoId,
        precio: 25.0,
        moneda: "EUR",
        nivel: "ubicacion",
      };

      mockResolverPrecio.mockResolvedValue(mockPrecio);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          producto_id: validProductoId,
          ubicacion_id: validUbicacionId,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.precio).toEqual(mockPrecio);
      expect(data.resolucion.nivel_aplicado).toBe("UBICACION");
      expect(data.resolucion.service_point_id).toBeNull();
      expect(data.resolucion.ubicacion_id).toBe(validUbicacionId);
    });

    it("debe resolver precio BASE (fallback)", async () => {
      const mockPrecio = {
        id: "550e8400-e29b-41d4-a716-446655440012",
        entidad_tipo: "BASE",
        entidad_id: validProductoId,
        producto_id: validProductoId,
        precio: 20.0,
        moneda: "EUR",
        nivel: "base",
      };

      mockResolverPrecio.mockResolvedValue(mockPrecio);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          producto_id: validProductoId,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.precio).toEqual(mockPrecio);
      expect(data.resolucion.nivel_aplicado).toBe("BASE");
      expect(data.resolucion.service_point_id).toBeNull();
      expect(data.resolucion.ubicacion_id).toBeNull();
    });

    it("debe retornar precio null si no hay precio definido (NINGUNO)", async () => {
      mockResolverPrecio.mockResolvedValue(null);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          producto_id: validProductoId,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.precio).toBeNull();
      expect(data.resolucion.nivel_aplicado).toBe("NINGUNO");
      expect(data.resolucion.producto_id).toBe(validProductoId);
    });

    it("debe resolver solo con producto_id (contexto mínimo)", async () => {
      const mockPrecio = {
        id: "550e8400-e29b-41d4-a716-446655440012",
        entidad_tipo: "BASE",
        producto_id: validProductoId,
        precio: 20.0,
        moneda: "EUR",
        nivel: "base",
      };

      mockResolverPrecio.mockResolvedValue(mockPrecio);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          producto_id: validProductoId,
        },
      });

      await handler(req, res);

      expect(mockResolverPrecio).toHaveBeenCalledWith(
        expect.objectContaining({
          entidad_tipo: "producto",
          entidad_id: validProductoId,
          ubicacion_id: undefined,
          service_point_id: undefined,
        })
      );
      expect(res._getStatusCode()).toBe(200);
    });

    it("debe resolver con producto_id + service_point_id", async () => {
      const mockPrecio = {
        id: "550e8400-e29b-41d4-a716-446655440010",
        precio: 30.0,
        nivel: "service_point",
      };

      mockResolverPrecio.mockResolvedValue(mockPrecio);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          producto_id: validProductoId,
          service_point_id: validServicePointId,
        },
      });

      await handler(req, res);

      expect(mockResolverPrecio).toHaveBeenCalledWith(
        expect.objectContaining({
          entidad_tipo: "producto",
          entidad_id: validProductoId,
          ubicacion_id: undefined,
          service_point_id: validServicePointId,
        })
      );
      expect(res._getStatusCode()).toBe(200);
    });

    it("debe resolver con producto_id + ubicacion_id", async () => {
      const mockPrecio = {
        id: "550e8400-e29b-41d4-a716-446655440011",
        precio: 25.0,
        nivel: "ubicacion",
      };

      mockResolverPrecio.mockResolvedValue(mockPrecio);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          producto_id: validProductoId,
          ubicacion_id: validUbicacionId,
        },
      });

      await handler(req, res);

      expect(mockResolverPrecio).toHaveBeenCalledWith(
        expect.objectContaining({
          entidad_tipo: "producto",
          entidad_id: validProductoId,
          ubicacion_id: validUbicacionId,
          service_point_id: undefined,
        })
      );
      expect(res._getStatusCode()).toBe(200);
    });

    it("debe resolver con todos los contextos (contexto completo)", async () => {
      const mockPrecio = {
        id: "550e8400-e29b-41d4-a716-446655440010",
        precio: 30.0,
        nivel: "service_point",
      };

      mockResolverPrecio.mockResolvedValue(mockPrecio);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          producto_id: validProductoId,
          service_point_id: validServicePointId,
          ubicacion_id: validUbicacionId,
        },
      });

      await handler(req, res);

      expect(mockResolverPrecio).toHaveBeenCalledWith(
        expect.objectContaining({
          entidad_tipo: "producto",
          entidad_id: validProductoId,
          ubicacion_id: validUbicacionId,
          service_point_id: validServicePointId,
        })
      );
      expect(res._getStatusCode()).toBe(200);
    });

    it("debe retornar 400 si falta producto_id", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          service_point_id: validServicePointId,
        },
      });

      await handler(req, res);

      expect(mockResolverPrecio).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("ID de producto es requerido");
    });

    it("debe retornar 400 si producto_id es null", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          producto_id: null,
          service_point_id: validServicePointId,
        },
      });

      await handler(req, res);

      expect(mockResolverPrecio).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("ID de producto es requerido");
    });

    it("debe retornar 400 si producto_id no es string", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          producto_id: 123456,
        },
      });

      await handler(req, res);

      expect(mockResolverPrecio).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("ID debe ser un string");
    });

    it("debe retornar 400 si producto_id no es UUID válido", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          producto_id: invalidUuid,
        },
      });

      await handler(req, res);

      expect(mockResolverPrecio).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("producto debe ser un UUID válido");
    });

    it("debe retornar 400 si service_point_id no es UUID válido", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          producto_id: validProductoId,
          service_point_id: invalidUuid,
        },
      });

      await handler(req, res);

      expect(mockResolverPrecio).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("service point debe ser un UUID válido");
    });

    it("debe retornar 400 si ubicacion_id no es UUID válido", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          producto_id: validProductoId,
          ubicacion_id: invalidUuid,
        },
      });

      await handler(req, res);

      expect(mockResolverPrecio).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("ubicación debe ser un UUID válido");
    });

    it("debe permitir service_point_id y ubicacion_id opcionales", async () => {
      const mockPrecio = {
        id: "550e8400-e29b-41d4-a716-446655440012",
        precio: 20.0,
        nivel: "base",
      };

      mockResolverPrecio.mockResolvedValue(mockPrecio);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          producto_id: validProductoId,
          service_point_id: undefined,
          ubicacion_id: undefined,
        },
      });

      await handler(req, res);

      expect(mockResolverPrecio).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(200);
    });

    it("debe retornar 500 si el producto no existe (asyncHandler convierte a 500)", async () => {
      mockResolverPrecio.mockRejectedValue(new Error("Producto no encontrado"));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          producto_id: validProductoId,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.code).toBe("INTERNAL_SERVER_ERROR");
      expect(data.error).toBeDefined();
    });

    it("debe retornar 500 si el service_point no existe (asyncHandler convierte a 500)", async () => {
      mockResolverPrecio.mockRejectedValue(
        new Error("Service point no encontrado")
      );

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          producto_id: validProductoId,
          service_point_id: validServicePointId,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.code).toBe("INTERNAL_SERVER_ERROR");
      expect(data.error).toBeDefined();
    });

    it("debe retornar 500 si la ubicacion no existe (asyncHandler convierte a 500)", async () => {
      mockResolverPrecio.mockRejectedValue(
        new Error("Ubicación no encontrado")
      );

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          producto_id: validProductoId,
          ubicacion_id: validUbicacionId,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.code).toBe("INTERNAL_SERVER_ERROR");
      expect(data.error).toBeDefined();
    });
  });

  describe("Mapeo de niveles", () => {
    it("debe mapear nivel 'service_point' a 'SERVICE_POINT'", async () => {
      const mockPrecio = {
        id: "550e8400-e29b-41d4-a716-446655440010",
        precio: 30.0,
        nivel: "service_point",
      };

      mockResolverPrecio.mockResolvedValue(mockPrecio);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: { producto_id: validProductoId },
      });

      await handler(req, res);

      const data = JSON.parse(res._getData());
      expect(data.resolucion.nivel_aplicado).toBe("SERVICE_POINT");
    });

    it("debe mapear nivel 'ubicacion' a 'UBICACION'", async () => {
      const mockPrecio = {
        id: "550e8400-e29b-41d4-a716-446655440011",
        precio: 25.0,
        nivel: "ubicacion",
      };

      mockResolverPrecio.mockResolvedValue(mockPrecio);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: { producto_id: validProductoId },
      });

      await handler(req, res);

      const data = JSON.parse(res._getData());
      expect(data.resolucion.nivel_aplicado).toBe("UBICACION");
    });

    it("debe mapear nivel 'base' a 'BASE'", async () => {
      const mockPrecio = {
        id: "550e8400-e29b-41d4-a716-446655440012",
        precio: 20.0,
        nivel: "base",
      };

      mockResolverPrecio.mockResolvedValue(mockPrecio);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: { producto_id: validProductoId },
      });

      await handler(req, res);

      const data = JSON.parse(res._getData());
      expect(data.resolucion.nivel_aplicado).toBe("BASE");
    });

    it("debe usar 'NINGUNO' para niveles desconocidos", async () => {
      const mockPrecio = {
        id: "550e8400-e29b-41d4-a716-446655440013",
        precio: 15.0,
        nivel: "unknown_level",
      };

      mockResolverPrecio.mockResolvedValue(mockPrecio);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: { producto_id: validProductoId },
      });

      await handler(req, res);

      const data = JSON.parse(res._getData());
      expect(data.resolucion.nivel_aplicado).toBe("NINGUNO");
    });
  });

  describe("Métodos HTTP no permitidos", () => {
    const unsupportedMethods: ("GET" | "PUT" | "DELETE" | "PATCH")[] = [
      "GET",
      "PUT",
      "DELETE",
      "PATCH",
    ];

    unsupportedMethods.forEach((method) => {
      it(`debe retornar 405 para método ${method}`, async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method,
          body: { producto_id: validProductoId },
        });

        await handler(req, res);

        expect(mockResolverPrecio).not.toHaveBeenCalled();
        expect(res._getStatusCode()).toBe(405);
        const data = JSON.parse(res._getData());
        expect(data.error).toContain("Método no permitido");
      });
    });
  });

  describe("Manejo de errores", () => {
    it("debe retornar 500 para errores internos del servicio (asyncHandler)", async () => {
      mockResolverPrecio.mockRejectedValue(
        new Error("Database connection failed")
      );

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: { producto_id: validProductoId },
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
      const mockPrecio = {
        id: "550e8400-e29b-41d4-a716-446655440012",
        precio: 20.0,
        nivel: "base",
      };

      mockResolverPrecio.mockResolvedValue(mockPrecio);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: { producto_id: validProductoId },
      });

      await handler(req, res);

      expect(PrecioService).toHaveBeenCalledTimes(1);
      expect(mockResolverPrecio).toHaveBeenCalledWith(
        expect.objectContaining({
          entidad_tipo: "producto",
          entidad_id: validProductoId,
        })
      );
    });
  });
});
