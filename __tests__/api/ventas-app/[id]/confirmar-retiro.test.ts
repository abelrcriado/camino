/**
 * Tests para /api/ventas-app/[id]/confirmar-retiro.ts
 * Endpoint para confirmar retiro de producto comprado
 */

import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../../pages/api/ventas-app/[id]/confirmar-retiro";
import { VentaAppService } from "@/api/services/venta_app.service";

// Mock del servicio
jest.mock("@/api/services/venta_app.service");

describe("/api/ventas-app/[id]/confirmar-retiro", () => {
  let mockConfirmarRetiro: jest.Mock;
  const validUuid = "550e8400-e29b-41d4-a716-446655440001";
  const invalidUuid = "invalid-uuid-format";

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock del servicio
    mockConfirmarRetiro = jest.fn();
    (
      VentaAppService as jest.MockedClass<typeof VentaAppService>
    ).mockImplementation(() => {
      return {
        confirmarRetiro: mockConfirmarRetiro,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
    });
  });

  describe("POST /api/ventas-app/[id]/confirmar-retiro", () => {
    it("debe confirmar retiro exitosamente con código válido", async () => {
      const mockResult = {
        venta_id: validUuid,
        estado: "retirada",
        fecha_retiro: "2025-01-15T14:30:00Z",
      };

      mockConfirmarRetiro.mockResolvedValue(mockResult);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validUuid },
        body: { codigo_retiro: "ABC123" },
      });

      await handler(req, res);

      expect(mockConfirmarRetiro).toHaveBeenCalledWith({
        venta_id: validUuid,
        codigo_retiro: "ABC123",
      });
      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.message).toContain("Retiro confirmado exitosamente");
      expect(data.venta.id).toBe(validUuid);
      expect(data.venta.estado).toBe("retirada");
      expect(data.venta.fecha_retiro).toBeDefined();
    });

    it("debe convertir código_retiro a mayúsculas", async () => {
      const mockResult = {
        venta_id: validUuid,
        estado: "retirada",
        fecha_retiro: "2025-01-15T14:30:00Z",
      };

      mockConfirmarRetiro.mockResolvedValue(mockResult);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validUuid },
        body: { codigo_retiro: "abc123" },
      });

      await handler(req, res);

      expect(mockConfirmarRetiro).toHaveBeenCalledWith({
        venta_id: validUuid,
        codigo_retiro: "ABC123",
      });
      expect(res._getStatusCode()).toBe(200);
    });

    it("debe hacer trim al código_retiro", async () => {
      const mockResult = {
        venta_id: validUuid,
        estado: "retirada",
        fecha_retiro: "2025-01-15T14:30:00Z",
      };

      mockConfirmarRetiro.mockResolvedValue(mockResult);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validUuid },
        body: { codigo_retiro: "  XYZ789  " },
      });

      await handler(req, res);

      expect(mockConfirmarRetiro).toHaveBeenCalledWith({
        venta_id: validUuid,
        codigo_retiro: "XYZ789",
      });
      expect(res._getStatusCode()).toBe(200);
    });

    it("debe aceptar códigos alfanuméricos válidos", async () => {
      const mockResult = {
        venta_id: validUuid,
        estado: "retirada",
        fecha_retiro: "2025-01-15T14:30:00Z",
      };

      mockConfirmarRetiro.mockResolvedValue(mockResult);

      const codigosValidos = ["ABC123", "123456", "A1B2C3", "ABCDEF", "000000"];

      for (const codigo of codigosValidos) {
        mockConfirmarRetiro.mockClear();

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: "POST",
          query: { id: validUuid },
          body: { codigo_retiro: codigo },
        });

        await handler(req, res);

        expect(mockConfirmarRetiro).toHaveBeenCalledWith({
          venta_id: validUuid,
          codigo_retiro: codigo.toUpperCase(),
        });
        expect(res._getStatusCode()).toBe(200);
      }
    });

    it("debe retornar 400 si el ID no está presente", async () => {
      const { req, res} = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: {},
        body: { codigo_retiro: "ABC123" },
      });

      await handler(req, res);

      expect(mockConfirmarRetiro).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("ID de venta es requerido");
    });

    it("debe retornar 400 si el ID no es string", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: ["array", "of", "ids"] },
        body: { codigo_retiro: "ABC123" },
      });

      await handler(req, res);

      expect(mockConfirmarRetiro).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("ID debe ser un string");
    });

    it("debe retornar 400 si el ID no es UUID válido", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: invalidUuid },
        body: { codigo_retiro: "ABC123" },
      });

      await handler(req, res);

      expect(mockConfirmarRetiro).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("venta debe ser un UUID válido");
    });

    it("debe retornar 400 si codigo_retiro no está presente", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validUuid },
        body: {},
      });

      await handler(req, res);

      expect(mockConfirmarRetiro).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("Código de retiro es requerido");
    });

    it("debe retornar 400 si codigo_retiro no es string", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validUuid },
        body: { codigo_retiro: 123456 },
      });

      await handler(req, res);

      expect(mockConfirmarRetiro).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("Código de retiro es requerido");
    });

    it("debe retornar 400 si codigo_retiro es null", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validUuid },
        body: { codigo_retiro: null },
      });

      await handler(req, res);

      expect(mockConfirmarRetiro).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("Código de retiro es requerido");
    });

    it("debe retornar 400 si codigo_retiro tiene menos de 6 caracteres", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validUuid },
        body: { codigo_retiro: "AB12" },
      });

      await handler(req, res);

      expect(mockConfirmarRetiro).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("6 caracteres alfanuméricos");
    });

    it("debe retornar 400 si codigo_retiro tiene más de 6 caracteres", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validUuid },
        body: { codigo_retiro: "ABC12345" },
      });

      await handler(req, res);

      expect(mockConfirmarRetiro).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("6 caracteres alfanuméricos");
    });

    it("debe retornar 400 si codigo_retiro contiene caracteres especiales", async () => {
      const codigosInvalidos = ["ABC-12", "AB@123", "AB C12", "ABC.12"];

      for (const codigo of codigosInvalidos) {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: "POST",
          query: { id: validUuid },
          body: { codigo_retiro: codigo },
        });

        await handler(req, res);

        expect(mockConfirmarRetiro).not.toHaveBeenCalled();
        expect(res._getStatusCode()).toBe(400);
        const data = JSON.parse(res._getData());
        expect(data.error).toContain("6 caracteres alfanuméricos");
      }
    });

    it("debe retornar 400 si codigo_retiro es solo espacios", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validUuid },
        body: { codigo_retiro: "      " },
      });

      await handler(req, res);

      expect(mockConfirmarRetiro).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("6 caracteres alfanuméricos");
    });

    it("debe retornar 500 si la venta no existe (asyncHandler convierte a 500)", async () => {
      mockConfirmarRetiro.mockRejectedValue(
        new Error("Venta no encontrado para confirmar retiro")
      );

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validUuid },
        body: { codigo_retiro: "ABC123" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.code).toBe("INTERNAL_SERVER_ERROR");
      expect(data.error).toBeDefined();
    });

    it("debe retornar 500 si el código de retiro es incorrecto (asyncHandler convierte a 500)", async () => {
      mockConfirmarRetiro.mockRejectedValue(
        new Error("El código de retiro no coincide")
      );

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validUuid },
        body: { codigo_retiro: "WRONG1" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.code).toBe("INTERNAL_SERVER_ERROR");
      expect(data.error).toBeDefined();
    });

    it("debe retornar 500 si la venta no está en estado válido (asyncHandler convierte a 500)", async () => {
      mockConfirmarRetiro.mockRejectedValue(
        new Error("La venta no está en estado válido para retiro")
      );

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validUuid },
        body: { codigo_retiro: "ABC123" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.code).toBe("INTERNAL_SERVER_ERROR");
      expect(data.error).toBeDefined();
    });

    it("debe retornar 500 si la venta ya fue retirada (asyncHandler convierte a 500)", async () => {
      mockConfirmarRetiro.mockRejectedValue(
        new Error("La venta ya fue retirada anteriormente")
      );

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validUuid },
        body: { codigo_retiro: "ABC123" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.code).toBe("INTERNAL_SERVER_ERROR");
      expect(data.error).toBeDefined();
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
          query: { id: validUuid },
          body: { codigo_retiro: "ABC123" },
        });

        await handler(req, res);

        expect(mockConfirmarRetiro).not.toHaveBeenCalled();
        expect(res._getStatusCode()).toBe(405);
        const data = JSON.parse(res._getData());
        expect(data.error).toContain("Método no permitido");
      });
    });
  });

  describe("Manejo de errores", () => {
    it("debe retornar 500 para errores internos del servicio (asyncHandler)", async () => {
      mockConfirmarRetiro.mockRejectedValue(
        new Error("Database connection failed")
      );

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validUuid },
        body: { codigo_retiro: "ABC123" },
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
      const mockResult = {
        venta_id: validUuid,
        estado: "retirada",
        fecha_retiro: "2025-01-15T14:30:00Z",
      };

      mockConfirmarRetiro.mockResolvedValue(mockResult);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validUuid },
        body: { codigo_retiro: "ABC123" },
      });

      await handler(req, res);

      expect(VentaAppService).toHaveBeenCalledTimes(1);
      expect(mockConfirmarRetiro).toHaveBeenCalledWith({
        venta_id: validUuid,
        codigo_retiro: "ABC123",
      });
    });
  });
});
