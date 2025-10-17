/**
 * Sprint 3.2: Tests para vending_machine_slot.schema.ts
 * Cobertura completa de validación Zod
 */

import {
  createVendingMachineSlotSchema,
  updateVendingMachineSlotSchema,
  deleteVendingMachineSlotSchema,
  queryVendingMachineSlotSchema,
  createSlotsForMachineSchema,
  assignProductToSlotSchema,
  slotReservationSchema,
  slotStockUpdateSchema,
  MAX_SLOTS_PER_MACHINE,
  MIN_CAPACIDAD,
  MAX_CAPACIDAD,
  DEFAULT_CAPACIDAD,
} from "@/api/schemas/vending_machine_slot.schema";
import { generateUUID } from "../helpers/factories";

describe("Vending Machine Slot Schemas", () => {
  // UUID válido para tests
  const validUUID = generateUUID();
  const validMachineUUID = generateUUID();
  const validProductoUUID = generateUUID();

  describe("createVendingMachineSlotSchema", () => {
    it("debe validar datos mínimos correctamente", () => {
      const validData = {
        machine_id: validMachineUUID,
        slot_number: 1,
      };

      const result = createVendingMachineSlotSchema.parse(validData);
      expect(result.machine_id).toBe(validMachineUUID);
      expect(result.slot_number).toBe(1);
      expect(result.capacidad_maxima).toBe(DEFAULT_CAPACIDAD); // Default 10
      expect(result.stock_disponible).toBe(0); // Default 0
      expect(result.stock_reservado).toBe(0); // Default 0
      expect(result.activo).toBe(true); // Default true
    });

    it("debe validar datos completos correctamente", () => {
      const validData = {
        machine_id: validMachineUUID,
        slot_number: 5,
        producto_id: validProductoUUID,
        capacidad_maxima: 20,
        stock_disponible: 15,
        stock_reservado: 3,
        precio_override: 12500, // 125.00 en centavos
        activo: true,
        notas: "Slot principal",
      };

      const result = createVendingMachineSlotSchema.parse(validData);
      expect(result).toMatchObject(validData);
    });

    it("debe rechazar UUID inválido en machine_id", () => {
      const invalidData = {
        machine_id: "invalid-uuid",
        slot_number: 1,
      };

      expect(() => createVendingMachineSlotSchema.parse(invalidData)).toThrow(
        "UUID válido"
      );
    });

    it("debe rechazar slot_number negativo", () => {
      const invalidData = {
        machine_id: validMachineUUID,
        slot_number: -1,
      };

      expect(() => createVendingMachineSlotSchema.parse(invalidData)).toThrow();
    });

    it("debe rechazar slot_number cero", () => {
      const invalidData = {
        machine_id: validMachineUUID,
        slot_number: 0,
      };

      expect(() => createVendingMachineSlotSchema.parse(invalidData)).toThrow(
        "positivo"
      );
    });

    it("debe rechazar capacidad menor al mínimo", () => {
      const invalidData = {
        machine_id: validMachineUUID,
        slot_number: 1,
        capacidad_maxima: MIN_CAPACIDAD - 1,
      };

      expect(() => createVendingMachineSlotSchema.parse(invalidData)).toThrow(
        `Capacidad mínima es ${MIN_CAPACIDAD}`
      );
    });

    it("debe rechazar capacidad mayor al máximo", () => {
      const invalidData = {
        machine_id: validMachineUUID,
        slot_number: 1,
        capacidad_maxima: MAX_CAPACIDAD + 1,
      };

      expect(() => createVendingMachineSlotSchema.parse(invalidData)).toThrow(
        `Capacidad máxima es ${MAX_CAPACIDAD}`
      );
    });

    it("debe rechazar stock_disponible negativo", () => {
      const invalidData = {
        machine_id: validMachineUUID,
        slot_number: 1,
        stock_disponible: -5,
      };

      expect(() => createVendingMachineSlotSchema.parse(invalidData)).toThrow(
        "negativo"
      );
    });

    it("debe rechazar stock_reservado negativo", () => {
      const invalidData = {
        machine_id: validMachineUUID,
        slot_number: 1,
        stock_reservado: -3,
      };

      expect(() => createVendingMachineSlotSchema.parse(invalidData)).toThrow(
        "negativo"
      );
    });

    it("debe rechazar stock total > capacidad (refine)", () => {
      const invalidData = {
        machine_id: validMachineUUID,
        slot_number: 1,
        capacidad_maxima: 10,
        stock_disponible: 7,
        stock_reservado: 5, // Total 12 > 10
      };

      expect(() => createVendingMachineSlotSchema.parse(invalidData)).toThrow(
        "exceder capacidad máxima"
      );
    });

    it("debe aceptar stock total = capacidad", () => {
      const validData = {
        machine_id: validMachineUUID,
        slot_number: 1,
        capacidad_maxima: 10,
        stock_disponible: 6,
        stock_reservado: 4, // Total 10 = capacidad
      };

      const result = createVendingMachineSlotSchema.parse(validData);
      expect(result.stock_disponible).toBe(6);
      expect(result.stock_reservado).toBe(4);
    });

    it("debe rechazar precio_override cero", () => {
      const invalidData = {
        machine_id: validMachineUUID,
        slot_number: 1,
        precio_override: 0,
      };

      expect(() => createVendingMachineSlotSchema.parse(invalidData)).toThrow(
        "positivo"
      );
    });

    it("debe rechazar precio_override negativo", () => {
      const invalidData = {
        machine_id: validMachineUUID,
        slot_number: 1,
        precio_override: -100,
      };

      expect(() => createVendingMachineSlotSchema.parse(invalidData)).toThrow();
    });

    it("debe aceptar precio_override null", () => {
      const validData = {
        machine_id: validMachineUUID,
        slot_number: 1,
        precio_override: null,
      };

      const result = createVendingMachineSlotSchema.parse(validData);
      expect(result.precio_override).toBeNull();
    });

    it("debe rechazar notas muy largas", () => {
      const invalidData = {
        machine_id: validMachineUUID,
        slot_number: 1,
        notas: "a".repeat(501), // Máximo 500
      };

      expect(() => createVendingMachineSlotSchema.parse(invalidData)).toThrow(
        "500 caracteres"
      );
    });

    it("debe aceptar producto_id null", () => {
      const validData = {
        machine_id: validMachineUUID,
        slot_number: 1,
        producto_id: null,
      };

      const result = createVendingMachineSlotSchema.parse(validData);
      expect(result.producto_id).toBeNull();
    });
  });

  describe("updateVendingMachineSlotSchema", () => {
    it("debe validar actualización con ID", () => {
      const validData = {
        id: validUUID,
        stock_disponible: 10,
      };

      const result = updateVendingMachineSlotSchema.parse(validData);
      expect(result.id).toBe(validUUID);
      expect(result.stock_disponible).toBe(10);
    });

    it("debe rechazar ID inválido", () => {
      const invalidData = {
        id: "not-a-uuid",
        stock_disponible: 5,
      };

      expect(() => updateVendingMachineSlotSchema.parse(invalidData)).toThrow(
        "UUID válido"
      );
    });

    it("debe permitir actualización parcial", () => {
      const validData = {
        id: validUUID,
        activo: false,
      };

      const result = updateVendingMachineSlotSchema.parse(validData);
      expect(result.id).toBe(validUUID);
      expect(result.activo).toBe(false);
    });

    it("debe validar producto_id null en actualización", () => {
      const validData = {
        id: validUUID,
        producto_id: null,
      };

      const result = updateVendingMachineSlotSchema.parse(validData);
      expect(result.producto_id).toBeNull();
    });
  });

  describe("deleteVendingMachineSlotSchema", () => {
    it("debe validar ID para eliminación", () => {
      const validData = {
        id: validUUID,
      };

      const result = deleteVendingMachineSlotSchema.parse(validData);
      expect(result.id).toBe(validUUID);
    });

    it("debe rechazar ID inválido", () => {
      const invalidData = {
        id: "invalid",
      };

      expect(() => deleteVendingMachineSlotSchema.parse(invalidData)).toThrow();
    });
  });

  describe("queryVendingMachineSlotSchema", () => {
    it("debe aplicar defaults correctamente", () => {
      const minimalData = {};

      const result = queryVendingMachineSlotSchema.parse(minimalData);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.sort_by).toBe("slot_number");
      expect(result.sort_order).toBe("asc");
    });

    it("debe validar filtros completos", () => {
      const validData = {
        machine_id: validMachineUUID,
        slot_number: 5,
        producto_id: validProductoUUID,
        activo: true,
        stock_bajo: true,
        sin_producto: false,
        page: 2,
        limit: 50,
        sort_by: "stock_disponible" as const,
        sort_order: "desc" as const,
      };

      const result = queryVendingMachineSlotSchema.parse(validData);
      expect(result).toMatchObject(validData);
    });

    it("debe rechazar limit mayor a 100", () => {
      const invalidData = {
        limit: 101,
      };

      expect(() => queryVendingMachineSlotSchema.parse(invalidData)).toThrow(
        "máximo es 100"
      );
    });

    it("debe rechazar page negativa", () => {
      const invalidData = {
        page: -1,
      };

      expect(() => queryVendingMachineSlotSchema.parse(invalidData)).toThrow();
    });

    it("debe validar enum sort_by", () => {
      const validData = {
        sort_by: "created_at" as const,
      };

      const result = queryVendingMachineSlotSchema.parse(validData);
      expect(result.sort_by).toBe("created_at");
    });
  });

  describe("createSlotsForMachineSchema", () => {
    it("debe validar datos correctos", () => {
      const validData = {
        machine_id: validMachineUUID,
        num_slots: 20,
        capacidad_maxima: 15,
      };

      const result = createSlotsForMachineSchema.parse(validData);
      expect(result).toMatchObject(validData);
    });

    it("debe aplicar default capacidad_maxima", () => {
      const validData = {
        machine_id: validMachineUUID,
        num_slots: 10,
      };

      const result = createSlotsForMachineSchema.parse(validData);
      expect(result.capacidad_maxima).toBe(DEFAULT_CAPACIDAD);
    });

    it("debe rechazar num_slots = 0", () => {
      const invalidData = {
        machine_id: validMachineUUID,
        num_slots: 0,
      };

      expect(() => createSlotsForMachineSchema.parse(invalidData)).toThrow(
        "al menos 1 slot"
      );
    });

    it("debe rechazar num_slots > MAX_SLOTS_PER_MACHINE", () => {
      const invalidData = {
        machine_id: validMachineUUID,
        num_slots: MAX_SLOTS_PER_MACHINE + 1,
      };

      expect(() => createSlotsForMachineSchema.parse(invalidData)).toThrow(
        `Máximo ${MAX_SLOTS_PER_MACHINE} slots`
      );
    });
  });

  describe("assignProductToSlotSchema", () => {
    it("debe validar asignación correcta", () => {
      const validData = {
        slot_id: validUUID,
        producto_id: validProductoUUID,
        stock_inicial: 10,
      };

      const result = assignProductToSlotSchema.parse(validData);
      expect(result).toMatchObject(validData);
    });

    it("debe aceptar stock_inicial = 0", () => {
      const validData = {
        slot_id: validUUID,
        producto_id: validProductoUUID,
        stock_inicial: 0,
      };

      const result = assignProductToSlotSchema.parse(validData);
      expect(result.stock_inicial).toBe(0);
    });

    it("debe rechazar stock_inicial negativo", () => {
      const invalidData = {
        slot_id: validUUID,
        producto_id: validProductoUUID,
        stock_inicial: -5,
      };

      expect(() => assignProductToSlotSchema.parse(invalidData)).toThrow(
        "negativo"
      );
    });
  });

  describe("slotReservationSchema", () => {
    it("debe validar reserva correcta", () => {
      const validData = {
        slot_id: validUUID,
        cantidad: 5,
      };

      const result = slotReservationSchema.parse(validData);
      expect(result).toMatchObject(validData);
    });

    it("debe rechazar cantidad = 0", () => {
      const invalidData = {
        slot_id: validUUID,
        cantidad: 0,
      };

      expect(() => slotReservationSchema.parse(invalidData)).toThrow(
        "positiva"
      );
    });

    it("debe rechazar cantidad negativa", () => {
      const invalidData = {
        slot_id: validUUID,
        cantidad: -3,
      };

      expect(() => slotReservationSchema.parse(invalidData)).toThrow();
    });
  });

  describe("slotStockUpdateSchema", () => {
    it("debe validar actualización de stock_disponible", () => {
      const validData = {
        slot_id: validUUID,
        stock_disponible: 10,
      };

      const result = slotStockUpdateSchema.parse(validData);
      expect(result.stock_disponible).toBe(10);
    });

    it("debe validar actualización de stock_reservado", () => {
      const validData = {
        slot_id: validUUID,
        stock_reservado: 5,
      };

      const result = slotStockUpdateSchema.parse(validData);
      expect(result.stock_reservado).toBe(5);
    });

    it("debe validar actualización de ambos stocks", () => {
      const validData = {
        slot_id: validUUID,
        stock_disponible: 8,
        stock_reservado: 2,
      };

      const result = slotStockUpdateSchema.parse(validData);
      expect(result.stock_disponible).toBe(8);
      expect(result.stock_reservado).toBe(2);
    });

    it("debe rechazar si no se especifica ningún stock (refine)", () => {
      const invalidData = {
        slot_id: validUUID,
      };

      expect(() => slotStockUpdateSchema.parse(invalidData)).toThrow(
        "al menos"
      );
    });

    it("debe rechazar stock_disponible negativo", () => {
      const invalidData = {
        slot_id: validUUID,
        stock_disponible: -1,
      };

      expect(() => slotStockUpdateSchema.parse(invalidData)).toThrow(
        "negativo"
      );
    });
  });
});
