/**
 * Sprint 3.2: Vending Machine Slots - Repository Layer
 * Extiende BaseRepository con métodos específicos para gestión de slots
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { BaseRepository } from "./base.repository";
import {
  VendingMachineSlot,
  VendingMachineSlotFilters,
  VendingMachineSlotFull,
  CreateSlotsForMachineDto,
  AssignProductToSlotDto,
  SlotReservation,
} from "@/dto/vending_machine_slot.dto";
import { supabase as defaultSupabase } from "@/services/supabase";

export class VendingMachineSlotRepository extends BaseRepository<VendingMachineSlot> {
  constructor(supabase?: SupabaseClient) {
    super(supabase || defaultSupabase, "vending_machine_slots");
  }

  /**
   * Buscar slots por ID de máquina
   */
  async findByMachine(machineId: string): Promise<VendingMachineSlot[]> {
    try {
      const { data, error } = await this.db
        .from(this.tableName)
        .select("*")
        .eq("machine_id", machineId)
        .order("slot_number", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar slot específico por máquina y número de slot
   */
  async findByMachineAndSlotNumber(
    machineId: string,
    slotNumber: number
  ): Promise<VendingMachineSlot | null> {
    try {
      const { data, error } = await this.db
        .from(this.tableName)
        .select("*")
        .eq("machine_id", machineId)
        .eq("slot_number", slotNumber)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // No encontrado
        }
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar slots con información completa (vista)
   */
  async findFullSlots(
    filters?: VendingMachineSlotFilters
  ): Promise<VendingMachineSlotFull[]> {
    try {
      let query = this.db.from("v_vending_machine_slots_full").select("*");

      if (filters) {
        if (filters.machine_id)
          query = query.eq("machine_id", filters.machine_id);
        if (filters.slot_number)
          query = query.eq("slot_number", filters.slot_number);
        if (filters.producto_id)
          query = query.eq("producto_id", filters.producto_id);
        if (filters.activo !== undefined)
          query = query.eq("activo", filters.activo);
        if (filters.sin_producto) query = query.is("producto_id", null);
        // stock_bajo se maneja mejor en la vista o con filtro post-query
      }

      query = query.order("machine_name", { ascending: true });
      query = query.order("slot_number", { ascending: true });

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar slots activos por producto
   */
  async findByProducto(productoId: string): Promise<VendingMachineSlot[]> {
    try {
      const { data, error } = await this.db
        .from(this.tableName)
        .select("*")
        .eq("producto_id", productoId)
        .eq("activo", true)
        .order("machine_id", { ascending: true })
        .order("slot_number", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar slots con stock bajo
   * Nota: Usa índice idx_vms_stock_bajo para optimizar la consulta
   */
  async findLowStock(machineId?: string): Promise<VendingMachineSlot[]> {
    try {
      // Obtener todos los slots activos y filtrar en memoria
      let query = this.db.from(this.tableName).select("*").eq("activo", true);

      if (machineId) {
        query = query.eq("machine_id", machineId);
      }

      query = query.order("machine_id", { ascending: true });
      query = query.order("slot_number", { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      // Filtrar stock_disponible < capacidad_maxima / 2 en memoria
      return (data || []).filter(
        (slot) => slot.stock_disponible < slot.capacidad_maxima / 2
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crear slots automáticamente para una máquina (función DB)
   */
  async createSlotsForMachine(
    params: CreateSlotsForMachineDto
  ): Promise<number> {
    try {
      const { data, error } = await this.db.rpc("create_slots_for_machine", {
        p_machine_id: params.machine_id,
        p_num_slots: params.num_slots,
        p_capacidad_maxima: params.capacidad_maxima || 10,
      });

      if (error) throw error;
      return data as number; // Retorna número de slots creados
    } catch (error) {
      throw error;
    }
  }

  /**
   * Asignar producto a slot (función DB)
   */
  async assignProductToSlot(
    params: AssignProductToSlotDto
  ): Promise<VendingMachineSlot> {
    try {
      const { data, error } = await this.db.rpc("asignar_producto_a_slot", {
        p_slot_id: params.slot_id,
        p_producto_id: params.producto_id,
        p_stock_inicial: params.stock_inicial,
      });

      if (error) throw error;
      return data as VendingMachineSlot;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener stock disponible de un slot (función DB)
   */
  async getStockDisponible(slotId: string): Promise<number> {
    try {
      const { data, error } = await this.db.rpc("get_stock_disponible_slot", {
        p_slot_id: slotId,
      });

      if (error) throw error;
      return data as number;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reservar stock en un slot (función DB)
   */
  async reservarStock(params: SlotReservation): Promise<VendingMachineSlot> {
    try {
      const { data, error } = await this.db.rpc("reservar_stock_slot", {
        p_slot_id: params.slot_id,
        p_cantidad: params.cantidad,
      });

      if (error) throw error;
      return data as VendingMachineSlot;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Liberar stock reservado (función DB)
   */
  async liberarStock(params: SlotReservation): Promise<VendingMachineSlot> {
    try {
      const { data, error } = await this.db.rpc("liberar_stock_slot", {
        p_slot_id: params.slot_id,
        p_cantidad: params.cantidad,
      });

      if (error) throw error;
      return data as VendingMachineSlot;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Consumir stock reservado (venta confirmada) (función DB)
   */
  async consumirStock(params: SlotReservation): Promise<VendingMachineSlot> {
    try {
      const { data, error } = await this.db.rpc("consumir_stock_slot", {
        p_slot_id: params.slot_id,
        p_cantidad: params.cantidad,
      });

      if (error) throw error;
      return data as VendingMachineSlot;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar precio override de un slot
   */
  async updatePrecio(
    slotId: string,
    precioOverride: number | null
  ): Promise<VendingMachineSlot> {
    try {
      const { data, error } = await this.db
        .from(this.tableName)
        .update({ precio_override: precioOverride })
        .eq("id", slotId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Activar/Desactivar slot
   */
  async toggleActivo(
    slotId: string,
    activo: boolean
  ): Promise<VendingMachineSlot> {
    try {
      const { data, error } = await this.db
        .from(this.tableName)
        .update({ activo })
        .eq("id", slotId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Vaciar slot (remover producto y resetear stock)
   */
  async vaciarSlot(slotId: string): Promise<VendingMachineSlot> {
    try {
      const { data, error } = await this.db
        .from(this.tableName)
        .update({
          producto_id: null,
          stock_disponible: 0,
          stock_reservado: 0,
          precio_override: null,
        })
        .eq("id", slotId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Contar slots por máquina
   */
  async countByMachine(machineId: string): Promise<number> {
    try {
      const { count, error } = await this.db
        .from(this.tableName)
        .select("*", { count: "exact", head: true })
        .eq("machine_id", machineId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar si número de slot ya existe en máquina
   */
  async slotNumberExists(
    machineId: string,
    slotNumber: number,
    excludeId?: string
  ): Promise<boolean> {
    try {
      let query = this.db
        .from(this.tableName)
        .select("id")
        .eq("machine_id", machineId)
        .eq("slot_number", slotNumber);

      if (excludeId) {
        query = query.neq("id", excludeId);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === "PGRST116") {
          return false; // No existe
        }
        throw error;
      }

      return !!data;
    } catch (error) {
      throw error;
    }
  }
}
