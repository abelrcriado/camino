/* eslint-disable @typescript-eslint/no-explicit-any */
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../../../pages/api/vending-machines/[id]/slots/[slotId]";
import { VendingMachineSlotService } from "../../../../../src/services/vending_machine_slot.service";
import { VendingMachineSlotRepository } from "../../../../../src/repositories/vending_machine_slot.repository";

// Mock de dependencias
jest.mock("../../../../../src/services/vending_machine_slot.service");
jest.mock("../../../../../src/repositories/vending_machine_slot.repository");

describe("/api/vending-machines/[id]/slots/[slotId]", () => {
  let mockFindById: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDelete: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFindById = jest.fn();
    mockUpdate = jest.fn();
    mockDelete = jest.fn();

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
          update: mockUpdate,
          delete: mockDelete,
        } as any)
    );
  });

  const validMachineId = "123e4567-e89b-12d3-a456-426614174000";
  const validSlotId = "223e4567-e89b-12d3-a456-426614174000";

  describe("GET /api/vending-machines/[id]/slots/[slotId]", () => {
    it("debe obtener un slot exitosamente", async () => {
      const mockSlot = {
        id: validSlotId,
        machine_id: validMachineId,
        slot_number: 1,
        producto_id: "prod-123",
        cantidad_actual: 5,
        capacidad_maxima: 10,
        precio_venta: 2.5,
        estado: "disponible",
      };

      mockFindById.mockResolvedValue(mockSlot);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validMachineId, slotId: validSlotId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual(mockSlot);
      expect(mockFindById).toHaveBeenCalledWith(validSlotId);
    });

    it("debe retornar 404 si el slot no existe", async () => {
      mockFindById.mockResolvedValue(null);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validMachineId, slotId: validSlotId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({
        error: "Slot no encontrado",
      });
    });

    it("debe retornar 404 si el slot no pertenece a la vending machine", async () => {
      const mockSlot = {
        id: validSlotId,
        machine_id: "different-machine-id",
        slot_number: 1,
      };

      mockFindById.mockResolvedValue(mockSlot);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validMachineId, slotId: validSlotId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({
        error: "Slot no encontrado en este vending machine",
      });
    });
  });

  describe("PUT /api/vending-machines/[id]/slots/[slotId]", () => {
    it("debe actualizar un slot exitosamente", async () => {
      const existingSlot = {
        id: validSlotId,
        machine_id: validMachineId,
        slot_number: 1,
        producto_id: "prod-old",
        precio_venta: 2.0,
      };

      const updateData = {
        producto_id: "prod-new",
        precio_venta: 3.5,
        estado: "disponible",
      };

      const updatedSlot = {
        ...existingSlot,
        ...updateData,
      };

      mockFindById.mockResolvedValue(existingSlot);
      mockUpdate.mockResolvedValue(updatedSlot);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        query: { id: validMachineId, slotId: validSlotId },
        body: updateData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ data: [updatedSlot] });
      expect(mockUpdate).toHaveBeenCalledWith(validSlotId, updateData);
    });

    it("debe retornar 404 si el slot a actualizar no existe", async () => {
      mockFindById.mockResolvedValue(null);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        query: { id: validMachineId, slotId: validSlotId },
        body: { precio_venta: 3.5 },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({
        error: "Slot no encontrado",
      });
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("debe retornar 404 si el slot no pertenece a la vending machine", async () => {
      const existingSlot = {
        id: validSlotId,
        machine_id: "different-machine-id",
      };

      mockFindById.mockResolvedValue(existingSlot);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        query: { id: validMachineId, slotId: validSlotId },
        body: { precio_venta: 3.5 },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({
        error: "Slot no encontrado en este vending machine",
      });
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /api/vending-machines/[id]/slots/[slotId]", () => {
    it("debe eliminar un slot exitosamente", async () => {
      const existingSlot = {
        id: validSlotId,
        machine_id: validMachineId,
        slot_number: 1,
      };

      mockFindById.mockResolvedValue(existingSlot);
      mockDelete.mockResolvedValue(undefined);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        query: { id: validMachineId, slotId: validSlotId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: "Slot eliminado exitosamente",
      });
      expect(mockDelete).toHaveBeenCalledWith(validSlotId);
    });

    it("debe retornar 404 si el slot a eliminar no existe", async () => {
      mockFindById.mockResolvedValue(null);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        query: { id: validMachineId, slotId: validSlotId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({
        error: "Slot no encontrado",
      });
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it("debe retornar 404 si el slot no pertenece a la vending machine", async () => {
      const existingSlot = {
        id: validSlotId,
        machine_id: "different-machine-id",
      };

      mockFindById.mockResolvedValue(existingSlot);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        query: { id: validMachineId, slotId: validSlotId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({
        error: "Slot no encontrado en este vending machine",
      });
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  describe("Validación de parámetros", () => {
    it("debe retornar 400 si el ID de vending machine no está presente", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { slotId: validSlotId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "ID de vending machine es requerido",
      });
    });

    it("debe retornar 400 si el ID de slot no está presente", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validMachineId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "ID de slot es requerido",
      });
    });

    it("debe retornar 400 si los IDs no son strings", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: ["array"], slotId: ["array"] },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it("debe retornar 400 si los UUIDs son inválidos", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: "invalid-uuid", slotId: "also-invalid" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "vending machine debe ser un UUID válido",
      });
    });

    it("debe validar que al menos un UUID sea inválido", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validMachineId, slotId: "invalid-uuid" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "slot debe ser un UUID válido",
      });
    });
  });

  describe("Métodos HTTP no permitidos", () => {
    it("debe retornar 405 para POST", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validMachineId, slotId: validSlotId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res._getJSONData()).toEqual({
        error: "Método no permitido",
      });
    });

    it("debe retornar 405 para PATCH", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PATCH",
        query: { id: validMachineId, slotId: validSlotId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });
  });

  describe("Manejo de errores", () => {
    it("debe retornar 500 para errores internos en GET", async () => {
      mockFindById.mockRejectedValue(new Error("Database error"));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validMachineId, slotId: validSlotId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(res._getJSONData()).toEqual({
        error: "Error al procesar la operación del slot",
      });
    });

    it("debe retornar 500 para errores internos en PUT", async () => {
      const existingSlot = {
        id: validSlotId,
        machine_id: validMachineId,
      };

      mockFindById.mockResolvedValue(existingSlot);
      mockUpdate.mockRejectedValue(new Error("Update failed"));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        query: { id: validMachineId, slotId: validSlotId },
        body: { precio_venta: 3.5 },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
    });

    it("debe retornar 500 para errores internos en DELETE", async () => {
      const existingSlot = {
        id: validSlotId,
        machine_id: validMachineId,
      };

      mockFindById.mockResolvedValue(existingSlot);
      mockDelete.mockRejectedValue(new Error("Delete failed"));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        query: { id: validMachineId, slotId: validSlotId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
    });

    it("debe manejar errores no-Error objects", async () => {
      mockFindById.mockRejectedValue("String error");

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validMachineId, slotId: validSlotId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
    });
  });

  describe("Integración con servicio", () => {
    it("debe crear instancias de repository y service", async () => {
      mockFindById.mockResolvedValue({
        id: validSlotId,
        machine_id: validMachineId,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validMachineId, slotId: validSlotId },
      });

      await handler(req, res);

      expect(VendingMachineSlotRepository).toHaveBeenCalledTimes(1);
      expect(VendingMachineSlotService).toHaveBeenCalledTimes(1);
    });
  });
});
