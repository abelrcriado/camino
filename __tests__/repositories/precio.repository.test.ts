import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { PrecioRepository } from "@/repositories/precio.repository";
import { SupabaseClient } from "@supabase/supabase-js";
import { NivelPrecio, EntidadTipo } from "@/dto/precio.dto";

/* eslint-disable @typescript-eslint/no-explicit-any */

describe("PrecioRepository", () => {
  let repository: PrecioRepository;
  let mockSupabase: any;

  const validUUID = "550e8400-e29b-41d4-a716-446655440000";
  const validUUID2 = "650e8400-e29b-41d4-a716-446655440001";

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn(),
      rpc: jest.fn(),
    } as any;

    repository = new PrecioRepository(mockSupabase as SupabaseClient);
  });

  // ===== RESOLVER PRECIO =====
  describe("resolverPrecio", () => {
    it("debería resolver precio BASE correctamente", async () => {
      const mockRpcResult = [
        {
          precio_id: validUUID,
          precio: 250,
          nivel: NivelPrecio.BASE,
          ubicacion_id: null,
          service_point_id: null,
          fecha_inicio: "2025-01-01",
          fecha_fin: null,
        },
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: mockRpcResult,
        error: null,
      });

      const result = await repository.resolverPrecio(
        EntidadTipo.PRODUCTO,
        validUUID2
      );

      expect(mockSupabase.rpc).toHaveBeenCalledWith("resolver_precio", {
        p_entidad_tipo: EntidadTipo.PRODUCTO,
        p_entidad_id: validUUID2,
        p_ubicacion_id: null,
        p_service_point_id: null,
        p_fecha: expect.any(String),
      });
      expect(result?.precio).toBe(250);
      expect(result?.precio_euros).toBe(2.5);
      expect(result?.nivel).toBe(NivelPrecio.BASE);
    });

    it("debería retornar null cuando no hay datos", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.resolverPrecio(
        EntidadTipo.PRODUCTO,
        validUUID2
      );

      expect(result).toBeNull();
    });

    it("debería lanzar error en fallo de RPC", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: "RPC error" },
      });

      await expect(
        repository.resolverPrecio(EntidadTipo.PRODUCTO, validUUID2)
      ).rejects.toThrow("Error al resolver precio");
    });
  });

  // ===== GET PRECIO APLICABLE =====
  describe("getPrecioAplicable", () => {
    it("debería obtener precio como INTEGER", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: 250,
        error: null,
      });

      const result = await repository.getPrecioAplicable(
        EntidadTipo.PRODUCTO,
        validUUID2
      );

      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_precio_aplicable", {
        p_entidad_tipo: EntidadTipo.PRODUCTO,
        p_entidad_id: validUUID2,
        p_ubicacion_id: null,
        p_service_point_id: null,
        p_fecha: expect.any(String),
      });
      expect(result).toBe(250);
    });

    it("debería retornar null cuando no hay precio", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await repository.getPrecioAplicable(
        EntidadTipo.PRODUCTO,
        validUUID2
      );

      expect(result).toBeNull();
    });

    it("debería lanzar error en fallo de RPC", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: "RPC error" },
      });

      await expect(
        repository.getPrecioAplicable(EntidadTipo.PRODUCTO, validUUID2)
      ).rejects.toThrow("Error al obtener precio aplicable");
    });
  });

  // ===== GET PRECIOS VIGENTES =====
  describe("getPreciosVigentes", () => {
    it("debería obtener precios vigentes", async () => {
      const mockVigentes = [
        {
          id: validUUID,
          nivel: NivelPrecio.BASE,
          entidad_tipo: EntidadTipo.PRODUCTO,
          entidad_id: validUUID2,
          precio: 250,
          precio_euros: 2.5,
          ubicacion_id: null,
          service_point_id: null,
          fecha_inicio: "2025-01-01",
          fecha_fin: null,
          ubicacion_nombre: null,
          service_point_nombre: null,
          dias_restantes: null,
          activo_hoy: true,
        },
      ];

      const mockChain = {
        select: jest.fn(),
        eq: jest.fn(),
        order: jest.fn(),
        range: jest.fn(),
      };

      mockChain.select.mockReturnValue(mockChain);
      mockChain.eq.mockReturnValue(mockChain);
      mockChain.order.mockReturnValue(mockChain);
      mockChain.range.mockResolvedValue({
        data: mockVigentes,
        count: 1,
        error: null,
      } as any);

      mockSupabase.from.mockReturnValue(mockChain);

      const result = await repository.getPreciosVigentes({
        page: 1,
        limit: 20,
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("v_precios_vigentes");
      expect(result.data).toEqual(mockVigentes);
      expect(result.total).toBe(1);
    });

    it("debería lanzar error en fallo de query", async () => {
      const mockChain = {
        select: jest.fn(),
        eq: jest.fn(),
        order: jest.fn(),
        range: jest.fn(),
      };

      const dbError = new Error("Database error");

      mockChain.select.mockReturnValue(mockChain);
      mockChain.eq.mockReturnValue(mockChain);
      mockChain.order.mockReturnValue(mockChain);
      mockChain.range.mockResolvedValue({
        data: null,
        count: null,
        error: dbError,
      } as any);

      mockSupabase.from.mockReturnValue(mockChain);

      await expect(
        repository.getPreciosVigentes({ page: 1, limit: 20 })
      ).rejects.toThrow("Error al obtener precios vigentes");
    });
  });

  // ===== GET PRECIOS BY NIVEL =====
  describe("getPreciosByNivel", () => {
    it("debería obtener precios filtrados por nivel", async () => {
      const mockPrecios = [
        {
          id: validUUID,
          nivel: NivelPrecio.BASE,
          entidad_tipo: EntidadTipo.PRODUCTO,
          entidad_id: validUUID2,
          precio: 250,
          ubicacion_id: null,
          service_point_id: null,
          fecha_inicio: "2025-01-01",
          fecha_fin: null,
          notas: "Precio base",
          created_at: "2025-10-11T10:00:00Z",
          updated_at: "2025-10-11T10:00:00Z",
        },
      ];

      const mockChain = {
        select: jest.fn(),
        eq: jest.fn(),
        order: jest.fn(),
      };

      mockChain.select.mockReturnValue(mockChain);
      mockChain.eq.mockReturnValue(mockChain);
      mockChain.order.mockResolvedValue({
        data: mockPrecios,
        error: null,
      } as any);

      mockSupabase.from.mockReturnValue(mockChain);

      const result = await repository.getPreciosByNivel(NivelPrecio.BASE);

      expect(mockSupabase.from).toHaveBeenCalledWith("precios");
      expect(result).toEqual(mockPrecios);
    });

    it("debería lanzar error en fallo de query", async () => {
      const mockChain = {
        select: jest.fn(),
        eq: jest.fn(),
        order: jest.fn(),
      };

      const dbError = new Error("Database error");

      mockChain.select.mockReturnValue(mockChain);
      mockChain.eq.mockReturnValue(mockChain);
      mockChain.order.mockResolvedValue({
        data: null,
        error: dbError,
      } as any);

      mockSupabase.from.mockReturnValue(mockChain);

      await expect(
        repository.getPreciosByNivel(NivelPrecio.BASE)
      ).rejects.toThrow("Error al obtener precios por nivel");
    });
  });

  // ===== GET PRECIOS BY ENTIDAD =====
  describe("getPreciosByEntidad", () => {
    it("debería obtener precios filtrados por entidad", async () => {
      const mockPrecios = [
        {
          id: validUUID,
          nivel: NivelPrecio.BASE,
          entidad_tipo: EntidadTipo.PRODUCTO,
          entidad_id: validUUID2,
          precio: 250,
          ubicacion_id: null,
          service_point_id: null,
          fecha_inicio: "2025-01-01",
          fecha_fin: null,
          notas: null,
          created_at: "2025-10-11T10:00:00Z",
          updated_at: "2025-10-11T10:00:00Z",
        },
      ];

      const mockChain = {
        select: jest.fn(),
        eq: jest.fn(),
        order: jest.fn(),
      };

      mockChain.select.mockReturnValue(mockChain);
      mockChain.eq.mockReturnValue(mockChain);
      mockChain.order.mockResolvedValue({
        data: mockPrecios,
        error: null,
      } as any);

      mockSupabase.from.mockReturnValue(mockChain);

      const result = await repository.getPreciosByEntidad(
        EntidadTipo.PRODUCTO,
        validUUID2
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("precios");
      expect(result).toEqual(mockPrecios);
    });

    it("debería lanzar error en fallo de query", async () => {
      const mockChain = {
        select: jest.fn(),
        eq: jest.fn(),
        order: jest.fn(),
      };

      const dbError = new Error("Database error");

      mockChain.select.mockReturnValue(mockChain);
      mockChain.eq.mockReturnValue(mockChain);
      mockChain.order.mockResolvedValue({
        data: null,
        error: dbError,
      } as any);

      mockSupabase.from.mockReturnValue(mockChain);

      await expect(
        repository.getPreciosByEntidad(EntidadTipo.PRODUCTO, validUUID2)
      ).rejects.toThrow("Error al obtener precios por entidad");
    });
  });
});
