/**
 * Tests para venta_app.service.ts
 * Valida business logic con repository mock
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { VentaAppService } from "@/api/services/venta_app.service";
import { VentaAppRepository } from "@/api/repositories/venta_app.repository";
import type {
  CreateVentaAppDto,
  UpdateVentaAppDto,
  VentaApp,
  ReservarStockDto,
  ConfirmarPagoDto,
  ConfirmarRetiroDto,
  CancelarVentaDto,
  CrearYPagarVentaDto,
} from "@/shared/dto/venta_app.dto";
import { ValidationError, NotFoundError, BusinessRuleError } from "@/api/errors/custom-errors";
import { VentaAppFactory } from "../helpers/factories";

describe("VentaAppService", () => {
  let service: VentaAppService;
  let mockRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepository = {
      findById: jest.fn() as jest.Mock,
      create: jest.fn() as jest.Mock,
      update: jest.fn() as jest.Mock,
      delete: jest.fn() as jest.Mock,
      findAll: jest.fn() as jest.Mock,
      crearVenta: jest.fn() as jest.Mock,
      reservarStock: jest.fn() as jest.Mock,
      confirmarPago: jest.fn() as jest.Mock,
      confirmarRetiro: jest.fn() as jest.Mock,
      cancelarVenta: jest.fn() as jest.Mock,
      liberarStockExpirado: jest.fn() as jest.Mock,
      getVentasActivasUsuario: jest.fn() as jest.Mock,
      findByCodigoRetiro: jest.fn() as jest.Mock,
      getVentasPorExpirar: jest.fn() as jest.Mock,
      getEstadisticas: jest.fn() as jest.Mock,
      findFullVentas: jest.fn() as jest.Mock,
      countByEstado: jest.fn() as jest.Mock,
      countByUser: jest.fn() as jest.Mock,
      exists: jest.fn() as jest.Mock,
      getIngresosByEstado: jest.fn() as jest.Mock,
    };

    service = new VentaAppService(mockRepository as VentaAppRepository);
  });

  // ============================================
  // createVenta
  // ============================================
  describe("createVenta", () => {
    const mockDto: CreateVentaAppDto = {
      slot_id: "550e8400-e29b-41d4-a716-446655440001",
      producto_id: "550e8400-e29b-41d4-a716-446655440002",
      cantidad: 2,
    };

    it("should create venta successfully", async () => {
      const mockVenta = VentaAppFactory.create({
        slot_id: mockDto.slot_id,
        producto_id: mockDto.producto_id,
        cantidad: 2,
        precio_total: 2000,
      });

      mockRepository.crearVenta.mockResolvedValue(mockVenta);

      const result = await service.createVenta(mockDto);

      expect(result).toEqual(mockVenta);
      expect(mockRepository.crearVenta).toHaveBeenCalledWith(mockDto);
    });

    it("should throw error when cantidad is invalid", async () => {
      const invalidDto = { ...mockDto, cantidad: 0 };

      mockRepository.crearVenta.mockRejectedValue(
        new ValidationError("La cantidad debe ser mayor a 0")
      );

      await expect(service.createVenta(invalidDto)).rejects.toThrow(
        ValidationError
      );
    });

    it("should wrap repository errors in DatabaseError", async () => {
      mockRepository.crearVenta.mockRejectedValue(
        new Error("Stock not available")
      );

      await expect(service.createVenta(mockDto)).rejects.toThrow(
        "Error al crear venta"
      );
    });
  });

  // ============================================
  // reservarStock
  // ============================================
  describe("reservarStock", () => {
    const mockDto: ReservarStockDto = {
      venta_id: "550e8400-e29b-41d4-a716-446655440001",
    };

    it("should reserve stock successfully", async () => {
      const mockVenta = VentaAppFactory.create({ estado: "borrador" });
      const mockResponse = {
        venta_id: mockDto.venta_id,
        estado: "reservado" as const,
        fecha_reserva: "2025-10-11T10:05:00Z",
      };

      mockRepository.findById.mockResolvedValue({
        data: mockVenta,
        error: null,
      });
      mockRepository.reservarStock.mockResolvedValue(mockResponse);

      const result = await service.reservarStock(mockDto);

      expect(result).toEqual(mockResponse);
      expect(mockRepository.reservarStock).toHaveBeenCalledWith(
        mockDto.venta_id
      );
    });

    it("should throw error when venta not in borrador state", async () => {
      const mockVenta = VentaAppFactory.create({ estado: "pagado" });

      mockRepository.findById.mockResolvedValue({
        data: mockVenta,
        error: null,
      });

      await expect(service.reservarStock(mockDto)).rejects.toThrow(
        BusinessRuleError
      );
    });
  });

  // ============================================
  // confirmarPago
  // ============================================
  describe("confirmarPago", () => {
    const mockDto: ConfirmarPagoDto = {
      venta_id: "550e8400-e29b-41d4-a716-446655440001",
      payment_id: "550e8400-e29b-41d4-a716-446655440002",
      tiempo_expiracion_minutos: 60,
    };

    it("should confirm payment successfully", async () => {
      const mockVenta = VentaAppFactory.create({ estado: "reservado" });
      const mockResponse = {
        venta_id: mockDto.venta_id,
        estado: "pagado" as const,
        codigo_retiro: "ABC123",
        fecha_expiracion: "2025-10-11T11:00:00Z",
      };

      mockRepository.findById.mockResolvedValue({
        data: mockVenta,
        error: null,
      });
      mockRepository.confirmarPago.mockResolvedValue(mockResponse);

      const result = await service.confirmarPago(mockDto);

      expect(result).toEqual(mockResponse);
      expect(mockRepository.confirmarPago).toHaveBeenCalledWith(
        mockDto.venta_id,
        mockDto.payment_id,
        mockDto.tiempo_expiracion_minutos
      );
    });

    it("should validate estado transition (reservado -> pagado)", async () => {
      const mockVenta = VentaAppFactory.create({ estado: "borrador" });

      mockRepository.findById.mockResolvedValue({
        data: mockVenta,
        error: null,
      });

      await expect(service.confirmarPago(mockDto)).rejects.toThrow(
        BusinessRuleError
      );
    });

    it("should validate tiempo_expiracion range", async () => {
      const invalidDto = {
        venta_id: mockDto.venta_id,
        payment_id: mockDto.payment_id,
        tiempo_expiracion_minutos: 2000, // Mayor a 1440
      };
      const mockVenta = VentaAppFactory.create({ estado: "reservado" });

      mockRepository.findById.mockResolvedValue({
        data: mockVenta,
        error: null,
      });

      await expect(service.confirmarPago(invalidDto)).rejects.toThrow(
        ValidationError
      );
    });
  });

  // ============================================
  // confirmarRetiro
  // ============================================
  describe("confirmarRetiro", () => {
    const mockDto: ConfirmarRetiroDto = {
      venta_id: "550e8400-e29b-41d4-a716-446655440001",
      codigo_retiro: "ABC123",
    };

    it("should confirm pickup successfully", async () => {
      const mockVenta = VentaAppFactory.create({
        estado: "pagado",
        codigo_retiro: "ABC123",
      });
      const mockResponse = {
        venta_id: mockDto.venta_id,
        estado: "completado" as const,
        fecha_retiro: "2025-10-11T11:00:00Z",
      };

      mockRepository.findById.mockResolvedValue({
        data: mockVenta,
        error: null,
      });
      mockRepository.confirmarRetiro.mockResolvedValue(mockResponse);

      const result = await service.confirmarRetiro(mockDto);

      expect(result).toEqual(mockResponse);
      expect(mockRepository.confirmarRetiro).toHaveBeenCalledWith(
        mockDto.venta_id,
        mockDto.codigo_retiro
      );
    });

    it("should throw error when venta not in pagado state", async () => {
      const mockVenta = VentaAppFactory.create({ estado: "reservado" });

      mockRepository.findById.mockResolvedValue({
        data: mockVenta,
        error: null,
      });

      await expect(service.confirmarRetiro(mockDto)).rejects.toThrow(
        BusinessRuleError
      );
    });

    it("should validate codigo_retiro format", async () => {
      const invalidDto = { ...mockDto, codigo_retiro: "123" };
      const mockVenta = VentaAppFactory.create({
        estado: "pagado",
        codigo_retiro: "ABC123",
      });

      mockRepository.findById.mockResolvedValue({
        data: mockVenta,
        error: null,
      });
      mockRepository.confirmarRetiro.mockRejectedValue(
        new ValidationError("Código de retiro inválido")
      );

      await expect(service.confirmarRetiro(invalidDto)).rejects.toThrow();
    });
  });

  // ============================================
  // cancelarVenta
  // ============================================
  describe("cancelarVenta", () => {
    const mockDto: CancelarVentaDto = {
      venta_id: "550e8400-e29b-41d4-a716-446655440001",
      motivo: "User requested cancellation",
    };

    it("should cancel venta successfully", async () => {
      const mockVenta = VentaAppFactory.create({ estado: "reservado" });
      const mockResponse = {
        venta_id: mockDto.venta_id,
        estado: "cancelado" as const,
        stock_liberado: true,
        fecha_cancelacion: "2025-10-11T11:00:00Z",
      };

      mockRepository.findById.mockResolvedValue({
        data: mockVenta,
        error: null,
      });
      mockRepository.cancelarVenta.mockResolvedValue(mockResponse);

      const result = await service.cancelarVenta(mockDto);

      expect(result).toEqual(mockResponse);
      expect(mockRepository.cancelarVenta).toHaveBeenCalledWith(
        mockDto.venta_id,
        mockDto.motivo
      );
    });

    it("should throw error when trying to cancel completado venta", async () => {
      const mockVenta = VentaAppFactory.create({ estado: "completado" });

      mockRepository.findById.mockResolvedValue({
        data: mockVenta,
        error: null,
      });

      await expect(service.cancelarVenta(mockDto)).rejects.toThrow(
        ValidationError
      );
    });
  });

  // ============================================
  // crearYPagarVenta
  // ============================================
  describe("crearYPagarVenta", () => {
    const mockDto: CrearYPagarVentaDto = {
      slot_id: "550e8400-e29b-41d4-a716-446655440001",
      producto_id: "550e8400-e29b-41d4-a716-446655440002",
      cantidad: 2,
      payment_id: "550e8400-e29b-41d4-a716-446655440003",
      tiempo_expiracion_minutos: 60,
    };

    it("should create and pay venta in one step", async () => {
      const mockVentaCreated = VentaAppFactory.create({
        slot_id: mockDto.slot_id,
        producto_id: mockDto.producto_id,
        cantidad: 2,
      });

      const mockReservaResponse = {
        venta_id: mockVentaCreated.id,
        estado: "reservado" as const,
        fecha_reserva: "2025-10-11T10:05:00Z",
      };

      const mockPagoResponse = {
        venta_id: mockVentaCreated.id,
        estado: "pagado" as const,
        codigo_retiro: "ABC123",
        fecha_expiracion: "2025-10-11T11:05:00Z",
      };

      mockRepository.crearVenta.mockResolvedValue(mockVentaCreated);
      mockRepository.findById.mockResolvedValueOnce({
        data: { ...mockVentaCreated, estado: "borrador" },
        error: null,
      });
      mockRepository.reservarStock.mockResolvedValue(mockReservaResponse);
      mockRepository.findById.mockResolvedValueOnce({
        data: { ...mockVentaCreated, estado: "reservado" },
        error: null,
      });
      mockRepository.confirmarPago.mockResolvedValue(mockPagoResponse);

      const result = await service.crearYPagarVenta(mockDto);

      expect(result).toEqual(mockPagoResponse);
      expect(mockRepository.crearVenta).toHaveBeenCalled();
      expect(mockRepository.reservarStock).toHaveBeenCalledWith(
        mockVentaCreated.id
      );
      expect(mockRepository.confirmarPago).toHaveBeenCalledWith(
        mockVentaCreated.id,
        mockDto.payment_id,
        mockDto.tiempo_expiracion_minutos
      );
    });

    it("should rollback on payment failure", async () => {
      const mockVentaCreated = VentaAppFactory.create();

      mockRepository.crearVenta.mockResolvedValue(mockVentaCreated);
      mockRepository.findById.mockResolvedValueOnce({
        data: { ...mockVentaCreated, estado: "borrador" },
        error: null,
      });
      mockRepository.reservarStock.mockResolvedValue({
        venta_id: mockVentaCreated.id,
        estado: "reservado",
        fecha_reserva: "2025-10-11T10:05:00Z",
      });
      mockRepository.findById.mockResolvedValueOnce({
        data: { ...mockVentaCreated, estado: "reservado" },
        error: null,
      });
      mockRepository.confirmarPago.mockRejectedValue(
        new Error("Payment failed")
      );

      await expect(service.crearYPagarVenta(mockDto)).rejects.toThrow(
        "Error en crear y pagar venta"
      );
    });
  });

  // ============================================
  // getVentas (query with filters)
  // ============================================
  describe("getVentas", () => {
    it("should get ventas with filters", async () => {
      const filters = {
        estado: "pagado" as const,
        user_id: "550e8400-e29b-41d4-a716-446655440001",
      };

      const mockData = [VentaAppFactory.create({ estado: "pagado" })];

      mockRepository.findAll.mockResolvedValue({
        data: mockData,
        count: 1,
        error: null,
      });

      const result = await service.getVentas(filters);

      expect(result.data).toEqual(mockData);
      expect(result.count).toBe(1);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });
  });

  // ============================================
  // getVentasActivas
  // ============================================
  describe("getVentasActivas", () => {
    it("should get active ventas for user", async () => {
      const userId = "550e8400-e29b-41d4-a716-446655440001";
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

      mockRepository.getVentasActivasUsuario.mockResolvedValue(mockData);

      const result = await service.getVentasActivas(userId);

      expect(result).toEqual(mockData);
      expect(mockRepository.getVentasActivasUsuario).toHaveBeenCalledWith(
        userId
      );
    });
  });

  // ============================================
  // getVentasPorExpirar
  // ============================================
  describe("getVentasPorExpirar", () => {
    it("should get ventas about to expire", async () => {
      const now = new Date();
      const mockData = [
        {
          venta_id: "550e8400-e29b-41d4-a716-446655440010",
          user_id: "550e8400-e29b-41d4-a716-446655440011",
          codigo_retiro: "ABC123",
          fecha_expiracion: new Date(
            now.getTime() + 5 * 60 * 1000
          ).toISOString(), // 5 minutos en el futuro
          minutos_restantes: 5,
          machine_name: "Machine 1",
        },
      ];

      mockRepository.getVentasPorExpirar.mockResolvedValue(mockData);

      const result = await service.getVentasPorExpirar(10);

      expect(result).toEqual(mockData);
      expect(mockRepository.getVentasPorExpirar).toHaveBeenCalled();
    });
  });

  // ============================================
  // getEstadisticas
  // ============================================
  describe("getEstadisticas", () => {
    it("should get ventas statistics", async () => {
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

      mockRepository.getEstadisticas.mockResolvedValue(mockStats);

      const result = await service.getEstadisticas();

      expect(result).toEqual(mockStats);
      expect(mockRepository.getEstadisticas).toHaveBeenCalled();
    });
  });

  // ============================================
  // liberarStockExpirado
  // ============================================
  describe("liberarStockExpirado", () => {
    it("should liberate expired stock", async () => {
      const mockResponse = {
        ventas_expiradas: 5,
        stock_liberado: 8,
      };

      mockRepository.liberarStockExpirado.mockResolvedValue(mockResponse);

      const result = await service.liberarStockExpirado();

      expect(result).toEqual(mockResponse);
      expect(mockRepository.liberarStockExpirado).toHaveBeenCalled();
    });
  });

  // ============================================
  // findByCodigoRetiro
  // ============================================
  describe("findByCodigoRetiro", () => {
    it("should find venta by codigo_retiro", async () => {
      const codigo = "ABC123";
      const mockVenta = VentaAppFactory.create({
        estado: "pagado",
        codigo_retiro: codigo,
      });

      mockRepository.findByCodigoRetiro.mockResolvedValue({
        data: mockVenta,
        error: null,
      });

      const result = await service.findByCodigoRetiro(codigo);

      expect(result).toEqual(mockVenta);
      expect(mockRepository.findByCodigoRetiro).toHaveBeenCalledWith(codigo);
    });

    it("should return null when codigo not found", async () => {
      mockRepository.findByCodigoRetiro.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.findByCodigoRetiro("NOTFOUND");

      expect(result).toBeNull();
    });
  });

  // ============================================
  // updateVenta
  // ============================================
  describe("updateVenta", () => {
    const ventaId = "550e8400-e29b-41d4-a716-446655440001";
    const mockDto: UpdateVentaAppDto = {
      id: ventaId,
      notas: "Updated notes",
    };

    it("should update venta successfully", async () => {
      const mockVenta = VentaAppFactory.create({
        id: ventaId,
        notas: "Updated notes",
        updated_at: "2025-10-11T10:30:00Z",
      });

      // El servicio solo pasa { notas: "Updated notes" }, no el id
      const updateData = { notas: "Updated notes" };

      mockRepository.findById.mockResolvedValue({
        data: mockVenta,
        error: null,
      });
      mockRepository.update.mockResolvedValue({
        data: [mockVenta],
        error: null,
      });

      const result = await service.updateVenta(ventaId, mockDto);

      expect(result).toEqual(mockVenta);
      expect(mockRepository.update).toHaveBeenCalledWith(ventaId, updateData);
    });

    it("should throw error when venta not found", async () => {
      mockRepository.findById.mockResolvedValue({ data: null, error: null });

      await expect(service.updateVenta(ventaId, mockDto)).rejects.toThrow(
        NotFoundError
      );
    });

    it("should throw error when trying to update immutable fields in non-borrador", async () => {
      const mockVenta = VentaAppFactory.create({
        id: ventaId,
        estado: "reservado",
      });

      const invalidUpdate = {
        id: ventaId,
        cantidad: 5,
      };

      mockRepository.findById.mockResolvedValue({
        data: mockVenta,
        error: null,
      });

      await expect(service.updateVenta(ventaId, invalidUpdate)).rejects.toThrow(
        ValidationError
      );
    });
  });

  // ============================================
  // deleteVenta
  // ============================================
  describe("deleteVenta", () => {
    const ventaId = "550e8400-e29b-41d4-a716-446655440001";

    it("should delete venta in borrador state", async () => {
      const mockVenta = VentaAppFactory.create({ id: ventaId, estado: "borrador" });

      mockRepository.findById.mockResolvedValue({
        data: mockVenta,
        error: null,
      });
      mockRepository.delete.mockResolvedValue({ error: null });

      const result = await service.deleteVenta(ventaId);

      expect(result).toBe(true);
      expect(mockRepository.delete).toHaveBeenCalledWith(ventaId);
    });

    it("should throw error when trying to delete non-borrador venta", async () => {
      const mockVenta = VentaAppFactory.create({ id: ventaId, estado: "pagado" });

      mockRepository.findById.mockResolvedValue({
        data: mockVenta,
        error: null,
      });

      await expect(service.deleteVenta(ventaId)).rejects.toThrow(
        ValidationError
      );
    });
  });

  // ============================================
  // getIngresosByEstado
  // ============================================
  describe("getIngresosByEstado", () => {
    it("should calculate total ingresos by estado", async () => {
      mockRepository.getIngresosByEstado.mockResolvedValue(50000);

      const result = await service.getIngresosByEstado("completado");

      expect(result).toBe(50000);
      expect(mockRepository.getIngresosByEstado).toHaveBeenCalledWith(
        "completado"
      );
    });
  });
});
