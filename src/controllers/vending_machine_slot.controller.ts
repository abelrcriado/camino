/**
 * Sprint 3.2: Vending Machine Slots - Controller Layer
 * Maneja HTTP requests y delegación al service
 */

import { NextApiRequest, NextApiResponse } from "next";
import { VendingMachineSlotService } from "@/services/vending_machine_slot.service";
import {
  createVendingMachineSlotSchema,
  updateVendingMachineSlotSchema,
  deleteVendingMachineSlotSchema,
  queryVendingMachineSlotSchema,
  createSlotsForMachineSchema,
  assignProductToSlotSchema,
  slotReservationSchema,
} from "@/schemas/vending_machine_slot.schema";
import logger from "@/config/logger";
import { VendingMachineSlotFilters } from "@/dto/vending_machine_slot.dto";

export class VendingMachineSlotController {
  private service: VendingMachineSlotService;

  constructor(service?: VendingMachineSlotService) {
    this.service = service || new VendingMachineSlotService();
  }

  async handle(req: NextApiRequest, res: NextApiResponse) {
    try {
      switch (req.method) {
        case "GET":
          return await this.getSlots(req, res);
        case "POST":
          return await this.createSlot(req, res);
        case "PUT":
          return await this.updateSlot(req, res);
        case "DELETE":
          return await this.deleteSlot(req, res);
        default:
          return res.status(405).json({ error: "Método no permitido" });
      }
    } catch (error) {
      logger.error("Error en VendingMachineSlotController:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  private async getSlots(req: NextApiRequest, res: NextApiResponse) {
    try {
      const query = queryVendingMachineSlotSchema.parse(req.query);

      const filters: VendingMachineSlotFilters = {
        machine_id: query.machine_id,
        slot_number: query.slot_number,
        producto_id: query.producto_id,
        activo: query.activo,
        stock_bajo: query.stock_bajo,
        sin_producto: query.sin_producto,
      };

      const paginationParams = {
        page: query.page ?? 1,
        limit: query.limit ?? 20,
      };

      const sortParams = {
        field: query.sort_by ?? "slot_number",
        order: query.sort_order ?? "asc",
      };

      const result = await this.service.findAll(
        filters as Record<string, string | number | boolean | undefined>,
        paginationParams,
        sortParams
      );

      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error && error.message.includes("validation")) {
        return res.status(400).json({ error: error.message });
      }
      logger.error("Error al obtener slots:", error);
      return res.status(500).json({ error: "Error al obtener slots" });
    }
  }

  private async createSlot(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = createVendingMachineSlotSchema.parse(req.body);

      const slot = await this.service.createSlot(data);

      logger.info(`Slot creado: ${slot.id}`);
      return res.status(201).json({ data: [slot] });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("ya existe") ||
          error.message.includes("excede")
        ) {
          return res.status(409).json({ error: error.message });
        }
        if (error.message.includes("validation")) {
          return res.status(400).json({ error: error.message });
        }
      }
      logger.error("Error al crear slot:", error);
      return res.status(500).json({ error: "Error al crear slot" });
    }
  }

  private async updateSlot(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = updateVendingMachineSlotSchema.parse(req.body);

      const slot = await this.service.updateSlot(data);

      logger.info(`Slot actualizado: ${slot.id}`);
      return res.status(200).json({ data: [slot] });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("no encontrado")) {
          return res.status(404).json({ error: error.message });
        }
        if (
          error.message.includes("excede") ||
          error.message.includes("validation")
        ) {
          return res.status(400).json({ error: error.message });
        }
      }
      logger.error("Error al actualizar slot:", error);
      return res.status(500).json({ error: "Error al actualizar slot" });
    }
  }

  private async deleteSlot(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = deleteVendingMachineSlotSchema.parse(req.body);

      await this.service.delete(data.id);

      logger.info(`Slot eliminado: ${data.id}`);
      return res
        .status(200)
        .json({ message: `Slot ${data.id} eliminado exitosamente` });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("no encontrado")) {
          return res.status(404).json({ error: error.message });
        }
        if (error.message.includes("validation")) {
          return res.status(400).json({ error: error.message });
        }
      }
      logger.error("Error al eliminar slot:", error);
      return res.status(500).json({ error: "Error al eliminar slot" });
    }
  }

  /**
   * Crear múltiples slots para una máquina
   */
  async createSlotsForMachine(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = createSlotsForMachineSchema.parse(req.body);

      const result = await this.service.createSlotsForMachine(data);

      logger.info(
        `${result.created} slots creados para máquina ${data.machine_id}`
      );
      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("validation")) {
          return res.status(400).json({ error: error.message });
        }
        if (error.message.includes("no encontrad")) {
          return res.status(404).json({ error: error.message });
        }
      }
      logger.error("Error al crear slots para máquina:", error);
      return res
        .status(500)
        .json({ error: "Error al crear slots para máquina" });
    }
  }

  /**
   * Asignar producto a slot
   */
  async assignProduct(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = assignProductToSlotSchema.parse(req.body);

      const slot = await this.service.assignProduct(data);

      logger.info(
        `Producto ${data.producto_id} asignado a slot ${data.slot_id}`
      );
      return res.status(200).json({ data: [slot] });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("no encontrado")) {
          return res.status(404).json({ error: error.message });
        }
        if (
          error.message.includes("excede") ||
          error.message.includes("validation")
        ) {
          return res.status(400).json({ error: error.message });
        }
      }
      logger.error("Error al asignar producto:", error);
      return res.status(500).json({ error: "Error al asignar producto" });
    }
  }

  /**
   * Reservar stock en slot
   */
  async reserveStock(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = slotReservationSchema.parse(req.body);

      const slot = await this.service.reserveStock(data);

      logger.info(
        `${data.cantidad} unidades reservadas en slot ${data.slot_id}`
      );
      return res.status(200).json({ data: [slot] });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("insuficiente")) {
          return res.status(409).json({ error: error.message });
        }
        if (error.message.includes("validation")) {
          return res.status(400).json({ error: error.message });
        }
      }
      logger.error("Error al reservar stock:", error);
      return res.status(500).json({ error: "Error al reservar stock" });
    }
  }

  /**
   * Liberar stock reservado
   */
  async releaseStock(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = slotReservationSchema.parse(req.body);

      const slot = await this.service.releaseStock(data);

      logger.info(
        `${data.cantidad} unidades liberadas en slot ${data.slot_id}`
      );
      return res.status(200).json({ data: [slot] });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("validation")) {
          return res.status(400).json({ error: error.message });
        }
      }
      logger.error("Error al liberar stock:", error);
      return res.status(500).json({ error: "Error al liberar stock" });
    }
  }

  /**
   * Consumir stock reservado (venta confirmada)
   */
  async consumeStock(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = slotReservationSchema.parse(req.body);

      const slot = await this.service.consumeStock(data);

      logger.info(
        `${data.cantidad} unidades consumidas en slot ${data.slot_id}`
      );
      return res.status(200).json({ data: [slot] });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("validation")) {
          return res.status(400).json({ error: error.message });
        }
      }
      logger.error("Error al consumir stock:", error);
      return res.status(500).json({ error: "Error al consumir stock" });
    }
  }

  /**
   * Obtener slots con información completa
   */
  async getFullSlots(req: NextApiRequest, res: NextApiResponse) {
    try {
      const query = queryVendingMachineSlotSchema.parse(req.query);

      const filters: VendingMachineSlotFilters = {
        machine_id: query.machine_id,
        slot_number: query.slot_number,
        producto_id: query.producto_id,
        activo: query.activo,
        stock_bajo: query.stock_bajo,
        sin_producto: query.sin_producto,
      };

      const slots = await this.service.findFullSlots(filters);

      return res.status(200).json({ data: slots });
    } catch (error) {
      if (error instanceof Error && error.message.includes("validation")) {
        return res.status(400).json({ error: error.message });
      }
      logger.error("Error al obtener slots completos:", error);
      return res
        .status(500)
        .json({ error: "Error al obtener slots completos" });
    }
  }

  /**
   * Obtener slots con stock bajo
   */
  async getLowStock(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { machine_id } = req.query;

      const machineIdStr = machine_id ? String(machine_id) : undefined;

      const slots = await this.service.findLowStock(machineIdStr);

      return res.status(200).json({ data: slots });
    } catch (error) {
      logger.error("Error al obtener slots con stock bajo:", error);
      return res
        .status(500)
        .json({ error: "Error al obtener slots con stock bajo" });
    }
  }

  /**
   * Obtener resumen de stock de un slot
   */
  async getStockSummary(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "ID de slot es requerido" });
      }

      const summary = await this.service.getStockSummary(id);

      return res.status(200).json({ data: summary });
    } catch (error) {
      if (error instanceof Error && error.message.includes("no encontrado")) {
        return res.status(404).json({ error: error.message });
      }
      logger.error("Error al obtener resumen de stock:", error);
      return res
        .status(500)
        .json({ error: "Error al obtener resumen de stock" });
    }
  }

  /**
   * Vaciar slot
   */
  async vaciarSlot(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.body;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "ID de slot es requerido" });
      }

      const slot = await this.service.vaciarSlot(id);

      logger.info(`Slot ${id} vaciado exitosamente`);
      return res.status(200).json({ data: [slot] });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("no encontrado")) {
          return res.status(404).json({ error: error.message });
        }
        if (error.message.includes("reservadas")) {
          return res.status(409).json({ error: error.message });
        }
      }
      logger.error("Error al vaciar slot:", error);
      return res.status(500).json({ error: "Error al vaciar slot" });
    }
  }

  /**
   * Actualizar precio override
   */
  async updatePrecio(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id, precio_override } = req.body;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "ID de slot es requerido" });
      }

      const slot = await this.service.updatePrecio(id, precio_override);

      logger.info(`Precio actualizado para slot ${id}`);
      return res.status(200).json({ data: [slot] });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("no encontrado")) {
          return res.status(404).json({ error: error.message });
        }
        if (error.message.includes("mayor a 0")) {
          return res.status(400).json({ error: error.message });
        }
      }
      logger.error("Error al actualizar precio:", error);
      return res.status(500).json({ error: "Error al actualizar precio" });
    }
  }
}
