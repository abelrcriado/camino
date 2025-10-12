/**
 * Sprint 3.2: Vending Machine Slots - Service Layer
 * Lógica de negocio: validación de capacidad, gestión de reservas, stock
 */

import { BaseService } from "./base.service";
import { VendingMachineSlotRepository } from "@/repositories/vending_machine_slot.repository";
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

export class VendingMachineSlotService extends BaseService<VendingMachineSlot> {
  private slotRepository: VendingMachineSlotRepository;

  constructor(repository?: VendingMachineSlotRepository) {
    const repo = repository || new VendingMachineSlotRepository();
    super(repo);
    this.slotRepository = repo;
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
      throw new Error(
        `El slot ${data.slot_number} ya existe en la máquina ${data.machine_id}`
      );
    }

    // Validar stock total <= capacidad
    const capacidad = data.capacidad_maxima ?? 10;
    const disponible = data.stock_disponible ?? 0;
    const reservado = data.stock_reservado ?? 0;

    if (disponible + reservado > capacidad) {
      throw new Error(
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
      throw new Error(`Slot con ID ${data.id} no encontrado`);
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
        throw new Error(
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
   * Asignar producto a slot con validación
   */
  async assignProduct(
    data: AssignProductToSlotDto
  ): Promise<VendingMachineSlot> {
    // Verificar que el slot existe
    const slot = await this.findById(data.slot_id);
    if (!slot) {
      throw new Error(`Slot con ID ${data.slot_id} no encontrado`);
    }

    // Validar que stock_inicial <= capacidad_maxima
    if (data.stock_inicial > slot.capacidad_maxima) {
      throw new Error(
        `Stock inicial (${data.stock_inicial}) excede capacidad máxima del slot (${slot.capacidad_maxima})`
      );
    }

    // Asignar producto usando función DB
    return await this.slotRepository.assignProductToSlot(data);
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
      throw new Error(
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
      throw new Error(`Slot con ID ${slotId} no encontrado`);
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
      throw new Error(`Slot con ID ${slotId} no encontrado`);
    }

    // Validar que precio es positivo si no es null
    if (precioOverride !== null && precioOverride <= 0) {
      throw new Error("Precio override debe ser mayor a 0");
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
      throw new Error(`Slot con ID ${slotId} no encontrado`);
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
      throw new Error(`Slot con ID ${slotId} no encontrado`);
    }

    // No permitir vaciar si hay stock reservado
    if (slot.stock_reservado > 0) {
      throw new Error(
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
