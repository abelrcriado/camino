/**
 * Tests para venta_app.controller.ts
 * Valida HTTP handling con service mock
 */

import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { VentaAppController } from "@/api/controllers/venta_app.controller";
import { VentaAppService } from "@/api/services/venta_app.service";
import type { NextApiRequest, NextApiResponse } from "next";

describe("VentaAppController", () => {
  let controller: VentaAppController;
  let mockService: jest.Mocked<VentaAppService>;
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockService = {
      createVenta: jest.fn(),
      reservarStock: jest.fn(),
      confirmarPago: jest.fn(),
      confirmarRetiro: jest.fn(),
      cancelarVenta: jest.fn(),
      crearYPagarVenta: jest.fn(),
      getVentas: jest.fn(),
      getVentasFull: jest.fn(),
      getVentasActivas: jest.fn(),
      getVentasPorExpirar: jest.fn(),
      getEstadisticas: jest.fn(),
      liberarStockExpirado: jest.fn(),
      getNotificacionesVentasPorExpirar: jest.fn(),
      findByCodigoRetiro: jest.fn(),
      updateVenta: jest.fn(),
      deleteVenta: jest.fn(),
      findById: jest.fn(),
      getIngresosByEstado: jest.fn(),
    } as unknown as jest.Mocked<VentaAppService>;

    controller = new VentaAppController(mockService);

    mockReq = {
      method: "GET",
      query: {},
      body: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    };
  });

  // ============================================
  // Method Routing
  // ============================================
  describe("handle - Method Routing", () => {
    it("should route GET requests", async () => {
      mockService.getVentasFull.mockResolvedValue({
        data: [],
        count: 0,
      });

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.getVentasFull).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("should route POST requests", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        slot_id: "550e8400-e29b-41d4-a716-446655440001",
        producto_id: "550e8400-e29b-41d4-a716-446655440002",
        cantidad: 2,
      };

      const mockVenta = {
        id: "550e8400-e29b-41d4-a716-446655440003",
        slot_id: mockReq.body.slot_id,
        producto_id: mockReq.body.producto_id,
        cantidad: mockReq.body.cantidad,
        precio_unitario: 1000,
        precio_total: 2000,
        estado: "borrador",
        producto_nombre: "Product",
        producto_sku: "SKU",
        fecha_creacion: "2025-10-11T10:00:00Z",
        created_at: "2025-10-11T10:00:00Z",
      };

      mockService.createVenta.mockResolvedValue(mockVenta);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.createVenta).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it("should return 405 for unsupported methods", async () => {
      mockReq.method = "PATCH";

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.setHeader).toHaveBeenCalledWith("Allow", [
        "GET",
        "POST",
        "PUT",
        "DELETE",
      ]);
      expect(mockRes.status).toHaveBeenCalledWith(405);
    });
  });

  // ============================================
  // GET - Actions
  // ============================================
  describe("GET - Actions", () => {
    beforeEach(() => {
      mockReq.method = "GET";
    });

    it("should handle GET /api/ventas-app?action=activas", async () => {
      mockReq.query = {
        action: "activas",
        user_id: "550e8400-e29b-41d4-a716-446655440001",
      };

      const mockData = [
        {
          venta_id: "550e8400-e29b-41d4-a716-446655440010",
          slot_id: "550e8400-e29b-41d4-a716-446655440011",
          producto_nombre: "Product 1",
          cantidad: 1,
          precio_total: 1000,
          estado: "pagado" as const,
          codigo_retiro: "ABC123",
          fecha_expiracion: "2025-10-11T11:00:00Z",
          tiempo_restante_minutos: 45,
        },
      ];

      mockService.getVentasActivas.mockResolvedValue(mockData);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.getVentasActivas).toHaveBeenCalledWith(
        mockReq.query.user_id
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ data: mockData });
    });

    it("should handle GET /api/ventas-app?action=por-expirar", async () => {
      mockReq.query = {
        action: "por-expirar",
        minutos: "10",
      };

      const mockData = [
        {
          venta_id: "550e8400-e29b-41d4-a716-446655440010",
          user_id: "550e8400-e29b-41d4-a716-446655440011",
          codigo_retiro: "ABC123",
          fecha_expiracion: "2025-10-11T10:15:00Z",
          minutos_restantes: 5,
          machine_name: "Machine 1",
        },
      ];

      mockService.getVentasPorExpirar.mockResolvedValue(mockData);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.getVentasPorExpirar).toHaveBeenCalledWith(10);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("should handle GET /api/ventas-app?action=estadisticas", async () => {
      mockReq.query = { action: "estadisticas" };

      const mockStats = {
        ventas_borrador: 5,
        ventas_reservadas: 3,
        ventas_pagadas: 10,
        ventas_completadas: 50,
        ventas_canceladas: 8,
        ventas_expiradas: 2,
        total_ventas: 78,
        ingresos_completadas: 50000,
        ingresos_canceladas: 8000,
        ingresos_expiradas: 2000,
        tasa_conversion: 64.1,
        expiraciones_ultimas_24h: 2,
      };

      mockService.getEstadisticas.mockResolvedValue(mockStats);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.getEstadisticas).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ data: mockStats });
    });

    it("should handle GET /api/ventas-app (default query)", async () => {
      mockReq.query = {
        estado: "pagado",
        page: "1",
        limit: "20",
      };

      const mockData = {
        data: [],
        count: 0,
      };

      mockService.getVentasFull.mockResolvedValue(mockData);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.getVentasFull).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  // ============================================
  // POST - Actions
  // ============================================
  describe("POST - Actions", () => {
    beforeEach(() => {
      mockReq.method = "POST";
    });

    it("should handle POST /api/ventas-app?action=reservar-stock", async () => {
      mockReq.query = { action: "reservar-stock" };
      mockReq.body = {
        venta_id: "550e8400-e29b-41d4-a716-446655440001",
      };

      const mockResponse = {
        venta_id: mockReq.body.venta_id,
        estado: "reservado" as const,
        fecha_reserva: "2025-10-11T10:05:00Z",
      };

      mockService.reservarStock.mockResolvedValue(mockResponse);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.reservarStock).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith([mockResponse]);
    });

    it("should handle POST /api/ventas-app?action=confirmar-pago", async () => {
      mockReq.query = { action: "confirmar-pago" };
      mockReq.body = {
        venta_id: "550e8400-e29b-41d4-a716-446655440001",
        payment_id: "550e8400-e29b-41d4-a716-446655440002",
        tiempo_expiracion_minutos: 60,
      };

      const mockResponse = {
        venta_id: mockReq.body.venta_id,
        estado: "pagado" as const,
        codigo_retiro: "ABC123",
        fecha_expiracion: "2025-10-11T11:00:00Z",
      };

      mockService.confirmarPago.mockResolvedValue(mockResponse);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.confirmarPago).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith([mockResponse]);
    });

    it("should handle POST /api/ventas-app?action=confirmar-retiro", async () => {
      mockReq.query = { action: "confirmar-retiro" };
      mockReq.body = {
        venta_id: "550e8400-e29b-41d4-a716-446655440001",
        codigo_retiro: "ABC123",
      };

      const mockResponse = {
        venta_id: mockReq.body.venta_id,
        estado: "completado" as const,
        fecha_retiro: "2025-10-11T11:00:00Z",
      };

      mockService.confirmarRetiro.mockResolvedValue(mockResponse);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.confirmarRetiro).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("should handle POST /api/ventas-app?action=cancelar", async () => {
      mockReq.query = { action: "cancelar" };
      mockReq.body = {
        venta_id: "550e8400-e29b-41d4-a716-446655440001",
        motivo: "User requested cancellation",
      };

      const mockResponse = {
        venta_id: mockReq.body.venta_id,
        estado: "cancelado" as const,
        stock_liberado: true,
        fecha_cancelacion: "2025-10-11T11:00:00Z",
      };

      mockService.cancelarVenta.mockResolvedValue(mockResponse);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.cancelarVenta).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("should handle POST /api/ventas-app?action=crear-y-pagar", async () => {
      mockReq.query = { action: "crear-y-pagar" };
      mockReq.body = {
        slot_id: "550e8400-e29b-41d4-a716-446655440001",
        producto_id: "550e8400-e29b-41d4-a716-446655440002",
        cantidad: 2,
        payment_id: "550e8400-e29b-41d4-a716-446655440003",
        tiempo_expiracion_minutos: 60,
      };

      const mockResponse = {
        venta_id: "550e8400-e29b-41d4-a716-446655440010",
        estado: "pagado" as const,
        codigo_retiro: "ABC123",
        fecha_expiracion: "2025-10-11T11:05:00Z",
      };

      mockService.crearYPagarVenta.mockResolvedValue(mockResponse);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.crearYPagarVenta).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it("should handle POST /api/ventas-app (default create)", async () => {
      mockReq.body = {
        slot_id: "550e8400-e29b-41d4-a716-446655440001",
        producto_id: "550e8400-e29b-41d4-a716-446655440002",
        cantidad: 2,
      };

      const mockVenta = {
        id: "550e8400-e29b-41d4-a716-446655440003",
        slot_id: mockReq.body.slot_id,
        producto_id: mockReq.body.producto_id,
        cantidad: mockReq.body.cantidad,
        precio_unitario: 1000,
        precio_total: 2000,
        estado: "borrador",
        producto_nombre: "Product",
        producto_sku: "SKU",
        fecha_creacion: "2025-10-11T10:00:00Z",
        created_at: "2025-10-11T10:00:00Z",
      };

      mockService.createVenta.mockResolvedValue(mockVenta);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.createVenta).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith([mockVenta]);
    });
  });

  // ============================================
  // PUT - Update
  // ============================================
  describe("PUT", () => {
    beforeEach(() => {
      mockReq.method = "PUT";
    });

    it("should update venta successfully", async () => {
      mockReq.body = {
        id: "550e8400-e29b-41d4-a716-446655440001",
        notas: "Updated notes",
      };

      const mockVenta = {
        id: mockReq.body.id,
        slot_id: "550e8400-e29b-41d4-a716-446655440010",
        producto_id: "550e8400-e29b-41d4-a716-446655440012",
        cantidad: 1,
        precio_unitario: 1000,
        precio_total: 1000,
        estado: "borrador",
        producto_nombre: "Product",
        producto_sku: "SKU",
        notas: "Updated notes",
        fecha_creacion: "2025-10-11T10:00:00Z",
        created_at: "2025-10-11T10:00:00Z",
        updated_at: "2025-10-11T10:30:00Z",
      };

      mockService.updateVenta.mockResolvedValue(mockVenta);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.updateVenta).toHaveBeenCalledWith(
        mockReq.body.id,
        mockReq.body
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith([mockVenta]);
    });
  });

  // ============================================
  // DELETE
  // ============================================
  describe("DELETE", () => {
    beforeEach(() => {
      mockReq.method = "DELETE";
    });

    it("should delete venta successfully", async () => {
      mockReq.body = {
        id: "550e8400-e29b-41d4-a716-446655440001",
      };

      mockService.deleteVenta.mockResolvedValue(true);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.deleteVenta).toHaveBeenCalledWith(mockReq.body.id);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Venta eliminada exitosamente",
      });
    });
  });

  // ============================================
  // Error Handling
  // ============================================
  describe("Error Handling", () => {
    it("should handle validation errors", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        slot_id: "invalid-uuid",
        producto_id: "550e8400-e29b-41d4-a716-446655440002",
        cantidad: 0, // Invalid
      };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("should handle service errors", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        slot_id: "550e8400-e29b-41d4-a716-446655440001",
        producto_id: "550e8400-e29b-41d4-a716-446655440002",
        cantidad: 2,
      };

      mockService.createVenta.mockRejectedValue(
        new Error("Database connection failed")
      );

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
