/**
 * Controller for Vending Transactions
 * Sistema de Historial de Ventas de Vending Machines
 * HTTP handling and validation layer
 */

import { NextApiRequest, NextApiResponse } from "next";
import { VendingTransactionService } from "../services/vending_transaction.service";
import {
  createVendingTransactionSchema,
  queryVendingTransactionsSchema,
  queryStatsSchema,
  queryStatsByMachineSchema,
  queryDashboardSchema,
  queryTrendSchema,
} from "../schemas/vending_transaction.schema";
import { validateUUID } from "../middlewares/validate-uuid";
import { ErrorMessages } from "../constants/error-messages";
import logger from "../config/logger";

export class VendingTransactionController {
  private service: VendingTransactionService;

  constructor(service?: VendingTransactionService) {
    this.service = service || new VendingTransactionService();
  }

  /**
   * Manejar todas las peticiones al endpoint
   */
  async handleRequest(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    try {
      switch (req.method) {
        case "GET":
          await this.handleGet(req, res);
          break;
        case "POST":
          await this.handlePost(req, res);
          break;
        default:
          res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
      }
    } catch (error: any) {
      logger.error("[VendingTransactionController Error]:", error);
      res.status(500).json({
        error: error.message || ErrorMessages.INTERNAL_ERROR,
      });
    }
  }

  /**
   * GET: Obtener transacciones con filtros
   */
  private async handleGet(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    try {
      // Validar query params
      const validatedQuery = queryVendingTransactionsSchema.parse(req.query);

      // Construir filtros
      const filters = {
        machine_id: validatedQuery.machine_id,
        slot_id: validatedQuery.slot_id,
        producto_id: validatedQuery.producto_id,
        metodo_pago: validatedQuery.metodo_pago,
        fecha_desde: validatedQuery.fecha_desde,
        fecha_hasta: validatedQuery.fecha_hasta,
        precio_min: validatedQuery.precio_min,
        precio_max: validatedQuery.precio_max,
      };

      // Parámetros de paginación
      const pagination = {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
      };

      // Obtener transacciones
      const result = await this.service.findFullTransactionsPaginated(
        filters,
        pagination
      );

      res.status(200).json(result);
    } catch (error: any) {
      if (error.name === "ZodError") {
        logger.error("[Validation Error]:", error.errors);
        res.status(400).json({
          error: ErrorMessages.VALIDATION_ERROR,
          details: error.errors,
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * POST: Crear transacción manualmente
   */
  private async handlePost(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    try {
      // Validar body
      const validatedBody = createVendingTransactionSchema.parse(req.body);

      // Validar UUIDs
      const slotError = validateUUID(validatedBody.slot_id, "slot");
      if (slotError) {
        res.status(400).json({ error: slotError });
        return;
      }

      const machineError = validateUUID(validatedBody.machine_id, "máquina");
      if (machineError) {
        res.status(400).json({ error: machineError });
        return;
      }

      const productError = validateUUID(validatedBody.producto_id, "producto");
      if (productError) {
        res.status(400).json({ error: productError });
        return;
      }

      // Crear transacción
      const transaction = await this.service.createTransaction({
        slot_id: validatedBody.slot_id,
        machine_id: validatedBody.machine_id,
        producto_id: validatedBody.producto_id,
        cantidad: validatedBody.cantidad,
        precio_unitario: validatedBody.precio_unitario,
        metodo_pago: validatedBody.metodo_pago,
        stock_antes: validatedBody.stock_antes,
        stock_despues: validatedBody.stock_despues,
      });

      res.status(201).json({ data: [transaction] });
    } catch (error: any) {
      if (error.name === "ZodError") {
        logger.error("[Validation Error]:", error.errors);
        res.status(400).json({
          error: ErrorMessages.VALIDATION_ERROR,
          details: error.errors,
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * Obtener estadísticas generales
   */
  async handleStats(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    try {
      if (req.method !== "GET") {
        res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
        return;
      }

      // Validar query params
      const validatedQuery = queryStatsSchema.parse(req.query);

      // Obtener estadísticas
      const stats = await this.service.getStats({
        period: validatedQuery.period,
        fecha_desde: validatedQuery.fecha_desde,
        fecha_hasta: validatedQuery.fecha_hasta,
        machine_id: validatedQuery.machine_id,
        producto_id: validatedQuery.producto_id,
        metodo_pago: validatedQuery.metodo_pago,
        top_limit: validatedQuery.top_limit,
      });

      res.status(200).json({ data: stats });
    } catch (error: any) {
      if (error.name === "ZodError") {
        logger.error("[Validation Error]:", error.errors);
        res.status(400).json({
          error: ErrorMessages.VALIDATION_ERROR,
          details: error.errors,
        });
      } else {
        logger.error("[VendingTransactionController Stats Error]:", error);
        res.status(500).json({
          error: error.message || ErrorMessages.INTERNAL_ERROR,
        });
      }
    }
  }

  /**
   * Obtener transacciones por máquina
   */
  async handleByMachine(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    try {
      if (req.method !== "GET") {
        res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
        return;
      }

      const { id } = req.query;

      // Validar UUID
      if (typeof id !== "string") {
        res.status(400).json({
          error: ErrorMessages.REQUIRED_ID("máquina"),
        });
        return;
      }

      const uuidError = validateUUID(id, "máquina");
      if (uuidError) {
        res.status(400).json({ error: uuidError });
        return;
      }

      // Parsear parámetros de paginación
      const page = req.query.page
        ? parseInt(req.query.page as string, 10)
        : 1;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 20;

      // Obtener transacciones
      const result = await this.service.findByMachinePaginated(id, {
        page,
        limit,
      });

      res.status(200).json(result);
    } catch (error: any) {
      logger.error("[VendingTransactionController ByMachine Error]:", error);
      res.status(500).json({
        error: error.message || ErrorMessages.INTERNAL_ERROR,
      });
    }
  }

  /**
   * Obtener estadísticas por máquina
   */
  async handleStatsByMachine(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    try {
      if (req.method !== "GET") {
        res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
        return;
      }

      const { id } = req.query;

      // Validar UUID
      if (typeof id !== "string") {
        res.status(400).json({
          error: ErrorMessages.REQUIRED_ID("máquina"),
        });
        return;
      }

      const uuidError = validateUUID(id, "máquina");
      if (uuidError) {
        res.status(400).json({ error: uuidError });
        return;
      }

      // Validar query params adicionales
      const validatedQuery = queryStatsByMachineSchema.parse({
        machine_id: id,
        ...req.query,
      });

      // Obtener estadísticas
      const stats = await this.service.getStatsByMachine(id, {
        period: validatedQuery.period,
        fecha_desde: validatedQuery.fecha_desde,
        fecha_hasta: validatedQuery.fecha_hasta,
        top_productos_limit: validatedQuery.top_productos_limit,
      });

      res.status(200).json({ data: stats });
    } catch (error: any) {
      if (error.name === "ZodError") {
        logger.error("[Validation Error]:", error.errors);
        res.status(400).json({
          error: ErrorMessages.VALIDATION_ERROR,
          details: error.errors,
        });
      } else {
        logger.error(
          "[VendingTransactionController StatsByMachine Error]:",
          error
        );
        res.status(500).json({
          error: error.message || ErrorMessages.INTERNAL_ERROR,
        });
      }
    }
  }

  /**
   * Obtener dashboard
   */
  async handleDashboard(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    try {
      if (req.method !== "GET") {
        res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
        return;
      }

      // Validar query params
      const validatedQuery = queryDashboardSchema.parse(req.query);

      // Obtener dashboard
      const dashboard = await this.service.getDashboard({
        period: validatedQuery.period,
        fecha_desde: validatedQuery.fecha_desde,
        fecha_hasta: validatedQuery.fecha_hasta,
        compare_previous: validatedQuery.compare_previous,
        top_productos_limit: validatedQuery.top_productos_limit,
        top_maquinas_limit: validatedQuery.top_maquinas_limit,
      });

      res.status(200).json({ data: dashboard });
    } catch (error: any) {
      if (error.name === "ZodError") {
        logger.error("[Validation Error]:", error.errors);
        res.status(400).json({
          error: ErrorMessages.VALIDATION_ERROR,
          details: error.errors,
        });
      } else {
        logger.error("[VendingTransactionController Dashboard Error]:", error);
        res.status(500).json({
          error: error.message || ErrorMessages.INTERNAL_ERROR,
        });
      }
    }
  }

  /**
   * Obtener tendencias
   */
  async handleTrend(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    try {
      if (req.method !== "GET") {
        res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
        return;
      }

      // Validar query params
      const validatedQuery = queryTrendSchema.parse(req.query);

      // Obtener tendencias
      const trend = await this.service.getTrend({
        fecha_desde: validatedQuery.fecha_desde,
        fecha_hasta: validatedQuery.fecha_hasta,
        granularity: validatedQuery.granularity,
        machine_id: validatedQuery.machine_id,
        producto_id: validatedQuery.producto_id,
      });

      res.status(200).json({ data: trend });
    } catch (error: any) {
      if (error.name === "ZodError") {
        logger.error("[Validation Error]:", error.errors);
        res.status(400).json({
          error: ErrorMessages.VALIDATION_ERROR,
          details: error.errors,
        });
      } else {
        logger.error("[VendingTransactionController Trend Error]:", error);
        res.status(500).json({
          error: error.message || ErrorMessages.INTERNAL_ERROR,
        });
      }
    }
  }
}
