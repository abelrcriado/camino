/**
 * Controller para manejo de requests HTTP de ServiceAssignment
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { ServiceAssignmentService } from "../services/service_assignment.service";
import type {
  CreateServiceAssignmentDto,
  UpdateServiceAssignmentDto,
} from "../dto/service_assignment.dto";
import type { PaginationParams, SortParams } from "../types/common.types";

// Esquemas de validación Zod centralizados
import {
  createServiceAssignmentSchema,
  updateServiceAssignmentSchema,
  deleteServiceAssignmentSchema,
  queryServiceAssignmentSchema,
} from "../schemas/service_assignment.schema";
import { logger } from "../config/logger";

export class ServiceAssignmentController {
  private service: ServiceAssignmentService;

  constructor(service?: ServiceAssignmentService) {
    this.service = service || new ServiceAssignmentService();
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
            success: false,
            error: `Method ${req.method} Not Allowed`,
          });
      }
    } catch (error) {
      return this.handleError(error, res, startTime);
    }
  }

  /**
   * GET - Obtener asignaciones con filtros, paginación y ordenamiento
   */
  private async getAll(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    // Validar query params
    const validated = queryServiceAssignmentSchema.safeParse(req.query);
    if (!validated.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        success: false,
        error: "Parámetros de consulta inválidos",
        details: validated.error.format(),
      });
    }

    const {
      page,
      limit,
      service_id,
      service_point_id,
      is_active,
      priority_min,
      priority_max,
      sort_by,
      sort_order,
    } = validated.data;

    // Preparar filtros
    const filters = {
      service_id,
      service_point_id,
      is_active,
      priority_min,
      priority_max,
    };

    // Preparar paginación
    const pagination: PaginationParams = {
      page: page || 1,
      limit: limit || 50,
    };

    // Preparar ordenamiento
    const sort: SortParams = {
      field: sort_by || "priority",
      order: sort_order || "desc",
    };

    // Obtener asignaciones
    const result = await this.service.findAllAssignments(
      filters,
      pagination,
      sort
    );

    this.logRequest(req, 200, startTime);
    return res.status(200).json({
      data: result.data,
      pagination: result.pagination,
    });
  }

  /**
   * POST - Crear nueva asignación
   */
  private async create(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    // Validar body
    const validated = createServiceAssignmentSchema.safeParse(req.body);
    if (!validated.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        success: false,
        error: "Datos de asignación inválidos",
        details: validated.error.format(),
      });
    }

    const data: CreateServiceAssignmentDto = validated.data;

    try {
      const created = await this.service.createAssignment(data);

      this.logRequest(req, 201, startTime);
      return res.status(201).json({
        data: [created],
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Ya existe")) {
        this.logRequest(req, 409, startTime);
        return res.status(409).json({
          success: false,
          error: error.message,
        });
      }
      throw error;
    }
  }

  /**
   * PUT - Actualizar asignación existente
   */
  private async update(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    // Validar body
    const validated = updateServiceAssignmentSchema.safeParse(req.body);
    if (!validated.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        success: false,
        error: "Datos de actualización inválidos",
        details: validated.error.format(),
      });
    }

    const data: UpdateServiceAssignmentDto = validated.data;

    try {
      const updated = await this.service.updateAssignment(data);

      this.logRequest(req, 200, startTime);
      return res.status(200).json({
        data: [updated],
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("no encontrada")) {
          this.logRequest(req, 404, startTime);
          return res.status(404).json({
            success: false,
            error: error.message,
          });
        }
        if (error.message.includes("Ya existe")) {
          this.logRequest(req, 409, startTime);
          return res.status(409).json({
            success: false,
            error: error.message,
          });
        }
      }
      throw error;
    }
  }

  /**
   * DELETE - Eliminar (soft delete) asignación
   */
  private async delete(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    // Validar query params
    const validated = deleteServiceAssignmentSchema.safeParse(req.query);
    if (!validated.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        success: false,
        error: "ID de asignación inválido",
        details: validated.error.format(),
      });
    }

    const { id } = validated.data;

    try {
      await this.service.deleteAssignment(id);

      this.logRequest(req, 200, startTime);
      return res.status(200).json({
        message: `Asignación con id ${id} marcada como inactiva exitosamente`,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("no encontrada")) {
        this.logRequest(req, 404, startTime);
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }
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
    logger.error("Error en ServiceAssignmentController:", error);

    const duration = Date.now() - startTime;
    logger.error(`Request failed after ${duration}ms`);

    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: "Error interno del servidor",
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: "Error desconocido del servidor",
    });
  }

  /**
   * Log de requests
   */
  private logRequest(
    req: NextApiRequest,
    statusCode: number,
    startTime: number
  ): void {
    const duration = Date.now() - startTime;
    logger.info(`${req.method} ${req.url} - ${statusCode} - ${duration}ms`);
  }
}
