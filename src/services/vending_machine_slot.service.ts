/**
 * Sprint 3.2: Vending Machine Slots - Service Layer
 * Lógica de negocio: validación de capacidad, gestión de reservas, stock
 */

import { BaseService } from "./base.service";
import { VendingMachineSlotRepository } from "@/repositories/vending_machine_slot.repository";
import { VendingMachineService } from "./vending-machine.service";
import { ServicePointService } from "./service-point.service";
import { ServicePointRepository } from "@/repositories/service-point.repository";
import { PrecioService } from "./precio.service";
import {
  VendingMachineSlot,
  CreateVendingMachineSlotDto,
  UpdateVendingMachineSlotDto,
  VendingMachineSlotFilters,
  VendingMachineSlotFull,
  CreateSlotsForMachineDto,
  AssignProductToSlotDto,
  SlotReservation,
  SlotStockSummary,
} from "@/dto/vending_machine_slot.dto";
import {
  NotFoundError,
  BusinessRuleError,
  DatabaseError,
} from "@/errors/custom-errors";
import { EntidadTipo } from "@/dto/precio.dto";
import logger from "@/config/logger";

export class VendingMachineSlotService extends BaseService<VendingMachineSlot> {
  private slotRepository: VendingMachineSlotRepository;
  private vendingMachineService: VendingMachineService;
  private servicePointService: ServicePointService;
  private precioService: PrecioService;

  constructor(
    repository?: VendingMachineSlotRepository,
    vendingMachineService?: VendingMachineService,
    servicePointService?: ServicePointService,
    precioService?: PrecioService
  ) {
    const repo = repository || new VendingMachineSlotRepository();
    super(repo);
    this.slotRepository = repo;
    this.vendingMachineService =
      vendingMachineService || new VendingMachineService();
    this.servicePointService =
      servicePointService ||
      new ServicePointService(new ServicePointRepository());
    this.precioService = precioService || new PrecioService();
  }

  /**
   * Crear slot con validación de unicidad de slot_number por máquina
   */
  async createSlot(
    data: CreateVendingMachineSlotDto
  ): Promise<VendingMachineSlot> {
    // Validar que el slot_number no exista en la máquina
    const slotExists = await this.slotRepository.slotNumberExists(
      data.machine_id,
      data.slot_number
    );

    if (slotExists) {
      throw new BusinessRuleError(
        `El slot ${data.slot_number} ya existe en la máquina ${data.machine_id}`
      );
    }

    // Validar stock total <= capacidad
    const capacidad = data.capacidad_maxima ?? 10;
    const disponible = data.stock_disponible ?? 0;
    const reservado = data.stock_reservado ?? 0;

    if (disponible + reservado > capacidad) {
      throw new BusinessRuleError(
        `Stock total (${
          disponible + reservado
        }) excede capacidad máxima (${capacidad})`
      );
    }

    // Crear slot
    return await this.create(data);
  }

  /**
   * Actualizar slot con validaciones
   */
  async updateSlot(
    data: UpdateVendingMachineSlotDto
  ): Promise<VendingMachineSlot> {
    // Verificar que el slot existe
    const existing = await this.findById(data.id);
    if (!existing) {
      throw new NotFoundError("Slot", data.id);
    }

    // Validar stock total <= capacidad (si se actualiza alguno de estos campos)
    if (
      data.capacidad_maxima !== undefined ||
      data.stock_disponible !== undefined ||
      data.stock_reservado !== undefined
    ) {
      const newCapacidad = data.capacidad_maxima ?? existing.capacidad_maxima;
      const newDisponible = data.stock_disponible ?? existing.stock_disponible;
      const newReservado = data.stock_reservado ?? existing.stock_reservado;

      if (newDisponible + newReservado > newCapacidad) {
        throw new BusinessRuleError(
          `Stock total (${
            newDisponible + newReservado
          }) excede capacidad máxima (${newCapacidad})`
        );
      }
    }

    // Actualizar
    return await this.update(data.id, data);
  }

  /**
   * Crear múltiples slots para una máquina (función DB)
   */
  async createSlotsForMachine(
    data: CreateSlotsForMachineDto
  ): Promise<{ created: number; message: string }> {
    const created = await this.slotRepository.createSlotsForMachine(data);

    return {
      created,
      message: `${created} slots creados exitosamente para la máquina ${data.machine_id}`,
    };
  }

  /**
   * Asignar producto a slot con validación y resolución automática de precio
   */
  async assignProduct(
    data: AssignProductToSlotDto
  ): Promise<VendingMachineSlot> {
    // Verificar que el slot existe
    const slot = await this.findById(data.slot_id);
    if (!slot) {
      throw new NotFoundError("Slot", data.slot_id);
    }

    // Validar que stock_inicial <= capacidad_maxima
    if (data.stock_inicial > slot.capacidad_maxima) {
      throw new BusinessRuleError(
        `Stock inicial (${data.stock_inicial}) excede capacidad máxima del slot (${slot.capacidad_maxima})`
      );
    }

    // Asignar producto usando función DB
    const assignedSlot = await this.slotRepository.assignProductToSlot(data);

    // Resolver precio jerárquico automáticamente
    try {
      // 1. Obtener vending machine del slot
      const machine = await this.vendingMachineService.getById(slot.machine_id);

      // 2. Obtener service point de la máquina
      const servicePoint = await this.servicePointService.getById(
        machine.service_point_id
      );

      // 3. Resolver precio usando sistema jerárquico
      const precioResuelto = await this.precioService.resolverPrecio({
        entidad_tipo: EntidadTipo.PRODUCTO,
        entidad_id: data.producto_id,
        ubicacion_id: servicePoint.location_id,
        service_point_id: servicePoint.id,
      });

      // 4. Si hay precio resuelto, actualizar precio_override del slot
      if (precioResuelto) {
        logger.info(
          `[VendingMachineSlotService] Precio resuelto para slot ${data.slot_id}: ${precioResuelto.precio} centavos (nivel: ${precioResuelto.nivel})`
        );
        await this.slotRepository.updatePrecio(
          data.slot_id,
          precioResuelto.precio
        );

        // Retornar slot actualizado con precio
        return {
          ...assignedSlot,
          precio_override: precioResuelto.precio,
        };
      } else {
        logger.warn(
          `[VendingMachineSlotService] No se encontró precio para producto ${data.producto_id} en contexto ubicacion=${servicePoint.location_id}, service_point=${servicePoint.id}`
        );
      }
    } catch (error) {
      // Si falla la resolución de precio, logueamos pero no fallamos la asignación
      logger.error(
        "[VendingMachineSlotService] Error al resolver precio:",
        error
      );
      // El slot ya fue asignado con la función DB, solo falló la actualización de precio
    }

    return assignedSlot;
  }

  /**
   * Reservar stock en un slot
   */
  async reserveStock(params: SlotReservation): Promise<VendingMachineSlot> {
    // Verificar stock disponible antes de reservar
    const stockDisponible = await this.slotRepository.getStockDisponible(
      params.slot_id
    );

    if (stockDisponible < params.cantidad) {
      throw new BusinessRuleError(
        `Stock insuficiente. Disponible: ${stockDisponible}, Solicitado: ${params.cantidad}`
      );
    }

    // Reservar usando función DB (con lock)
    return await this.slotRepository.reservarStock(params);
  }

  /**
   * Liberar stock reservado
   */
  async releaseStock(params: SlotReservation): Promise<VendingMachineSlot> {
    return await this.slotRepository.liberarStock(params);
  }

  /**
   * Consumir stock reservado (venta confirmada)
   */
  async consumeStock(params: SlotReservation): Promise<VendingMachineSlot> {
    return await this.slotRepository.consumirStock(params);
  }

  /**
   * Buscar slots con información completa
   */
  async findFullSlots(
    filters?: VendingMachineSlotFilters
  ): Promise<VendingMachineSlotFull[]> {
    return await this.slotRepository.findFullSlots(filters);
  }

  /**
   * Buscar slots por máquina
   */
  async findByMachine(machineId: string): Promise<VendingMachineSlot[]> {
    return await this.slotRepository.findByMachine(machineId);
  }

  /**
   * Buscar slots por producto
   */
  async findByProducto(productoId: string): Promise<VendingMachineSlot[]> {
    return await this.slotRepository.findByProducto(productoId);
  }

  /**
   * Buscar slots con stock bajo
   */
  async findLowStock(machineId?: string): Promise<VendingMachineSlot[]> {
    return await this.slotRepository.findLowStock(machineId);
  }

  /**
   * Obtener resumen de stock de un slot
   */
  async getStockSummary(slotId: string): Promise<SlotStockSummary> {
    const slot = await this.findById(slotId);
    if (!slot) {
      throw new NotFoundError("Slot", slotId);
    }

    const stockTotal = slot.stock_disponible + slot.stock_reservado;
    const porcentajeOcupacion =
      slot.capacidad_maxima > 0
        ? (stockTotal / slot.capacidad_maxima) * 100
        : 0;
    const requiereReposicion = stockTotal < slot.capacidad_maxima * 0.3;

    return {
      slot_id: slot.id,
      machine_id: slot.machine_id,
      slot_number: slot.slot_number,
      capacidad_maxima: slot.capacidad_maxima,
      stock_disponible: slot.stock_disponible,
      stock_reservado: slot.stock_reservado,
      stock_total: stockTotal,
      porcentaje_ocupacion: Math.round(porcentajeOcupacion * 100) / 100,
      requiere_reposicion: requiereReposicion,
    };
  }

  /**
   * Actualizar precio override de un slot
   */
  async updatePrecio(
    slotId: string,
    precioOverride: number | null
  ): Promise<VendingMachineSlot> {
    // Validar que el slot existe
    const slot = await this.findById(slotId);
    if (!slot) {
      throw new NotFoundError("Slot", slotId);
    }

    // Validar que precio es positivo si no es null
    if (precioOverride !== null && precioOverride <= 0) {
      throw new BusinessRuleError("Precio override debe ser mayor a 0");
    }

    return await this.slotRepository.updatePrecio(slotId, precioOverride);
  }

  /**
   * Activar/Desactivar slot
   */
  async toggleActivo(
    slotId: string,
    activo: boolean
  ): Promise<VendingMachineSlot> {
    // Validar que el slot existe
    const slot = await this.findById(slotId);
    if (!slot) {
      throw new NotFoundError("Slot", slotId);
    }

    return await this.slotRepository.toggleActivo(slotId, activo);
  }

  /**
   * Vaciar slot (remover producto y resetear stock)
   */
  async vaciarSlot(slotId: string): Promise<VendingMachineSlot> {
    // Validar que el slot existe
    const slot = await this.findById(slotId);
    if (!slot) {
      throw new NotFoundError("Slot", slotId);
    }

    // No permitir vaciar si hay stock reservado
    if (slot.stock_reservado > 0) {
      throw new BusinessRuleError(
        `No se puede vaciar el slot. Hay ${slot.stock_reservado} unidades reservadas`
      );
    }

    return await this.slotRepository.vaciarSlot(slotId);
  }

  /**
   * Buscar slot específico por máquina y número
   */
  async findByMachineAndSlotNumber(
    machineId: string,
    slotNumber: number
  ): Promise<VendingMachineSlot | null> {
    return await this.slotRepository.findByMachineAndSlotNumber(
      machineId,
      slotNumber
    );
  }

  /**
   * Contar slots de una máquina
   */
  async countByMachine(machineId: string): Promise<number> {
    return await this.slotRepository.countByMachine(machineId);
  }
}
