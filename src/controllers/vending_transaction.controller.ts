/**
 * Controller Layer: VendingTransaction
 * HTTP request handling for vending transactions
 */

import logger from "@/config/logger";
import type { NextApiRequest, NextApiResponse } from "next";
import { VendingTransactionService } from "../services/vending_transaction.service";
import { VendingTransactionRepository } from "../repositories/vending_transaction.repository";
import type {
  CreateVendingTransactionDto,
  UpdateVendingTransactionDto,
  VendingTransactionFilters,
} from "../dto/vending_transaction.dto";
import { ErrorMessages } from "@/constants/error-messages";
import { validateUUID } from "@/middlewares/validate-uuid";

// Esquemas de validación Zod centralizados
import {
  createVendingTransactionSchema,
  updateVendingTransactionSchema,
  deleteVendingTransactionSchema,
  queryVendingTransactionsSchema,
  queryStatsSchema,
  queryStatsByPeriodSchema,
} from "../schemas/vending_transaction.schema";

export class VendingTransactionController {
  private service: VendingTransactionService;

  constructor(service?: VendingTransactionService) {
    this.service =
      service ||
      new VendingTransactionService(new VendingTransactionRepository());
  }

  /**
   * Handler principal que enruta según el método HTTP
   */
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
            error: ErrorMessages.METHOD_NOT_ALLOWED,
          });
      }
    } catch (error) {
      return this.handleError(error, res, startTime);
    }
  }

  /**
   * GET - Obtener transacciones con filtros y paginación
   */
  private async getAll(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const { action } = req.query;

    // === ACCIÓN: stats ===
    if (action === "stats") {
      const validation = queryStatsSchema.safeParse(req.query);

      if (!validation.success) {
        this.logRequest(req, 400, startTime);
        return res.status(400).json({
          error: "Errores de validación",
          details: validation.error.issues,
        });
      }

      const { machine_id, start_date, end_date, period } = validation.data;

      // Si se especifica period, usar método predefinido
      if (period) {
        const stats = await this.service.getStatsByPredefinedPeriod(
          period,
          machine_id
        );
        this.logRequest(req, 200, startTime);
        return res.status(200).json({ data: stats });
      }

      // Sino, usar filtros personalizados
      const filters: VendingTransactionFilters = {
        machine_id,
        start_date,
        end_date,
      };

      const stats = await this.service.getStats(filters);
      this.logRequest(req, 200, startTime);
      return res.status(200).json({ data: stats });
    }

    // === ACCIÓN: stats-by-period ===
    if (action === "stats-by-period") {
      const validation = queryStatsByPeriodSchema.safeParse(req.query);

      if (!validation.success) {
        this.logRequest(req, 400, startTime);
        return res.status(400).json({
          error: "Errores de validación",
          details: validation.error.issues,
        });
      }

      const { machine_id, start_date, end_date, group_by } = validation.data;

      const filters: VendingTransactionFilters = {
        machine_id,
        start_date,
        end_date,
      };

      const stats = await this.service.getStatsByPeriod(filters, group_by);
      this.logRequest(req, 200, startTime);
      return res.status(200).json({ data: stats });
    }

    // === QUERY NORMAL: Buscar transacciones ===
    const validation = queryVendingTransactionsSchema.safeParse(req.query);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const {
      machine_id,
      slot_id,
      producto_id,
      metodo_pago,
      start_date,
      end_date,
      precio_min,
      precio_max,
      page,
      limit,
    } = validation.data;

    const filters: VendingTransactionFilters = {
      machine_id,
      slot_id,
      producto_id,
      metodo_pago,
      start_date,
      end_date,
      precio_min,
      precio_max,
    };

    const result = await this.service.getTransactions(filters, page, limit);

    this.logRequest(req, 200, startTime);
    return res.status(200).json({
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.count,
        totalPages: Math.ceil(result.count / limit),
      },
    });
  }

  /**
   * POST - Crear nueva transacción
   */
  private async create(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const validation = createVendingTransactionSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const dto: CreateVendingTransactionDto = validation.data;
    const transaction = await this.service.createTransaction(dto);

    this.logRequest(req, 201, startTime);
    return res.status(201).json({ data: [transaction] });
  }

  /**
   * PUT - Actualizar transacción
   */
  private async update(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const validation = updateVendingTransactionSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const dto: UpdateVendingTransactionDto = validation.data;
    const transaction = await this.service.updateTransaction(dto);

    this.logRequest(req, 200, startTime);
    return res.status(200).json({ data: [transaction] });
  }

  /**
   * DELETE - Eliminar transacción
   */
  private async delete(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const validation = deleteVendingTransactionSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const { id } = validation.data;
    await this.service.deleteTransaction(id);

    this.logRequest(req, 200, startTime);
    return res.status(200).json({
      message: "Transacción eliminada exitosamente",
    });
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(
    error: unknown,
    res: NextApiResponse,
    startTime: number
  ): void {
    logger.error("[VendingTransactionController Error]:", error);

    if (error instanceof Error) {
      const statusCode =
        error.name === "NotFoundError"
          ? 404
          : error.name === "ValidationError"
            ? 400
            : error.name === "BusinessRuleError"
              ? 400
              : 500;

      logger.info(
        `[${new Date().toISOString()}] ERROR - Duration: ${Date.now() - startTime}ms - ${error.message}`
      );

      return res.status(statusCode).json({
        error: error.message,
      });
    }

    logger.info(
      `[${new Date().toISOString()}] ERROR - Duration: ${Date.now() - startTime}ms - Error desconocido`
    );

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }

  /**
   * Logging de requests
   */
  private logRequest(
    req: NextApiRequest,
    statusCode: number,
    startTime: number
  ): void {
    const duration = Date.now() - startTime;
    logger.info(
      `[${new Date().toISOString()}] ${req.method} ${req.url} - ${statusCode} - ${duration}ms`
    );
  }
}
