/**
 * Sprint 3.2: Tests para vending_machine_slot.repository.ts
 * Cobertura de métodos del repository con mock Supabase
 */

import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { VendingMachineSlotRepository } from "@/api/repositories/vending_machine_slot.repository";
import { SupabaseClient } from "@supabase/supabase-js";
import { VendingMachineSlot } from "@/shared/dto/vending_machine_slot.dto";
import { VendingMachineSlotFactory } from "../helpers/factories";
import {
  createSupabaseQueryMock,
  createMultiCallQueryMock,
  createSupabaseRpcMock,
  createSingleItemQueryMock,
  createNotFoundQueryMock,
} from "../helpers/supabase-mock-builder";

/* eslint-disable @typescript-eslint/no-explicit-any */

type MockedFunction = ReturnType<typeof jest.fn>;

// Mock Supabase client
const mockSupabase = {
  from: jest.fn() as MockedFunction,
  rpc: jest.fn() as MockedFunction,
} as unknown as SupabaseClient;

describe("VendingMachineSlotRepository", () => {
  let repository: VendingMachineSlotRepository;

  const validUUID = "123e4567-e89b-12d3-a456-426614174000";
  const validMachineUUID = "223e4567-e89b-12d3-a456-426614174000";
  const validProductoUUID = "323e4567-e89b-12d3-a456-426614174000";

  const mockSlot: VendingMachineSlot = {
    id: validUUID,
    machine_id: validMachineUUID,
    slot_number: 1,
    producto_id: validProductoUUID,
    capacidad_maxima: 10,
    stock_disponible: 5,
    stock_reservado: 2,
    precio_override: 12500,
    activo: true,
    notas: "Test slot",
    created_at: "2025-10-11T10:00:00Z",
    updated_at: "2025-10-11T10:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new VendingMachineSlotRepository(mockSupabase);
  });

  describe("findByMachine", () => {
    it("debe retornar slots de una máquina ordenados por slot_number", async () => {
      const mockSlots = [
        mockSlot,
        { ...mockSlot, id: validUUID + "2", slot_number: 2 },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest
          .fn()
          .mockResolvedValue({ data: mockSlots, error: null } as any),
      };

      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await repository.findByMachine(validMachineUUID);

      expect(mockSupabase.from).toHaveBeenCalledWith("vending_machine_slots");
      expect(mockQuery.select).toHaveBeenCalledWith("*");
      expect(mockQuery.eq).toHaveBeenCalledWith("machine_id", validMachineUUID);
      expect(mockQuery.order).toHaveBeenCalledWith("slot_number", {
        ascending: true,
      });
      expect(result).toEqual(mockSlots);
    });

    it("debe retornar array vacío si no hay slots", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null } as any),
      };

      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await repository.findByMachine(validMachineUUID);
      expect(result).toEqual([]);
    });

    it("debe lanzar error si falla la consulta", async () => {
      const mockQuery = {
        select: jest.fn(),
        eq: jest.fn(),
        order: jest.fn(),
      };

      const dbError = new Error("Database error");

      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.order.mockResolvedValue({
        data: null,
        error: dbError,
      } as any);

      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      await expect(repository.findByMachine(validMachineUUID)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("findByMachineAndSlotNumber", () => {
    it("debe retornar slot específico", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockSlot, error: null }),
      };

      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await repository.findByMachineAndSlotNumber(
        validMachineUUID,
        1
      );

      expect(mockQuery.eq).toHaveBeenCalledWith("machine_id", validMachineUUID);
      expect(mockQuery.eq).toHaveBeenCalledWith("slot_number", 1);
      expect(result).toEqual(mockSlot);
    });

    it("debe retornar null si no encuentra el slot", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: "PGRST116" },
        }),
      };

      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await repository.findByMachineAndSlotNumber(
        validMachineUUID,
        99
      );
      expect(result).toBeNull();
    });
  });

  describe("findByProducto", () => {
    it("debe retornar slots activos con el producto", async () => {
      const mockSlots = [mockSlot];

      const mockQuery = {
        select: jest.fn(),
        eq: jest.fn(),
        order: jest.fn(),
      };

      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.order.mockReturnValueOnce(mockQuery); // Primera llamada a order
      mockQuery.order.mockResolvedValueOnce({
        data: mockSlots,
        error: null,
      } as any); // Segunda llamada resuelve

      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await repository.findByProducto(validProductoUUID);

      expect(mockQuery.eq).toHaveBeenCalledWith(
        "producto_id",
        validProductoUUID
      );
      expect(mockQuery.eq).toHaveBeenCalledWith("activo", true);
      expect(result).toEqual(mockSlots);
    });
  });

  describe("findLowStock", () => {
    it("debe retornar slots con stock bajo (filtrado en memoria)", async () => {
      const lowStockSlot = {
        ...mockSlot,
        stock_disponible: 3,
        capacidad_maxima: 10,
      }; // 3 < 5
      const normalStockSlot = {
        ...mockSlot,
        id: validUUID + "2",
        stock_disponible: 7,
        capacidad_maxima: 10,
      }; // 7 > 5

      const mockQuery = {
        select: jest.fn(),
        eq: jest.fn(),
        order: jest.fn(),
      };

      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.order.mockReturnValueOnce(mockQuery); // Primera llamada a order
      mockQuery.order.mockResolvedValueOnce({
        data: [lowStockSlot, normalStockSlot],
        error: null,
      } as any); // Segunda llamada resuelve

      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await repository.findLowStock();

      // Debe filtrar solo los que tienen stock_disponible < capacidad_maxima / 2
      expect(result).toHaveLength(1);
      expect(result[0].stock_disponible).toBe(3);
    });

    it("debe filtrar por machine_id si se proporciona", async () => {
      const mockQuery = {
        select: jest.fn(),
        eq: jest.fn(),
        order: jest.fn(),
      };

      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.order.mockReturnValueOnce(mockQuery); // Primera llamada a order
      mockQuery.order.mockResolvedValueOnce({ data: [], error: null } as any); // Segunda llamada resuelve

      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      await repository.findLowStock(validMachineUUID);

      expect(mockQuery.eq).toHaveBeenCalledWith("machine_id", validMachineUUID);
    });
  });

  describe("createSlotsForMachine", () => {
    it("debe crear slots usando función DB", async () => {
      const params = {
        machine_id: validMachineUUID,
        num_slots: 10,
        capacidad_maxima: 15,
      };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: 10, // Número de slots creados
        error: null,
      });

      const result = await repository.createSlotsForMachine(params);

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        "create_slots_for_machine",
        {
          p_machine_id: params.machine_id,
          p_num_slots: params.num_slots,
          p_capacidad_maxima: params.capacidad_maxima,
        }
      );
      expect(result).toBe(10);
    });

    it("debe usar capacidad default si no se especifica", async () => {
      const params = {
        machine_id: validMachineUUID,
        num_slots: 5,
      };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: 5,
        error: null,
      });

      await repository.createSlotsForMachine(params);

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        "create_slots_for_machine",
        {
          p_machine_id: params.machine_id,
          p_num_slots: params.num_slots,
          p_capacidad_maxima: 10, // Default
        }
      );
    });
  });

  describe("assignProductToSlot", () => {
    it("debe asignar producto usando función DB", async () => {
      const params = {
        slot_id: validUUID,
        producto_id: validProductoUUID,
        stock_inicial: 8,
      };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: mockSlot,
        error: null,
      });

      const result = await repository.assignProductToSlot(params);

      expect(mockSupabase.rpc).toHaveBeenCalledWith("asignar_producto_a_slot", {
        p_slot_id: params.slot_id,
        p_producto_id: params.producto_id,
        p_stock_inicial: params.stock_inicial,
      });
      expect(result).toEqual(mockSlot);
    });
  });

  describe("getStockDisponible", () => {
    it("debe obtener stock disponible usando función DB", async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: 5,
        error: null,
      });

      const result = await repository.getStockDisponible(validUUID);

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        "get_stock_disponible_slot",
        {
          p_slot_id: validUUID,
        }
      );
      expect(result).toBe(5);
    });
  });

  describe("reservarStock", () => {
    it("debe reservar stock usando función DB", async () => {
      const params = {
        slot_id: validUUID,
        cantidad: 3,
      };

      const updatedSlot = {
        ...mockSlot,
        stock_disponible: 2, // 5 - 3
        stock_reservado: 5, // 2 + 3
      };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: updatedSlot,
        error: null,
      });

      const result = await repository.reservarStock(params);

      expect(mockSupabase.rpc).toHaveBeenCalledWith("reservar_stock_slot", {
        p_slot_id: params.slot_id,
        p_cantidad: params.cantidad,
      });
      expect(result.stock_disponible).toBe(2);
      expect(result.stock_reservado).toBe(5);
    });
  });

  describe("liberarStock", () => {
    it("debe liberar stock usando función DB", async () => {
      const params = {
        slot_id: validUUID,
        cantidad: 2,
      };

      const updatedSlot = {
        ...mockSlot,
        stock_disponible: 7, // 5 + 2
        stock_reservado: 0, // 2 - 2
      };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: updatedSlot,
        error: null,
      });

      const result = await repository.liberarStock(params);

      expect(mockSupabase.rpc).toHaveBeenCalledWith("liberar_stock_slot", {
        p_slot_id: params.slot_id,
        p_cantidad: params.cantidad,
      });
      expect(result.stock_disponible).toBe(7);
      expect(result.stock_reservado).toBe(0);
    });
  });

  describe("consumirStock", () => {
    it("debe consumir stock usando función DB", async () => {
      const params = {
        slot_id: validUUID,
        cantidad: 2,
      };

      const updatedSlot = {
        ...mockSlot,
        stock_disponible: 5, // Sin cambio
        stock_reservado: 0, // 2 - 2
      };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: updatedSlot,
        error: null,
      });

      const result = await repository.consumirStock(params);

      expect(mockSupabase.rpc).toHaveBeenCalledWith("consumir_stock_slot", {
        p_slot_id: params.slot_id,
        p_cantidad: params.cantidad,
      });
      expect(result.stock_reservado).toBe(0);
    });
  });

  describe("updatePrecio", () => {
    it("debe actualizar precio override", async () => {
      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockSlot, precio_override: 15000 },
          error: null,
        }),
      };

      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await repository.updatePrecio(validUUID, 15000);

      expect(mockQuery.update).toHaveBeenCalledWith({ precio_override: 15000 });
      expect(mockQuery.eq).toHaveBeenCalledWith("id", validUUID);
      expect(result.precio_override).toBe(15000);
    });

    it("debe aceptar null para remover precio override", async () => {
      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockSlot, precio_override: null },
          error: null,
        }),
      };

      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await repository.updatePrecio(validUUID, null);

      expect(mockQuery.update).toHaveBeenCalledWith({ precio_override: null });
      expect(result.precio_override).toBeNull();
    });
  });

  describe("toggleActivo", () => {
    it("debe desactivar slot", async () => {
      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockSlot, activo: false },
          error: null,
        }),
      };

      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await repository.toggleActivo(validUUID, false);

      expect(mockQuery.update).toHaveBeenCalledWith({ activo: false });
      expect(result.activo).toBe(false);
    });
  });

  describe("vaciarSlot", () => {
    it("debe vaciar slot (remover producto y resetear stocks)", async () => {
      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            ...mockSlot,
            producto_id: null,
            stock_disponible: 0,
            stock_reservado: 0,
            precio_override: null,
          },
          error: null,
        }),
      };

      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await repository.vaciarSlot(validUUID);

      expect(mockQuery.update).toHaveBeenCalledWith({
        producto_id: null,
        stock_disponible: 0,
        stock_reservado: 0,
        precio_override: null,
      });
      expect(result.producto_id).toBeNull();
      expect(result.stock_disponible).toBe(0);
      expect(result.stock_reservado).toBe(0);
    });
  });

  describe("countByMachine", () => {
    it("debe contar slots de una máquina", async () => {
      const mockQuery = {
        select: jest.fn(),
        eq: jest.fn(),
      };

      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.eq.mockResolvedValue({ count: 15, error: null } as any);

      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await repository.countByMachine(validMachineUUID);

      expect(mockQuery.select).toHaveBeenCalledWith("*", {
        count: "exact",
        head: true,
      });
      expect(mockQuery.eq).toHaveBeenCalledWith("machine_id", validMachineUUID);
      expect(result).toBe(15);
    });
  });

  describe("slotNumberExists", () => {
    it("debe retornar true si slot_number existe", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: validUUID },
          error: null,
        }),
      };

      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await repository.slotNumberExists(validMachineUUID, 1);

      expect(result).toBe(true);
    });

    it("debe retornar false si slot_number no existe", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: "PGRST116" },
        }),
      };

      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await repository.slotNumberExists(validMachineUUID, 99);

      expect(result).toBe(false);
    });

    it("debe excluir ID específico al verificar", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: "PGRST116" },
        }),
      };

      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      await repository.slotNumberExists(validMachineUUID, 1, validUUID);

      expect(mockQuery.neq).toHaveBeenCalledWith("id", validUUID);
    });
  });
});
