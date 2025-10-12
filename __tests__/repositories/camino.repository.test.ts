/**
 * Tests para CaminoRepository
 * Valida métodos custom del repository con dependency injection
 */

import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { CaminoRepository } from "@/repositories/camino.repository";
import { SupabaseClient } from "@supabase/supabase-js";

type MockedFunction = ReturnType<typeof jest.fn>;

// Mock Supabase client
const mockSupabase = {
  from: jest.fn() as MockedFunction,
  rpc: jest.fn() as MockedFunction,
} as unknown as SupabaseClient;

describe("CaminoRepository", () => {
  let repository: CaminoRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new CaminoRepository(mockSupabase);
  });

  describe("findByCodigo", () => {
    it("should return camino data when found", async () => {
      const mockCamino = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        nombre: "Camino de Santiago Francés",
        codigo: "CSF",
      };

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
      };

      // Mock the resolved value separately to avoid TS errors
      (mockChain.single as jest.Mock).mockResolvedValueOnce({
        data: mockCamino,
        error: null,
      });

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.findByCodigo("CSF");

      expect(mockSupabase.from).toHaveBeenCalledWith("caminos");
      expect(result.data).toEqual(mockCamino);
      expect(result.error).toBeNull();
    });
  });

  describe("findByEstado", () => {
    it("should return caminos by estado", async () => {
      const mockCaminos = [
        { id: "1", nombre: "Camino Norte", estado_operativo: "activo" },
      ];

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };

      (mockChain.eq as jest.Mock).mockResolvedValueOnce({
        data: mockCaminos,
        error: null,
      });

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.findByEstado("activo");

      expect(mockChain.eq).toHaveBeenCalledWith("estado_operativo", "activo");
      expect(result.data).toEqual(mockCaminos);
    });
  });

  describe("getStats", () => {
    it("should return stats for a camino", async () => {
      const mockStats = {
        total_ubicaciones: 15,
        total_service_points: 25,
      };

      (mockSupabase.rpc as jest.Mock).mockResolvedValueOnce({
        data: mockStats,
        error: null,
      });

      const result = await repository.getStats(
        "123e4567-e89b-12d3-a456-426614174000"
      );

      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_camino_stats", {
        p_camino_id: "123e4567-e89b-12d3-a456-426614174000",
      });
      expect(result.data).toEqual(mockStats);
      expect(result.error).toBeNull();
    });
  });

  describe("getAllSummary", () => {
    it("should return summary of all caminos", async () => {
      const mockSummary = [
        { camino_id: "123", camino_nombre: "CSF", total_ubicaciones: 15 },
      ];

      (mockSupabase.rpc as jest.Mock).mockResolvedValueOnce({
        data: mockSummary,
        error: null,
      });

      const result = await repository.getAllSummary();

      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_all_caminos_summary");
      expect(result.data).toEqual(mockSummary);
    });
  });

  describe("codigoExists", () => {
    it("should return true when codigo exists", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };

      (mockChain.eq as jest.Mock).mockResolvedValueOnce({
        data: [{ id: "123" }],
        error: null,
      });

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.codigoExists("CSF");

      expect(result.exists).toBe(true);
      expect(result.error).toBeNull();
    });

    it("should return false when codigo does not exist", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };

      (mockChain.eq as jest.Mock).mockResolvedValueOnce({
        data: [],
        error: null,
      });

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.codigoExists("NOEXISTE");

      expect(result.exists).toBe(false);
    });

    it("should exclude specific id when provided", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
      };

      (mockChain.neq as jest.Mock).mockResolvedValueOnce({
        data: [],
        error: null,
      });

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await repository.codigoExists(
        "CSF",
        "123e4567-e89b-12d3-a456-426614174000"
      );

      expect(mockChain.neq).toHaveBeenCalledWith(
        "id",
        "123e4567-e89b-12d3-a456-426614174000"
      );
      expect(result.exists).toBe(false);
    });
  });
});
