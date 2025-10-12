/**
 * Tests para venta_app.repository.ts
 * Valida repository con RPC calls y queries
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { VentaAppRepository } from "@/repositories/venta_app.repository";
import { SupabaseClient } from "@supabase/supabase-js";
import type { CreateVentaAppDto } from "@/dto/venta_app.dto";

type MockedFunction = ReturnType<typeof jest.fn>;

// Mock Supabase client with dependency injection pattern
const mockSupabase = {
  rpc: jest.fn() as MockedFunction,
  from: jest.fn() as MockedFunction,
} as unknown as SupabaseClient;

describe("VentaAppRepository", () => {
  let repository: VentaAppRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new VentaAppRepository(mockSupabase);

    // Configure default chain behavior for from()
    // This will be overridden in specific tests as needed
    const mockChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null } as any),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
    };

    (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);
  });

  // ============================================
  // crearVenta - RPC call
  // ============================================
  describe("crearVenta", () => {
    const mockDto: CreateVentaAppDto = {
      slot_id: "550e8400-e29b-41d4-a716-446655440001",
      producto_id: "550e8400-e29b-41d4-a716-446655440002",
      cantidad: 2,
    };

    it("should create venta successfully via RPC", async () => {
      const mockVentaId = "550e8400-e29b-41d4-a716-446655440003";
      const mockVentaData = {
        id: mockVentaId,
        slot_id: mockDto.slot_id,
        producto_id: mockDto.producto_id,
        producto_nombre: "Test Product",
        producto_sku: "SKU123",
        cantidad: mockDto.cantidad,
        precio_unitario: 1000,
        precio_total: 2000,
        estado: "borrador",
        fecha_creacion: "2025-10-11T10:00:00Z",
      };

      // Mock RPC call response
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: [{ venta_id: mockVentaId }],
        error: null,
      });

      // Mock findById response
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockVentaData,
          error: null,
        }),
      };
      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.crearVenta(mockDto);

      expect(mockSupabase.rpc).toHaveBeenCalledWith("crear_venta_app", {
        p_slot_id: mockDto.slot_id,
        p_user_id: null,
        p_producto_id: mockDto.producto_id,
        p_cantidad: mockDto.cantidad,
        p_metadata: null,
      });
      expect(result).toEqual(mockVentaData);
    });

    it("should throw error when RPC fails", async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      await expect(repository.crearVenta(mockDto)).rejects.toThrow(
        "Error creating venta"
      );
    });

    it("should throw error when no data returned", async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      await expect(repository.crearVenta(mockDto)).rejects.toThrow(
        "No data returned from crear_venta_app"
      );
    });
  });

  // ============================================
  // reservarStock - RPC call
  // ============================================
  describe("reservarStock", () => {
    const ventaId = "550e8400-e29b-41d4-a716-446655440001";

    it("should reserve stock successfully", async () => {
      const mockResponse = {
        venta_id: ventaId,
        estado: "reservado",
        fecha_reserva: "2025-10-11T10:05:00Z",
      };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: [mockResponse],
        error: null,
      });

      const result = await repository.reservarStock(ventaId);

      expect(mockSupabase.rpc).toHaveBeenCalledWith("reservar_stock_venta", {
        p_venta_id: ventaId,
      });
      expect(result).toEqual(mockResponse);
    });

    it("should throw error when RPC fails", async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: "Stock not available" },
      });

      await expect(repository.reservarStock(ventaId)).rejects.toThrow(
        "Error reserving stock"
      );
    });
  });

  // ============================================
  // confirmarPago - RPC call
  // ============================================
  describe("confirmarPago", () => {
    const ventaId = "550e8400-e29b-41d4-a716-446655440001";
    const paymentId = "550e8400-e29b-41d4-a716-446655440002";

    it("should confirm payment successfully", async () => {
      const mockResponse = {
        venta_id: ventaId,
        estado: "pagado",
        codigo_retiro: "ABC123",
        fecha_pago: "2025-10-11T10:10:00Z",
        fecha_expiracion: "2025-10-11T11:10:00Z",
      };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: [mockResponse],
        error: null,
      });

      const result = await repository.confirmarPago(ventaId, paymentId, 60);

      expect(mockSupabase.rpc).toHaveBeenCalledWith("confirmar_pago_venta", {
        p_venta_id: ventaId,
        p_payment_id: paymentId,
        p_tiempo_expiracion_minutos: 60,
      });

      // Repository returns extracted fields from data[0], not fecha_pago
      expect(result).toEqual({
        venta_id: ventaId,
        estado: "pagado",
        codigo_retiro: "ABC123",
        fecha_expiracion: "2025-10-11T11:10:00Z",
      });
      expect(result.codigo_retiro).toBe("ABC123");
    });

    it("should use default tiempo_expiracion_minutos when not provided", async () => {
      const mockResponse = {
        venta_id: ventaId,
        estado: "pagado",
        codigo_retiro: "XYZ789",
        fecha_pago: "2025-10-11T10:10:00Z",
        fecha_expiracion: "2025-10-11T11:10:00Z",
      };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: [mockResponse],
        error: null,
      });

      await repository.confirmarPago(ventaId, paymentId);

      expect(mockSupabase.rpc).toHaveBeenCalledWith("confirmar_pago_venta", {
        p_venta_id: ventaId,
        p_payment_id: paymentId,
        p_tiempo_expiracion_minutos: null,
      });
    });
  });

  // ============================================
  // confirmarRetiro - RPC call
  // ============================================
  describe("confirmarRetiro", () => {
    const ventaId = "550e8400-e29b-41d4-a716-446655440001";
    const codigoRetiro = "ABC123";

    it("should confirm pickup successfully", async () => {
      const mockResponse = {
        venta_id: ventaId,
        estado: "completado",
        fecha_retiro: "2025-10-11T10:30:00Z",
      };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: [mockResponse],
        error: null,
      });

      const result = await repository.confirmarRetiro(ventaId, codigoRetiro);

      expect(mockSupabase.rpc).toHaveBeenCalledWith("confirmar_retiro_venta", {
        p_venta_id: ventaId,
        p_codigo_retiro: codigoRetiro,
      });
      expect(result.estado).toBe("completado");
    });

    it("should throw error when codigo_retiro is invalid", async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: "Invalid pickup code" },
      });

      await expect(
        repository.confirmarRetiro(ventaId, "WRONG123")
      ).rejects.toThrow("Error confirming pickup");
    });
  });

  // ============================================
  // cancelarVenta - RPC call
  // ============================================
  describe("cancelarVenta", () => {
    const ventaId = "550e8400-e29b-41d4-a716-446655440001";
    const motivo = "Cliente solicitó cancelación";

    it("should cancel venta successfully", async () => {
      const mockResponse = {
        venta_id: ventaId,
        estado: "cancelado",
        stock_liberado: true,
        fecha_cancelacion: "2025-10-11T10:15:00Z",
      };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: [mockResponse],
        error: null,
      });

      const result = await repository.cancelarVenta(ventaId, motivo);

      expect(mockSupabase.rpc).toHaveBeenCalledWith("cancelar_venta", {
        p_venta_id: ventaId,
        p_motivo: motivo,
      });
      expect(result.estado).toBe("cancelado");
      expect(result.stock_liberado).toBe(true);
    });
  });

  // ============================================
  // liberarStockExpirado - RPC call (admin)
  // ============================================
  describe("liberarStockExpirado", () => {
    it("should liberate expired stock successfully", async () => {
      const mockResponse = {
        ventas_expiradas: 5,
        stock_liberado: 15,
      };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: [mockResponse],
        error: null,
      });

      const result = await repository.liberarStockExpirado();

      expect(mockSupabase.rpc).toHaveBeenCalledWith("liberar_stock_expirado");
      expect(result.ventas_expiradas).toBe(5);
      expect(result.stock_liberado).toBe(15);
    });
  });

  // ============================================
  // getVentasActivasUsuario - RPC call
  // ============================================
  describe("getVentasActivasUsuario", () => {
    const userId = "550e8400-e29b-41d4-a716-446655440001";

    it("should get active ventas for user", async () => {
      const mockData = [
        {
          venta_id: "550e8400-e29b-41d4-a716-446655440002",
          slot_id: "550e8400-e29b-41d4-a716-446655440010",
          producto_nombre: "Product 1",
          cantidad: 1,
          precio_total: 1000,
          estado: "pagado",
          codigo_retiro: "ABC123",
          fecha_expiracion: "2025-10-11T11:00:00Z",
          tiempo_restante_minutos: 45,
        },
        {
          venta_id: "550e8400-e29b-41d4-a716-446655440003",
          slot_id: "550e8400-e29b-41d4-a716-446655440011",
          producto_nombre: "Product 2",
          cantidad: 2,
          precio_total: 2000,
          estado: "reservado",
          codigo_retiro: null,
          fecha_expiracion: "2025-10-11T11:10:00Z",
          tiempo_restante_minutos: 55,
        },
      ];

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await repository.getVentasActivasUsuario(userId);

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        "get_ventas_activas_usuario",
        {
          p_user_id: userId,
        }
      );
      expect(result).toHaveLength(2);
      expect(result[0].tiempo_restante_minutos).toBe(45);
    });
  });

  // ============================================
  // findByCodigoRetiro - Query
  // ============================================
  describe("findByCodigoRetiro", () => {
    const codigo = "ABC123";

    it("should find venta by codigo_retiro", async () => {
      const mockVenta = {
        id: "550e8400-e29b-41d4-a716-446655440001",
        codigo_retiro: codigo,
        estado: "pagado",
        producto_nombre: "Test Product",
      };

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockVenta,
          error: null,
        }),
      };
      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.findByCodigoRetiro(codigo);

      expect(mockChain.eq).toHaveBeenCalledWith("codigo_retiro", codigo);
      expect(result.data).toEqual(mockVenta);
    });

    it("should return null when codigo not found", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: "PGRST116" },
        }),
      };
      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.findByCodigoRetiro("NOTFOUND");

      expect(result.data).toBeNull();
    });
  });

  // ============================================
  // getVentasPorExpirar - View query
  // ============================================
  describe("getVentasPorExpirar", () => {
    it("should get ventas about to expire", async () => {
      const mockData = [
        {
          venta_id: "550e8400-e29b-41d4-a716-446655440001",
          user_id: "550e8400-e29b-41d4-a716-446655440002",
          codigo_retiro: "ABC123",
          fecha_expiracion: "2025-10-11T10:15:00Z",
          minutos_restantes: 5,
          machine_name: "Machine 1",
        },
      ];

      const mockChain = {
        select: jest.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      };
      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.getVentasPorExpirar();

      expect(mockSupabase.from).toHaveBeenCalledWith("v_ventas_por_expirar");
      expect(result).toEqual(mockData);
    });
  });

  // ============================================
  // getEstadisticas - View query
  // ============================================
  describe("getEstadisticas", () => {
    it("should get ventas statistics", async () => {
      const mockStats = {
        ventas_borrador: 10,
        ventas_reservadas: 5,
        ventas_pagadas: 15,
        ventas_completadas: 50,
        ventas_canceladas: 8,
        ventas_expiradas: 3,
        total_ventas: 91,
        ingresos_completados: 150000,
        ingresos_pendientes: 25000,
        stock_actualmente_reservado: 20,
        tiempo_promedio_retiro_minutos: 45,
        expiraciones_ultimas_24h: 2,
      };

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockStats,
          error: null,
        }),
      };
      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.getEstadisticas();

      expect(mockSupabase.from).toHaveBeenCalledWith("v_estadisticas_ventas");
      expect(result).toEqual(mockStats);
    });
  });

  // ============================================
  // countByEstado - Query
  // ============================================
  describe("countByEstado", () => {
    it("should count ventas by estado", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          count: 25,
          error: null,
        }),
      };
      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.countByEstado("pagado");

      expect(mockChain.eq).toHaveBeenCalledWith("estado", "pagado");
      expect(result).toBe(25);
    });
  });

  // ============================================
  // countByUser - Query
  // ============================================
  describe("countByUser", () => {
    const userId = "550e8400-e29b-41d4-a716-446655440001";

    it("should count ventas by user", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          count: 10,
          error: null,
        }),
      };
      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.countByUser(userId);

      expect(mockChain.eq).toHaveBeenCalledWith("user_id", userId);
      expect(result).toBe(10);
    });
  }); // ============================================
  // exists - Query
  // ============================================
  describe("exists", () => {
    const ventaId = "550e8400-e29b-41d4-a716-446655440001";

    it("should return true when venta exists", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: ventaId },
          error: null,
        }),
      };
      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.exists(ventaId);

      expect(result).toBe(true);
    });

    it("should return false when venta does not exist", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };
      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.exists(ventaId);

      expect(result).toBe(false);
    });
  });

  // ============================================
  // getIngresosByEstado - Query
  // ============================================
  describe("getIngresosByEstado", () => {
    it("should calculate total ingresos by estado", async () => {
      const mockData = [
        { precio_total: 1000 },
        { precio_total: 2000 },
        { precio_total: 3500 },
      ];

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      };
      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.getIngresosByEstado("completado");

      expect(mockChain.eq).toHaveBeenCalledWith("estado", "completado");
      expect(result).toBe(6500);
    });

    it("should return 0 when no ventas found", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };
      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.getIngresosByEstado("borrador");

      expect(result).toBe(0);
    });
  });
});
