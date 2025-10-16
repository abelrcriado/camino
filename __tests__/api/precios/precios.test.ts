/**
 * API Integration Tests for /api/precios
 * Tests POST endpoint - verifies the endpoint is properly wired
 */

import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../pages/api/precios";
import { PrecioService } from "../../../src/services/precio.service";
import { NivelPrecio, EntidadTipo } from "../../../src/dto/precio.dto";

// Mock del service
jest.mock("../../../src/services/precio.service");

describe("/api/precios - POST Endpoint", () => {
  let mockCreate: jest.Mock;

  const validProductoId = "650e8400-e29b-41d4-a716-446655440001";
  const validUbicacionId = "750e8400-e29b-41d4-a716-446655440002";
  const validServicePointId = "850e8400-e29b-41d4-a716-446655440003";
  const validPrecioId = "550e8400-e29b-41d4-a716-446655440000";

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock del create method
    mockCreate = jest.fn();

    (PrecioService as jest.MockedClass<typeof PrecioService>).mockImplementation(
      () => {
        return {
          create: mockCreate,
          findAllWithFilters: jest.fn(),
          update: jest.fn(),
          softDelete: jest.fn(),
          hardDelete: jest.fn(),
          getPreciosVigentes: jest.fn(),
          resolverPrecio: jest.fn(),
          getStats: jest.fn(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      }
    );
  });

  describe("POST /api/precios - Create Precio", () => {
    it("debe crear un precio BASE correctamente", async () => {
      const newPrecio = {
        nivel: NivelPrecio.BASE,
        entidad_tipo: EntidadTipo.PRODUCTO,
        entidad_id: validProductoId,
        precio: 250,
        notas: "Precio base de 2.50€",
      };

      const mockResponse = {
        id: validPrecioId,
        ...newPrecio,
        ubicacion_id: null,
        service_point_id: null,
        fecha_inicio: "2025-10-15",
        fecha_fin: null,
        created_at: "2025-10-15T11:00:00Z",
        updated_at: "2025-10-15T11:00:00Z",
      };

      mockCreate.mockResolvedValue(mockResponse);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: newPrecio,
      });

      await handler(req, res);

      expect(mockCreate).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.data).toHaveLength(1);
      expect(data.data[0].nivel).toBe(NivelPrecio.BASE);
      expect(data.data[0].precio).toBe(250);
    });

    it("debe crear un precio UBICACION con ubicacion_id", async () => {
      const newPrecio = {
        nivel: NivelPrecio.UBICACION,
        entidad_tipo: EntidadTipo.PRODUCTO,
        entidad_id: validProductoId,
        ubicacion_id: validUbicacionId,
        precio: 300,
      };

      const mockResponse = {
        id: validPrecioId,
        ...newPrecio,
        service_point_id: null,
        fecha_inicio: "2025-10-15",
        fecha_fin: null,
        created_at: "2025-10-15T11:00:00Z",
        updated_at: "2025-10-15T11:00:00Z",
      };

      mockCreate.mockResolvedValue(mockResponse);

      const { req, res} = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: newPrecio,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.data[0].nivel).toBe(NivelPrecio.UBICACION);
      expect(data.data[0].ubicacion_id).toBe(validUbicacionId);
    });

    it("debe crear un precio SERVICE_POINT con ambos IDs", async () => {
      const newPrecio = {
        nivel: NivelPrecio.SERVICE_POINT,
        entidad_tipo: EntidadTipo.PRODUCTO,
        entidad_id: validProductoId,
        ubicacion_id: validUbicacionId,
        service_point_id: validServicePointId,
        precio: 350,
        fecha_inicio: "2025-11-01",
        fecha_fin: "2025-12-31",
      };

      const mockResponse = {
        id: validPrecioId,
        ...newPrecio,
        created_at: "2025-10-15T11:00:00Z",
        updated_at: "2025-10-15T11:00:00Z",
      };

      mockCreate.mockResolvedValue(mockResponse);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: newPrecio,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.data[0].nivel).toBe(NivelPrecio.SERVICE_POINT);
      expect(data.data[0].ubicacion_id).toBe(validUbicacionId);
      expect(data.data[0].service_point_id).toBe(validServicePointId);
    });

    it("debe rechazar precio BASE con ubicacion_id (validación de jerarquía)", async () => {
      const invalidPrecio = {
        nivel: NivelPrecio.BASE,
        entidad_tipo: EntidadTipo.PRODUCTO,
        entidad_id: validProductoId,
        ubicacion_id: validUbicacionId, // NO DEBE ESTAR
        precio: 250,
      };

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: invalidPrecio,
      });

      await handler(req, res);

      expect(mockCreate).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("inválidos");
    });

    it("debe rechazar precio negativo (validación de schema)", async () => {
      const invalidPrecio = {
        nivel: NivelPrecio.BASE,
        entidad_tipo: EntidadTipo.PRODUCTO,
        entidad_id: validProductoId,
        precio: -100,
      };

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: invalidPrecio,
      });

      await handler(req, res);

      expect(mockCreate).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
    });

    it("debe rechazar UUID inválido en entidad_id", async () => {
      const invalidPrecio = {
        nivel: NivelPrecio.BASE,
        entidad_tipo: EntidadTipo.PRODUCTO,
        entidad_id: "invalid-uuid",
        precio: 250,
      };

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: invalidPrecio,
      });

      await handler(req, res);

      expect(mockCreate).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
    });
  });
});
