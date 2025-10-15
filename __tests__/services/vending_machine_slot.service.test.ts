/**
 * Sprint 4.2: Tests para integración de Vending Slots con Sistema de Precios
 * Verifica la resolución automática de precios al asignar productos a slots
 */

import { VendingMachineSlotService } from "@/services/vending_machine_slot.service";
import { VendingMachineSlotRepository } from "@/repositories/vending_machine_slot.repository";
import { VendingMachineService } from "@/services/vending-machine.service";
import { ServicePointService } from "@/services/service-point.service";
import { PrecioService } from "@/services/precio.service";
import { NotFoundError, BusinessRuleError } from "@/errors/custom-errors";
import { EntidadTipo } from "@/dto/precio.dto";

// Mock dependencies
jest.mock("@/repositories/vending_machine_slot.repository");
jest.mock("@/services/vending-machine.service");
jest.mock("@/services/service-point.service");
jest.mock("@/services/precio.service");

describe("VendingMachineSlotService - Price Integration", () => {
  let service: VendingMachineSlotService;
  let mockSlotRepository: jest.Mocked<VendingMachineSlotRepository>;
  let mockVendingMachineService: jest.Mocked<VendingMachineService>;
  let mockServicePointService: jest.Mocked<ServicePointService>;
  let mockPrecioService: jest.Mocked<PrecioService>;

  const validSlotId = "550e8400-e29b-41d4-a716-446655440001";
  const validMachineId = "550e8400-e29b-41d4-a716-446655440002";
  const validProductoId = "550e8400-e29b-41d4-a716-446655440003";
  const validServicePointId = "550e8400-e29b-41d4-a716-446655440004";
  const validUbicacionId = "550e8400-e29b-41d4-a716-446655440005";

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mocked instances
    mockSlotRepository = new VendingMachineSlotRepository() as jest.Mocked<VendingMachineSlotRepository>;
    mockVendingMachineService = new VendingMachineService() as jest.Mocked<VendingMachineService>;
    mockServicePointService = new ServicePointService(
      {} as any
    ) as jest.Mocked<ServicePointService>;
    mockPrecioService = new PrecioService() as jest.Mocked<PrecioService>;

    // Create service with mocked dependencies
    service = new VendingMachineSlotService(
      mockSlotRepository,
      mockVendingMachineService,
      mockServicePointService,
      mockPrecioService
    );
  });

  describe("assignProduct", () => {
    const mockSlot = {
      id: validSlotId,
      machine_id: validMachineId,
      slot_number: 1,
      producto_id: null,
      capacidad_maxima: 10,
      stock_disponible: 0,
      stock_reservado: 0,
      precio_override: null,
      activo: true,
      notas: null,
    };

    const mockMachine = {
      id: validMachineId,
      service_point_id: validServicePointId,
      name: "Test Machine",
      machine_code: "VM001",
      status: "active",
    };

    const mockServicePoint = {
      id: validServicePointId,
      location_id: validUbicacionId,
      name: "Test Service Point",
      type: "CSP",
      partner_name: "Test Partner",
      is_active: true,
    };

    const assignData = {
      slot_id: validSlotId,
      producto_id: validProductoId,
      stock_inicial: 5,
    };

    beforeEach(() => {
      // Mock findById to return slot - must mock the repository method that BaseService uses
      // BaseService.findById calls this.repository.findById
      (mockSlotRepository.findById as jest.Mock) = jest.fn().mockResolvedValue({
        data: mockSlot,
        error: null,
      });

      // Mock assignProductToSlot
      mockSlotRepository.assignProductToSlot = jest.fn().mockResolvedValue({
        ...mockSlot,
        producto_id: validProductoId,
        stock_disponible: 5,
      });

      // Mock vending machine service
      mockVendingMachineService.getById = jest.fn().mockResolvedValue(mockMachine);

      // Mock service point service
      mockServicePointService.getById = jest.fn().mockResolvedValue(mockServicePoint);
    });

    it("debe asignar producto y resolver precio automáticamente (SERVICE_POINT)", async () => {
      // Mock precio resuelto de nivel SERVICE_POINT
      const mockPrecioResuelto = {
        precio_id: "precio-id-1",
        precio: 250, // 2.50 EUR en centavos
        precio_euros: 2.5,
        nivel: "service_point",
        ubicacion_id: validUbicacionId,
        service_point_id: validServicePointId,
        fecha_inicio: "2025-01-01",
        fecha_fin: null,
        activo_hoy: true,
      };

      mockPrecioService.resolverPrecio = jest.fn().mockResolvedValue(mockPrecioResuelto);
      mockSlotRepository.updatePrecio = jest.fn().mockResolvedValue({
        ...mockSlot,
        producto_id: validProductoId,
        stock_disponible: 5,
        precio_override: 250,
      });

      const result = await service.assignProduct(assignData);

      // Verificar que se llamó a findById
      expect(mockSlotRepository.findById).toHaveBeenCalledWith(validSlotId);

      // Verificar que se asignó el producto
      expect(mockSlotRepository.assignProductToSlot).toHaveBeenCalledWith(assignData);

      // Verificar jerarquía de obtención de datos
      expect(mockVendingMachineService.getById).toHaveBeenCalledWith(validMachineId);
      expect(mockServicePointService.getById).toHaveBeenCalledWith(validServicePointId);

      // Verificar que se resolvió el precio con el contexto correcto
      expect(mockPrecioService.resolverPrecio).toHaveBeenCalledWith({
        entidad_tipo: EntidadTipo.PRODUCTO,
        entidad_id: validProductoId,
        ubicacion_id: validUbicacionId,
        service_point_id: validServicePointId,
      });

      // Verificar que se actualizó el precio_override
      expect(mockSlotRepository.updatePrecio).toHaveBeenCalledWith(validSlotId, 250);

      // Verificar resultado
      expect(result.precio_override).toBe(250);
    });

    it("debe asignar producto y resolver precio automáticamente (UBICACION)", async () => {
      // Mock precio resuelto de nivel UBICACION
      const mockPrecioResuelto = {
        precio_id: "precio-id-2",
        precio: 300, // 3.00 EUR en centavos
        precio_euros: 3.0,
        nivel: "ubicacion",
        ubicacion_id: validUbicacionId,
        service_point_id: null,
        fecha_inicio: "2025-01-01",
        fecha_fin: null,
        activo_hoy: true,
      };

      mockPrecioService.resolverPrecio = jest.fn().mockResolvedValue(mockPrecioResuelto);
      mockSlotRepository.updatePrecio = jest.fn().mockResolvedValue({
        ...mockSlot,
        producto_id: validProductoId,
        stock_disponible: 5,
        precio_override: 300,
      });

      const result = await service.assignProduct(assignData);

      expect(mockPrecioService.resolverPrecio).toHaveBeenCalled();
      expect(mockSlotRepository.updatePrecio).toHaveBeenCalledWith(validSlotId, 300);
      expect(result.precio_override).toBe(300);
    });

    it("debe asignar producto y resolver precio automáticamente (BASE)", async () => {
      // Mock precio resuelto de nivel BASE
      const mockPrecioResuelto = {
        precio_id: "precio-id-3",
        precio: 200, // 2.00 EUR en centavos
        precio_euros: 2.0,
        nivel: "base",
        ubicacion_id: null,
        service_point_id: null,
        fecha_inicio: "2025-01-01",
        fecha_fin: null,
        activo_hoy: true,
      };

      mockPrecioService.resolverPrecio = jest.fn().mockResolvedValue(mockPrecioResuelto);
      mockSlotRepository.updatePrecio = jest.fn().mockResolvedValue({
        ...mockSlot,
        producto_id: validProductoId,
        stock_disponible: 5,
        precio_override: 200,
      });

      const result = await service.assignProduct(assignData);

      expect(mockSlotRepository.updatePrecio).toHaveBeenCalledWith(validSlotId, 200);
      expect(result.precio_override).toBe(200);
    });

    it("debe asignar producto sin precio si no hay precio definido", async () => {
      // Mock precio no encontrado (null)
      mockPrecioService.resolverPrecio = jest.fn().mockResolvedValue(null);

      const result = await service.assignProduct(assignData);

      // Verificar que se llamó al resolver precio
      expect(mockPrecioService.resolverPrecio).toHaveBeenCalled();

      // Verificar que NO se actualizó precio_override
      expect(mockSlotRepository.updatePrecio).not.toHaveBeenCalled();

      // Verificar que el slot se asignó correctamente aunque no haya precio
      expect(result.producto_id).toBe(validProductoId);
      expect(result.precio_override).toBeNull();
    });

    it("debe asignar producto aunque falle la resolución de precio", async () => {
      // Mock error en resolución de precio
      mockPrecioService.resolverPrecio = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      const result = await service.assignProduct(assignData);

      // Verificar que se asignó el producto a pesar del error
      expect(mockSlotRepository.assignProductToSlot).toHaveBeenCalled();
      expect(result.producto_id).toBe(validProductoId);

      // Verificar que NO se actualizó precio_override
      expect(mockSlotRepository.updatePrecio).not.toHaveBeenCalled();
    });

    it("debe rechazar si el slot no existe", async () => {
      (mockSlotRepository.findById as jest.Mock) = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(service.assignProduct(assignData)).rejects.toThrow(NotFoundError);
      await expect(service.assignProduct(assignData)).rejects.toThrow(
        "Registro con ID"
      );

      // No debe llamar a otros servicios
      expect(mockSlotRepository.assignProductToSlot).not.toHaveBeenCalled();
      expect(mockVendingMachineService.getById).not.toHaveBeenCalled();
    });

    it("debe rechazar si stock_inicial excede capacidad_maxima", async () => {
      const invalidAssignData = {
        slot_id: validSlotId,
        producto_id: validProductoId,
        stock_inicial: 15, // Mayor que capacidad_maxima (10)
      };

      await expect(service.assignProduct(invalidAssignData)).rejects.toThrow(
        BusinessRuleError
      );
      await expect(service.assignProduct(invalidAssignData)).rejects.toThrow(
        "excede capacidad máxima"
      );

      // No debe asignar el producto
      expect(mockSlotRepository.assignProductToSlot).not.toHaveBeenCalled();
    });

    it("debe manejar error al obtener vending machine", async () => {
      mockVendingMachineService.getById = jest
        .fn()
        .mockRejectedValue(new NotFoundError("Vending Machine", validMachineId));

      const result = await service.assignProduct(assignData);

      // Debe asignar producto aunque falle obtener machine
      expect(mockSlotRepository.assignProductToSlot).toHaveBeenCalled();
      expect(result.producto_id).toBe(validProductoId);

      // No debe actualizar precio
      expect(mockSlotRepository.updatePrecio).not.toHaveBeenCalled();
    });

    it("debe manejar error al obtener service point", async () => {
      mockServicePointService.getById = jest
        .fn()
        .mockRejectedValue(
          new NotFoundError("Service Point", validServicePointId)
        );

      const result = await service.assignProduct(assignData);

      // Debe asignar producto aunque falle obtener service point
      expect(mockSlotRepository.assignProductToSlot).toHaveBeenCalled();
      expect(result.producto_id).toBe(validProductoId);

      // No debe actualizar precio
      expect(mockSlotRepository.updatePrecio).not.toHaveBeenCalled();
    });

    it("debe aceptar stock_inicial = 0", async () => {
      const zeroStockData = {
        slot_id: validSlotId,
        producto_id: validProductoId,
        stock_inicial: 0,
      };

      // Mock para stock inicial = 0
      mockSlotRepository.assignProductToSlot = jest.fn().mockResolvedValue({
        ...mockSlot,
        producto_id: validProductoId,
        stock_disponible: 0,
      });

      mockPrecioService.resolverPrecio = jest.fn().mockResolvedValue({
        precio_id: "precio-id",
        precio: 250,
        precio_euros: 2.5,
        nivel: "base",
        ubicacion_id: null,
        service_point_id: null,
        fecha_inicio: "2025-01-01",
        fecha_fin: null,
        activo_hoy: true,
      });

      mockSlotRepository.updatePrecio = jest.fn().mockResolvedValue({
        ...mockSlot,
        producto_id: validProductoId,
        stock_disponible: 0,
        precio_override: 250,
      });

      const result = await service.assignProduct(zeroStockData);

      expect(result.stock_disponible).toBe(0);
      expect(mockPrecioService.resolverPrecio).toHaveBeenCalled();
    });

    it("debe pasar el contexto completo a resolverPrecio", async () => {
      mockPrecioService.resolverPrecio = jest.fn().mockResolvedValue(null);

      await service.assignProduct(assignData);

      // Verificar que se pasa el contexto completo
      expect(mockPrecioService.resolverPrecio).toHaveBeenCalledWith(
        expect.objectContaining({
          entidad_tipo: EntidadTipo.PRODUCTO,
          entidad_id: validProductoId,
          ubicacion_id: validUbicacionId,
          service_point_id: validServicePointId,
        })
      );
    });
  });
});
