/**
 * Tests para /api/ventas-app/[id].ts
 * Endpoint para obtener detalle de una venta específica
 */

import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../pages/api/ventas-app/[id]";
import { VentaAppController } from "../../../src/controllers/venta_app.controller";

// Mock del controller
jest.mock("../../../src/controllers/venta_app.controller");

describe("/api/ventas-app/[id]", () => {
  let mockHandle: jest.Mock;
  const validUuid = "550e8400-e29b-41d4-a716-446655440001";
  const invalidUuid = "invalid-uuid-format";

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock del controller
    mockHandle = jest.fn();
    (
      VentaAppController as jest.MockedClass<typeof VentaAppController>
    ).mockImplementation(() => {
      return {
        handle: mockHandle,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
    });
  });

  describe("GET /api/ventas-app/[id]", () => {
    it("debe obtener una venta por ID válido", async () => {
      const mockVenta = {
        id: validUuid,
        user_id: "550e8400-e29b-41d4-a716-446655440002",
        slot_id: "550e8400-e29b-41d4-a716-446655440003",
        cantidad: 2,
        precio_unitario: 15.5,
        precio_total: 31.0,
        estado: "pagada",
        codigo_retiro: "ABC123",
        fecha_reserva: "2025-01-15T10:00:00Z",
        fecha_pago: "2025-01-15T10:05:00Z",
        fecha_retiro: null,
        fecha_expiracion: "2025-01-16T10:00:00Z",
        created_at: "2025-01-15T10:00:00Z",
        updated_at: "2025-01-15T10:05:00Z",
      };

      mockHandle.mockImplementation((req, res) => {
        return res.status(200).json(mockVenta);
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(mockHandle).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ id: validUuid }),
        }),
        res
      );
      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.id).toBe(validUuid);
      expect(data.estado).toBe("pagada");
      expect(data.codigo_retiro).toBe("ABC123");
    });

    it("debe incluir todos los campos de fechas", async () => {
      const mockVenta = {
        id: validUuid,
        user_id: "550e8400-e29b-41d4-a716-446655440002",
        slot_id: "550e8400-e29b-41d4-a716-446655440003",
        cantidad: 1,
        precio_unitario: 20.0,
        precio_total: 20.0,
        estado: "retirada",
        codigo_retiro: "XYZ789",
        fecha_reserva: "2025-01-15T08:00:00Z",
        fecha_pago: "2025-01-15T08:10:00Z",
        fecha_retiro: "2025-01-15T14:30:00Z",
        fecha_expiracion: "2025-01-16T08:00:00Z",
        created_at: "2025-01-15T08:00:00Z",
        updated_at: "2025-01-15T14:30:00Z",
      };

      mockHandle.mockImplementation((req, res) => {
        return res.status(200).json(mockVenta);
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.fecha_reserva).toBeDefined();
      expect(data.fecha_pago).toBeDefined();
      expect(data.fecha_retiro).toBeDefined();
      expect(data.fecha_expiracion).toBeDefined();
      expect(data.created_at).toBeDefined();
      expect(data.updated_at).toBeDefined();
    });

    it("debe retornar venta con estado reservada (sin pagar)", async () => {
      const mockVenta = {
        id: validUuid,
        user_id: "550e8400-e29b-41d4-a716-446655440002",
        slot_id: "550e8400-e29b-41d4-a716-446655440003",
        cantidad: 1,
        precio_total: 15.5,
        estado: "reservada",
        codigo_retiro: "DEF456",
        fecha_reserva: "2025-01-15T10:00:00Z",
        fecha_pago: null,
        fecha_retiro: null,
        fecha_expiracion: "2025-01-15T10:30:00Z",
      };

      mockHandle.mockImplementation((req, res) => {
        return res.status(200).json(mockVenta);
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.estado).toBe("reservada");
      expect(data.fecha_pago).toBeNull();
      expect(data.fecha_retiro).toBeNull();
    });

    it("debe retornar 400 si el ID no está presente", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {},
      });

      await handler(req, res);

      expect(mockHandle).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("ID de venta es requerido");
    });

    it("debe retornar 400 si el ID no es string", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: ["array", "of", "ids"] },
      });

      await handler(req, res);

      expect(mockHandle).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("ID de venta es requerido");
    });

    it("debe retornar 400 si el ID no es un UUID válido", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: invalidUuid },
      });

      await handler(req, res);

      expect(mockHandle).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("ID de venta inválido");
    });

    it("debe validar formato UUID con regex estricto", async () => {
      const almostValidUuid = "550e8400-e29b-41d4-a716-44665544000"; // Falta un carácter

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: almostValidUuid },
      });

      await handler(req, res);

      expect(mockHandle).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("ID de venta inválido");
    });

    it("debe inyectar el ID en req.query antes de delegar", async () => {
      mockHandle.mockImplementation((req, res) => {
        return res.status(200).json({ id: req.query.id });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(mockHandle).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ id: validUuid }),
        }),
        res
      );
    });

    it("debe retornar 404 si la venta no existe", async () => {
      mockHandle.mockImplementation((req, res) => {
        return res.status(404).json({ error: "Venta no encontrada" });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("Venta no encontrada");
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
          query: { id: validUuid },
        });

        await handler(req, res);

        expect(mockHandle).not.toHaveBeenCalled();
        expect(res._getStatusCode()).toBe(405);
        const data = JSON.parse(res._getData());
        expect(data.error).toContain("Método no permitido");
      });
    });
  });

  describe("Manejo de errores", () => {
    it("debe retornar 500 si el controller lanza error", async () => {
      mockHandle.mockImplementation(() => {
        throw new Error("Database query failed");
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("Error al obtener la venta");
    });

    it("debe loguear el error con console.error", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockHandle.mockImplementation(() => {
        throw new Error("Test error");
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error obteniendo venta:",
        "Test error"
      );

      consoleErrorSpy.mockRestore();
    });

    it("debe manejar errores no estándar", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockHandle.mockImplementation(() => {
        throw { custom: "error object" };
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error obteniendo venta:",
        "Error desconocido"
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Integración", () => {
    it("debe instanciar el controller correctamente", async () => {
      mockHandle.mockImplementation((req, res) => {
        return res.status(200).json({ id: validUuid });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(VentaAppController).toHaveBeenCalledTimes(1);
      expect(mockHandle).toHaveBeenCalledWith(
        expect.objectContaining({ query: { id: validUuid } }),
        res
      );
    });
  });
});
