// ============================================================================
// Sprint 7: Alerts System - Controller Layer
// ============================================================================

import { NextApiRequest, NextApiResponse } from "next";
import logger from "@/config/logger";
import { AlertService } from "@/services/alert.service";
import { ErrorMessages } from "@/constants/error-messages";
import { validateUUID } from "@/middlewares/validate-uuid";

// Esquemas de validación Zod centralizados
import {
  createAlertSchema,
  updateAlertSchema,
  deleteAlertSchema,
  queryAlertSchema,
} from "@/schemas/alert.schema";

export class AlertController {
  private service: AlertService;

  constructor(service?: AlertService) {
    this.service = service || new AlertService();
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
   * GET - Obtener alertas con filtros y paginación
   */
  private async getAll(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    try {
      // Validar query params con Zod
      const validatedQuery = queryAlertSchema.parse(req.query);

      const {
        page = 1,
        limit = 10,
        tipo,
        severidad,
        leida,
        accion_requerida,
        entidad_tipo,
        entidad_id,
      } = validatedQuery;

      const filters = {
        tipo,
        severidad,
        leida,
        accion_requerida,
        entidad_tipo,
        entidad_id,
      };

      const pagination = { page, limit };
      const result = await this.service.findAll(filters, pagination);

      const duration = Date.now() - startTime;
      logger.info(
        `[AlertController] GET ${req.url} - 200 (${duration}ms) - Found ${result.data.length} alerts`
      );

      return res.status(200).json({
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST - Crear nueva alerta
   */
  private async create(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    try {
      // Validar body con Zod
      const validatedData = createAlertSchema.parse(req.body);

      const alert = await this.service.createAlert(validatedData);

      const duration = Date.now() - startTime;
      logger.info(
        `[AlertController] POST ${req.url} - 201 (${duration}ms) - Created alert ${alert.id}`
      );

      return res.status(201).json({
        data: [alert],
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * PUT - Actualizar alerta
   */
  private async update(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    try {
      // Validar body con Zod
      const validatedData = updateAlertSchema.parse(req.body);
      const { id, ...updateData } = validatedData;

      // Validar UUID
      const uuidError = validateUUID(id, "alerta");
      if (uuidError) {
        return res.status(400).json({ error: uuidError });
      }

      const alert = await this.service.update(id, updateData);

      const duration = Date.now() - startTime;
      logger.info(
        `[AlertController] PUT ${req.url} - 200 (${duration}ms) - Updated alert ${id}`
      );

      return res.status(200).json({
        data: [alert],
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * DELETE - Eliminar alerta
   */
  private async delete(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    try {
      // Validar body con Zod
      const validatedData = deleteAlertSchema.parse(req.body);
      const { id } = validatedData;

      // Validar UUID
      const uuidError = validateUUID(id, "alerta");
      if (uuidError) {
        return res.status(400).json({ error: uuidError });
      }

      await this.service.delete(id);

      const duration = Date.now() - startTime;
      logger.info(
        `[AlertController] DELETE ${req.url} - 200 (${duration}ms) - Deleted alert ${id}`
      );

      return res.status(200).json({
        message: "Alerta eliminada exitosamente",
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(
    error: unknown,
    res: NextApiResponse,
    startTime: number
  ): void {
    const duration = Date.now() - startTime;

    if (error instanceof Error) {
      logger.error(`[AlertController Error]:`, {
        message: error.message,
        stack: error.stack,
      });

      // Zod validation errors
      if (error.name === "ZodError") {
        return res.status(400).json({
          error: "Error de validación",
          details: error,
        });
      }

      logger.info(`[AlertController] ERROR - Duration: ${duration}ms - ${error.message}`);

      return res.status(500).json({
        error: error.message || "Error interno del servidor",
      });
    }

    logger.error(`[AlertController Error]: Unknown error`, { error });
    logger.info(`[AlertController] ERROR - Duration: ${duration}ms - Unknown error`);

    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}
