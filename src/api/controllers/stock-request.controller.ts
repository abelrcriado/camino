import type { NextApiRequest, NextApiResponse } from "next";
import logger from "@/config/logger";
import {
  stockRequestService,
  type CreateStockRequestInput,
  type StockRequestListFilters,
} from "@/api/services/stock-request.service";
import type {
  StockRequestPriority,
  StockRequestStatus,
} from "@/api/repositories/stock-request.repository";

export class StockRequestController {
  /**
   * POST /api/stock-requests - Crear nuevo pedido de stock
   */
  async create(req: NextApiRequest, res: NextApiResponse) {
    try {
      const input: CreateStockRequestInput = {
        fromWarehouseId: req.body.from_warehouse_id,
        toWarehouseId: req.body.to_warehouse_id,
        productId: req.body.product_id,
        quantityRequested: req.body.quantity_requested,
        requestedBy: req.body.requested_by,
        priority: req.body.priority as StockRequestPriority,
        notes: req.body.notes,
      };

      const result = await stockRequestService.createRequest(input);

      if (!result.success) {
        return res.status(400).json({
          error: result.error || "Error al crear el pedido de stock",
        });
      }

      return res.status(201).json({
        message: "Pedido de stock creado exitosamente",
        data: result.data,
      });
    } catch (error) {
      logger.error("Error in create stock request:", error);
      return res.status(500).json({
        error: "Error interno del servidor",
      });
    }
  }

  /**
   * GET /api/stock-requests/:id - Obtener pedido por ID
   */
  async getById(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "ID inválido" });
      }

      const result = await stockRequestService.getRequestById(id);

      if (!result.success) {
        return res.status(404).json({ error: result.error });
      }

      return res.status(200).json({ data: result.data });
    } catch (error) {
      logger.error("Error in getById stock request:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * GET /api/stock-requests?... - Listar pedidos con filtros
   */
  async list(req: NextApiRequest, res: NextApiResponse) {
    try {
      const filters: StockRequestListFilters = {};

      // Status (puede ser array o string único)
      if (req.query.status) {
        const statusParam = req.query.status;
        if (Array.isArray(statusParam)) {
          filters.status = statusParam as StockRequestStatus[];
        } else if (typeof statusParam === "string") {
          // Si contiene comas, dividir en array
          if (statusParam.includes(",")) {
            filters.status = statusParam.split(",") as StockRequestStatus[];
          } else {
            filters.status = statusParam as StockRequestStatus;
          }
        }
      }

      // Priority
      if (req.query.priority && typeof req.query.priority === "string") {
        filters.priority = req.query.priority as StockRequestPriority;
      }

      // Warehouse filters
      if (
        req.query.from_warehouse_id &&
        typeof req.query.from_warehouse_id === "string"
      ) {
        filters.fromWarehouseId = req.query.from_warehouse_id;
      }

      if (
        req.query.to_warehouse_id &&
        typeof req.query.to_warehouse_id === "string"
      ) {
        filters.toWarehouseId = req.query.to_warehouse_id;
      }

      // Product filter
      if (req.query.product_id && typeof req.query.product_id === "string") {
        filters.productId = req.query.product_id;
      }

      // Location filter
      if (req.query.location_id && typeof req.query.location_id === "string") {
        filters.locationId = req.query.location_id;
      }

      // Date filters
      if (req.query.from_date && typeof req.query.from_date === "string") {
        filters.fromDate = req.query.from_date;
      }

      if (req.query.to_date && typeof req.query.to_date === "string") {
        filters.toDate = req.query.to_date;
      }

      const result = await stockRequestService.listRequests(filters);

      return res.status(200).json({
        data: result.data || [],
        count: result.data?.length || 0,
      });
    } catch (error) {
      logger.error("Error in list stock requests:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * PUT /api/stock-requests/:id/prepare - Marcar como "preparando"
   */
  async markAsPreparing(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "ID inválido" });
      }

      const result = await stockRequestService.markAsPreparing(id);

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      return res.status(200).json({
        message: "Pedido marcado como preparando",
        data: result.data,
      });
    } catch (error) {
      logger.error("Error in markAsPreparing:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * PUT /api/stock-requests/:id/ship - Enviar pedido
   */
  async ship(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;
      const { shipped_by } = req.body;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "ID inválido" });
      }

      const result = await stockRequestService.shipRequest(id, shipped_by);

      if (!result.success || !("data" in result)) {
        return res
          .status(400)
          .json({
            error: "error" in result ? result.error : "Error al enviar pedido",
          });
      }

      return res.status(200).json({
        message: "Pedido enviado. Stock descontado del origen.",
        data: result.data,
      });
    } catch (error) {
      logger.error("Error in ship:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * PUT /api/stock-requests/:id/deliver - Marcar como entregado
   */
  async markAsDelivered(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;
      const { delivered_by } = req.body;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "ID inválido" });
      }

      const result = await stockRequestService.markAsDelivered(
        id,
        delivered_by
      );

      if (!result.success || !("data" in result)) {
        return res
          .status(400)
          .json({
            error:
              "error" in result
                ? result.error
                : "Error al marcar como entregado",
          });
      }

      return res.status(200).json({
        message: "Pedido marcado como entregado",
        data: result.data,
      });
    } catch (error) {
      logger.error("Error in markAsDelivered:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * PUT /api/stock-requests/:id/consolidate - Consolidar stock
   */
  async consolidate(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;
      const { delivered_by } = req.body;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "ID inválido" });
      }

      const result = await stockRequestService.consolidateRequest(
        id,
        delivered_by
      );

      if (!result.success || !("data" in result)) {
        return res
          .status(400)
          .json({
            error:
              "error" in result ? result.error : "Error al consolidar stock",
          });
      }

      return res.status(200).json({
        message: "Stock consolidado exitosamente en el destino",
        data: result.data,
      });
    } catch (error) {
      logger.error("Error in consolidate:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * PUT /api/stock-requests/:id/cancel - Cancelar pedido
   */
  async cancel(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;
      const { reason } = req.body;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "ID inválido" });
      }

      if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
        return res
          .status(400)
          .json({ error: "Debe proporcionar un motivo de cancelación" });
      }

      const result = await stockRequestService.cancelRequest(id, reason);

      if (!result.success || !("data" in result)) {
        return res
          .status(400)
          .json({
            error: "error" in result ? result.error : "Error al cancelar",
          });
      }

      return res.status(200).json({
        message: "Pedido cancelado",
        data: result.data,
      });
    } catch (error) {
      logger.error("Error in cancel:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * GET /api/stock-requests/requiring-action - Obtener pedidos que requieren acción
   */
  async getRequiringAction(req: NextApiRequest, res: NextApiResponse) {
    try {
      const result = await stockRequestService.getRequiringAction();

      return res.status(200).json({
        data: result.data || [],
        count: result.data?.length || 0,
      });
    } catch (error) {
      logger.error("Error in getRequiringAction:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * GET /api/stock-requests/in-transit - Obtener pedidos en tránsito
   */
  async getInTransit(req: NextApiRequest, res: NextApiResponse) {
    try {
      const result = await stockRequestService.getInTransit();

      return res.status(200).json({
        data: result.data || [],
        count: result.data?.length || 0,
      });
    } catch (error) {
      logger.error("Error in getInTransit:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * GET /api/stock-requests/stats - Obtener estadísticas
   */
  async getStats(req: NextApiRequest, res: NextApiResponse) {
    try {
      const filters: any = {};

      if (
        req.query.warehouse_id &&
        typeof req.query.warehouse_id === "string"
      ) {
        filters.warehouseId = req.query.warehouse_id;
      }

      if (req.query.from_date && typeof req.query.from_date === "string") {
        filters.fromDate = req.query.from_date;
      }

      if (req.query.to_date && typeof req.query.to_date === "string") {
        filters.toDate = req.query.to_date;
      }

      const result = await stockRequestService.getStats(filters);

      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      return res.status(200).json({ data: result.data });
    } catch (error) {
      logger.error("Error in getStats:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * POST /api/stock-requests/:id/process - Workflow helper
   */
  async processWorkflow(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;
      const { action, user_id } = req.body;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "ID inválido" });
      }

      if (!["prepare", "ship", "deliver", "consolidate"].includes(action)) {
        return res.status(400).json({
          error:
            "Acción inválida. Debe ser: prepare, ship, deliver o consolidate",
        });
      }

      const result = await stockRequestService.processRequestWorkflow(
        id,
        action,
        user_id
      );

      if (!result.success || !("data" in result)) {
        return res
          .status(400)
          .json({
            error:
              "error" in result ? result.error : "Error al procesar acción",
          });
      }

      return res.status(200).json({
        message: `Acción '${action}' ejecutada exitosamente`,
        data: result.data,
      });
    } catch (error) {
      logger.error("Error in processWorkflow:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}

export const stockRequestController = new StockRequestController();
