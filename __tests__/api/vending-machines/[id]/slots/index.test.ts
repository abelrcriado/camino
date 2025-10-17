/* eslint-disable @typescript-eslint/no-explicit-any */
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../../../pages/api/vending-machines/[id]/slots/index";
import { VendingMachineSlotService } from "@/api/services/vending_machine_slot.service";
import { VendingMachineSlotRepository } from "@/api/repositories/vending_machine_slot.repository";

// Mock de dependencias
jest.mock("@/api/services/vending_machine_slot.service");
jest.mock("@/api/repositories/vending_machine_slot.repository");

describe("/api/vending-machines/[id]/slots", () => {
  let mockFindByMachine: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFindByMachine = jest.fn();

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
          findByMachine: mockFindByMachine,
        } as any)
    );
  });

  describe("GET /api/vending-machines/[id]/slots", () => {
    const validUuid = "123e4567-e89b-12d3-a456-426614174000";

    it("debe retornar slots de una vending machine sin filtros", async () => {
      const mockSlots = [
        {
          id: "slot1",
          vending_machine_id: validUuid,
          slot_number: 1,
          producto_id: "prod1",
          cantidad_actual: 5,
          capacidad_maxima: 10,
          precio_venta: 2.5,
          estado: "disponible",
        },
        {
          id: "slot2",
          vending_machine_id: validUuid,
          slot_number: 2,
          producto_id: "prod2",
          cantidad_actual: 0,
          capacidad_maxima: 10,
          precio_venta: 3.0,
          estado: "vacio",
        },
        {
          id: "slot3",
          vending_machine_id: validUuid,
          slot_number: 3,
          producto_id: null,
          cantidad_actual: 0,
          capacidad_maxima: 10,
          precio_venta: 0,
          estado: "bloqueado",
        },
      ];

      mockFindByMachine.mockResolvedValue(mockSlots);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = res._getJSONData();
      expect(response).toEqual({
        data: mockSlots,
        total: 3,
        vending_machine: { id: validUuid },
      });
      expect(mockFindByMachine).toHaveBeenCalledTimes(1);
      expect(mockFindByMachine).toHaveBeenCalledWith(validUuid);
    });

    it("debe filtrar slots por numero_slot", async () => {
      const allSlots = [
        {
          id: "slot1",
          slot_number: 1,
          vending_machine_id: validUuid,
        },
        {
          id: "slot2",
          slot_number: 2,
          vending_machine_id: validUuid,
        },
        {
          id: "slot3",
          slot_number: 3,
          vending_machine_id: validUuid,
        },
      ];

      mockFindByMachine.mockResolvedValue(allSlots);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid, numero_slot: "2" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = res._getJSONData();
      expect(response.data).toHaveLength(1);
      expect(response.data[0].slot_number).toBe(2);
      expect(response.total).toBe(1);
    });

    it("debe filtrar slots por producto_id", async () => {
      const productoId = "prod-123";
      const allSlots = [
        {
          id: "slot1",
          slot_number: 1,
          producto_id: productoId,
          vending_machine_id: validUuid,
        },
        {
          id: "slot2",
          slot_number: 2,
          producto_id: "prod-456",
          vending_machine_id: validUuid,
        },
        {
          id: "slot3",
          slot_number: 3,
          producto_id: productoId,
          vending_machine_id: validUuid,
        },
      ];

      mockFindByMachine.mockResolvedValue(allSlots);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid, producto_id: productoId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = res._getJSONData();
      expect(response.data).toHaveLength(2);
      expect(
        response.data.every((slot: any) => slot.producto_id === productoId)
      ).toBe(true);
    });

    it("debe combinar filtros de numero_slot y producto_id", async () => {
      const productoId = "prod-123";
      const allSlots = [
        {
          id: "slot1",
          slot_number: 1,
          producto_id: productoId,
          vending_machine_id: validUuid,
        },
        {
          id: "slot2",
          slot_number: 2,
          producto_id: productoId,
          vending_machine_id: validUuid,
        },
        {
          id: "slot3",
          slot_number: 3,
          producto_id: "prod-456",
          vending_machine_id: validUuid,
        },
      ];

      mockFindByMachine.mockResolvedValue(allSlots);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid, numero_slot: "2", producto_id: productoId },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = res._getJSONData();
      expect(response.data).toHaveLength(1);
      expect(response.data[0].slot_number).toBe(2);
      expect(response.data[0].producto_id).toBe(productoId);
    });

    it("debe retornar array vacío si no hay slots que coincidan con filtros", async () => {
      const allSlots = [
        {
          id: "slot1",
          slot_number: 1,
          producto_id: "prod1",
          vending_machine_id: validUuid,
        },
      ];

      mockFindByMachine.mockResolvedValue(allSlots);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid, numero_slot: "99" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = res._getJSONData();
      expect(response.data).toEqual([]);
      expect(response.total).toBe(0);
    });

    it("debe ignorar numero_slot no numérico", async () => {
      const allSlots = [
        { id: "slot1", slot_number: 1, vending_machine_id: validUuid },
        { id: "slot2", slot_number: 2, vending_machine_id: validUuid },
      ];

      mockFindByMachine.mockResolvedValue(allSlots);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid, numero_slot: "ABC" }, // No numérico
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = res._getJSONData();
      expect(response.data).toHaveLength(2); // Sin filtrar
    });

    it("debe ignorar filtros si son arrays", async () => {
      const allSlots = [
        { id: "slot1", slot_number: 1, vending_machine_id: validUuid },
        { id: "slot2", slot_number: 2, vending_machine_id: validUuid },
      ];

      mockFindByMachine.mockResolvedValue(allSlots);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid, numero_slot: ["1", "2"] }, // Array
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = res._getJSONData();
      expect(response.data).toHaveLength(2); // Sin filtrar
    });
  });

  describe("Validación de parámetros", () => {
    it("debe retornar 400 si el ID no está presente", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "ID de vending machine es requerido",
      });
      expect(mockFindByMachine).not.toHaveBeenCalled();
    });

    it("debe retornar 400 si el ID no es string", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: ["array"] },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "ID debe ser un string",
      });
      expect(mockFindByMachine).not.toHaveBeenCalled();
    });

    it("debe retornar 400 si el ID no es UUID válido", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: "invalid-uuid" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "vending machine debe ser un UUID válido",
      });
      expect(mockFindByMachine).not.toHaveBeenCalled();
    });

    it("debe validar UUID correctamente", async () => {
      const validUuid = "123e4567-e89b-12d3-a456-426614174000";
      mockFindByMachine.mockResolvedValue([]);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockFindByMachine).toHaveBeenCalledWith(validUuid);
    });
  });

  describe("Manejo de errores", () => {
    const validUuid = "123e4567-e89b-12d3-a456-426614174000";

    it("debe retornar 500 si la vending machine no existe (asyncHandler convierte a 500)", async () => {
      const errorMessage = "Vending machine no encontrada";
      mockFindByMachine.mockRejectedValue(new Error(errorMessage));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = res._getJSONData();
      expect(data.code).toBe("INTERNAL_SERVER_ERROR");
      expect(data.error).toBeDefined();
    });

    it("debe retornar 500 para errores internos (asyncHandler)", async () => {
      mockFindByMachine.mockRejectedValue(new Error("Database error"));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = res._getJSONData();
      expect(data.code).toBe("INTERNAL_SERVER_ERROR");
      expect(data.error).toBeDefined();
    });

    it("debe manejar errores no-Error objects (asyncHandler)", async () => {
      mockFindByMachine.mockRejectedValue("String error");

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = res._getJSONData();
      expect(data.code).toBe("INTERNAL_SERVER_ERROR");
      expect(data.error).toBeDefined();
    });
  });

  describe("Métodos HTTP no permitidos", () => {
    const validUuid = "123e4567-e89b-12d3-a456-426614174000";

    it("debe retornar 405 para POST", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res._getJSONData()).toEqual({
        error: "Método no permitido",
      });
      expect(mockFindByMachine).not.toHaveBeenCalled();
    });

    it("debe retornar 405 para PUT", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(mockFindByMachine).not.toHaveBeenCalled();
    });

    it("debe retornar 405 para DELETE", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(mockFindByMachine).not.toHaveBeenCalled();
    });
  });

  describe("Integración con servicio", () => {
    it("debe crear instancias de VendingMachineSlotRepository y VendingMachineSlotService", async () => {
      const validUuid = "123e4567-e89b-12d3-a456-426614174000";
      mockFindByMachine.mockResolvedValue([]);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { id: validUuid },
      });

      await handler(req, res);

      expect(VendingMachineSlotRepository).toHaveBeenCalledTimes(1);
      expect(VendingMachineSlotService).toHaveBeenCalledTimes(1);
      expect(VendingMachineSlotService).toHaveBeenCalledWith(
        expect.any(Object)
      );
    });
  });
});
