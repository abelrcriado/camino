/* eslint-disable @typescript-eslint/no-explicit-any */
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../../../pages/api/vending-machines/[id]/slots/reabastecer";
import { VendingMachineSlotService } from "../../../../../src/services/vending_machine_slot.service";
import { VendingMachineSlotRepository } from "../../../../../src/repositories/vending_machine_slot.repository";

// Mock de dependencias
jest.mock("../../../../../src/services/vending_machine_slot.service");
jest.mock("../../../../../src/repositories/vending_machine_slot.repository");

describe("/api/vending-machines/[id]/slots/reabastecer", () => {
  let mockFindById: jest.Mock;
  let mockUpdateSlot: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFindById = jest.fn();
    mockUpdateSlot = jest.fn();

    (
      VendingMachineSlotRepository as jest.MockedClass<
        typeof VendingMachineSlotRepository
      >
    ).mockImplementation(() => ({} as any));

    (
      VendingMachineSlotService as jest.MockedClass<
        typeof VendingMachineSlotService
      >
    ).mockImplementation(
      () =>
        ({
          findById: mockFindById,
          updateSlot: mockUpdateSlot,
        } as any)
    );
  });

  const validMachineId = "123e4567-e89b-12d3-a456-426614174000";
  const validSlotId = "223e4567-e89b-12d3-a456-426614174000";

  describe("POST /api/vending-machines/[id]/slots/reabastecer", () => {
    it("debe reabastecer un slot exitosamente", async () => {
      const existingSlot = {
        id: validSlotId,
        machine_id: validMachineId,
        slot_number: 1,
        stock_disponible: 5,
        stock_reservado: 2,
        capacidad_maxima: 20,
      };

      const updatedSlot = {
        ...existingSlot,
        stock_disponible: 15, // 5 + 10
      };

      mockFindById.mockResolvedValue(existingSlot);
      mockUpdateSlot.mockResolvedValue(updatedSlot);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validMachineId },
        body: {
          slot_id: validSlotId,
          cantidad: 10,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = res._getJSONData();
      expect(response).toEqual({
        message: "Slot reabastecido exitosamente",
        slot: {
          id: validSlotId,
          slot_number: 1,
          stock_disponible: 15,
          stock_reservado: 2,
          capacidad_maxima: 20,
        },
        reabastecimiento: {
          cantidad_agregada: 10,
          stock_anterior: 5,
          stock_nuevo: 15,
        },
      });
      expect(mockUpdateSlot).toHaveBeenCalledWith({
        id: validSlotId,
        stock_disponible: 15,
      });
    });

    it("debe retornar 400 si la cantidad excede la capacidad máxima", async () => {
      const existingSlot = {
        id: validSlotId,
        machine_id: validMachineId,
        stock_disponible: 5,
        stock_reservado: 2,
        capacidad_maxima: 10,
      };

      mockFindById.mockResolvedValue(existingSlot);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validMachineId },
        body: {
          slot_id: validSlotId,
          cantidad: 10, // 5 + 10 + 2 (reservado) = 17 > 10 (capacidad)
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "La cantidad excede la capacidad máxima del slot (10)",
      });
      expect(mockUpdateSlot).not.toHaveBeenCalled();
    });

    it("debe reabastecer hasta el límite exacto de capacidad", async () => {
      const existingSlot = {
        id: validSlotId,
        machine_id: validMachineId,
        stock_disponible: 5,
        stock_reservado: 0,
        capacidad_maxima: 15,
      };

      const updatedSlot = {
        ...existingSlot,
        stock_disponible: 15,
      };

      mockFindById.mockResolvedValue(existingSlot);
      mockUpdateSlot.mockResolvedValue(updatedSlot);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validMachineId },
        body: {
          slot_id: validSlotId,
          cantidad: 10, // 5 + 10 = 15 (exacto)
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
    });
  });

  describe("Validación de parámetros", () => {
    it("debe retornar 400 si el ID de vending machine no está presente", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: {},
        body: { slot_id: validSlotId, cantidad: 10 },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "ID de vending machine es requerido",
      });
    });

    it("debe retornar 400 si el ID de vending machine no es string", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: ["array"] },
        body: { slot_id: validSlotId, cantidad: 10 },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it("debe retornar 400 si el ID de vending machine no es UUID válido", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: "invalid-uuid" },
        body: { slot_id: validSlotId, cantidad: 10 },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "ID de vending machine inválido",
      });
    });

    it("debe retornar 400 si slot_id no está presente", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validMachineId },
        body: { cantidad: 10 },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "ID de slot es requerido",
      });
    });

    it("debe retornar 400 si slot_id no es string", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validMachineId },
        body: { slot_id: 123, cantidad: 10 },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it("debe retornar 400 si slot_id no es UUID válido", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validMachineId },
        body: { slot_id: "invalid-uuid", cantidad: 10 },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "ID de slot inválido",
      });
    });

    it("debe retornar 400 si cantidad no está presente", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validMachineId },
        body: { slot_id: validSlotId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "Cantidad es requerida",
      });
    });

    it("debe retornar 400 si cantidad es null", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validMachineId },
        body: { slot_id: validSlotId, cantidad: null },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "Cantidad es requerida",
      });
    });

    it("debe retornar 400 si cantidad no es número", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validMachineId },
        body: { slot_id: validSlotId, cantidad: "10" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "Cantidad es requerida",
      });
    });

    it("debe retornar 400 si cantidad es 0", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validMachineId },
        body: { slot_id: validSlotId, cantidad: 0 },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "La cantidad debe ser mayor a 0",
      });
    });

    it("debe retornar 400 si cantidad es negativa", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validMachineId },
        body: { slot_id: validSlotId, cantidad: -5 },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "La cantidad debe ser mayor a 0",
      });
    });

    it("debe retornar 400 si cantidad no es entero", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validMachineId },
        body: { slot_id: validSlotId, cantidad: 10.5 },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "La cantidad debe ser un número entero",
      });
    });
  });

  describe("Validación de slot", () => {
    it("debe retornar 404 si el slot no existe", async () => {
      mockFindById.mockResolvedValue(null);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validMachineId },
        body: { slot_id: validSlotId, cantidad: 10 },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({
        error: "Slot no encontrado",
      });
    });

    it("debe retornar 404 si el slot no pertenece a la vending machine", async () => {
      const existingSlot = {
        id: validSlotId,
        machine_id: "different-machine-id",
        stock_disponible: 5,
        stock_reservado: 0,
        capacidad_maxima: 20,
      };

      mockFindById.mockResolvedValue(existingSlot);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validMachineId },
        body: { slot_id: validSlotId, cantidad: 10 },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({
        error: "Slot no encontrado en esta vending machine",
      });
    });
  });

  describe("Métodos HTTP no permitidos", () => {
    it("debe retornar 405 para GET", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validMachineId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res._getJSONData()).toEqual({
        error: "Método no permitido",
      });
    });

    it("debe retornar 405 para PUT", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        query: { id: validMachineId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });

    it("debe retornar 405 para DELETE", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        query: { id: validMachineId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });
  });

  describe("Manejo de errores", () => {
    it("debe retornar 500 para errores de 'no encontrado' (asyncHandler convierte a 500)", async () => {
      mockFindById.mockRejectedValue(new Error("Slot no encontrado"));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validMachineId },
        body: { slot_id: validSlotId, cantidad: 10 },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = res._getJSONData();
      expect(data.code).toBe("INTERNAL_SERVER_ERROR");
      expect(data.error).toBeDefined();
    });

    it("debe retornar 500 si updateSlot falla inesperadamente", async () => {
      const existingSlot = {
        id: validSlotId,
        machine_id: validMachineId,
        stock_disponible: 5,
        stock_reservado: 0,
        capacidad_maxima: 20,
      };

      mockFindById.mockResolvedValue(existingSlot);
      mockUpdateSlot.mockRejectedValue(new Error("Database constraint failed"));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validMachineId },
        body: { slot_id: validSlotId, cantidad: 3 },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = res._getJSONData();
      expect(data.code).toBe("INTERNAL_SERVER_ERROR");
      expect(data.error).toBeDefined();
    });

    it("debe retornar 500 para errores internos (asyncHandler)", async () => {
      mockFindById.mockRejectedValue(new Error("Database error"));

      const { req, res} = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validMachineId },
        body: { slot_id: validSlotId, cantidad: 10 },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = res._getJSONData();
      expect(data.code).toBe("INTERNAL_SERVER_ERROR");
      expect(data.error).toBeDefined();
    });

    it("debe manejar errores no-Error objects (asyncHandler)", async () => {
      mockFindById.mockRejectedValue("String error");

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validMachineId },
        body: { slot_id: validSlotId, cantidad: 10 },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = res._getJSONData();
      expect(data.code).toBe("INTERNAL_SERVER_ERROR");
      expect(data.error).toBeDefined();
    });
  });

  describe("Integración con servicio", () => {
    it("debe crear instancias de repository y service", async () => {
      const existingSlot = {
        id: validSlotId,
        machine_id: validMachineId,
        stock_disponible: 5,
        stock_reservado: 0,
        capacidad_maxima: 20,
      };

      mockFindById.mockResolvedValue(existingSlot);
      mockUpdateSlot.mockResolvedValue({
        ...existingSlot,
        stock_disponible: 15,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validMachineId },
        body: { slot_id: validSlotId, cantidad: 10 },
      });

      await handler(req, res);

      expect(VendingMachineSlotRepository).toHaveBeenCalledTimes(1);
      expect(VendingMachineSlotService).toHaveBeenCalledTimes(1);
    });
  });
});
