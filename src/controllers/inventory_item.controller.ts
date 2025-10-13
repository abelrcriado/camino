// Controller para manejo de requests HTTP de Inventory Items
import logger from "@/config/logger";
import type { NextApiRequest, NextApiResponse } from "next";
import { InventoryItemService } from "../services/inventory_item.service";
import type {
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
} from "../dto/inventory_item.dto";
import {
  createInventoryItemSchema,
  updateInventoryItemSchema,
  deleteInventoryItemSchema,
  queryInventoryItemSchema,
} from "../schemas/inventory_items.schema";

export class InventoryItemController {
  private service: InventoryItemService;

  constructor(service?: InventoryItemService) {
    this.service = service || new InventoryItemService();
  }

  async handle(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const startTime = Date.now();

    try {
      switch (req.method) {
        case "GET":
          return await this.getAll(req, res, startTime);
        case "POST":
          return await this.create(req, res, startTime);
        case "PUT":
          return await this.update(req, res, startTime);
        case "DELETE":
          return await this.delete(req, res, startTime);
        default:
          res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
          return res.status(405).json({
            error: `Method ${req.method} Not Allowed`,
          });
      }
    } catch (error) {
      return this.handleError(error, res, startTime);
    }
  }

  private async getAll(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    // Validar parámetros de query
    const queryValidation = queryInventoryItemSchema.safeParse(req.query);
    if (!queryValidation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Parámetros de query inválidos",
        details: queryValidation.error.issues,
      });
    }

    const { inventory_id, type } = queryValidation.data || {};

    if (inventory_id && typeof inventory_id === "string") {
      const items = await this.service.findByInventory(inventory_id);
      this.logRequest(req, 200, startTime);
      return res.status(200).json(items);
    }

    if (type && typeof type === "string") {
      const items = await this.service.findByType(type);
      this.logRequest(req, 200, startTime);
      return res.status(200).json(items);
    }

    const result = await this.service.findAll();
    this.logRequest(req, 200, startTime);
    return res.status(200).json(result.data);
  }

  private async create(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const validation = createInventoryItemSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const data: CreateInventoryItemDto = validation.data;
    const item = await this.service.createInventoryItem(data);

    this.logRequest(req, 201, startTime);
    return res.status(201).json([item]);
  }

  private async update(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const validation = updateInventoryItemSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const data: UpdateInventoryItemDto = validation.data;
    const item = await this.service.updateInventoryItem(data);

    this.logRequest(req, 200, startTime);
    return res.status(200).json([item]);
  }

  private async delete(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const validation = deleteInventoryItemSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const { id } = validation.data;
    await this.service.delete(id);

    this.logRequest(req, 200, startTime);
    return res.status(200).json({
      message: "Item de inventario eliminado exitosamente",
    });
  }

  private handleError(
    error: unknown,
    res: NextApiResponse,
    startTime: number
  ): void {
    logger.error("[InventoryItemController Error]:", error);

    const duration = Date.now() - startTime;
    logger.info(
      `[${new Date().toISOString()}] ERROR - Duration: ${duration}ms - ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }

      if (error.message.includes("validación")) {
        return res.status(400).json({ error: error.message });
      }
    }

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }

  private logRequest(
    req: NextApiRequest,
    statusCode: number,
    startTime: number
  ): void {
    const duration = Date.now() - startTime;
    logger.info(
      `[${new Date().toISOString()}] ${req.method} ${
        req.url
      } - ${statusCode} - ${duration}ms`
    );
  }
}
