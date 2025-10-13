// Controller para Report
import logger from "@/config/logger";
import { NextApiRequest, NextApiResponse } from "next";
import { ReportService } from "../services/report.service";
import type { ReportFilters } from "../dto/report.dto";

// Schemas centralizados
import {
  createReportSchema,
  updateReportSchema,
  deleteReportSchema,
  queryReportSchema,
} from "../schemas/report.schema";

export class ReportController {
  private reportService: ReportService;

  constructor(service?: ReportService) {
    this.reportService = service || new ReportService();
  }

  /**
   * Manejador principal de la API
   */
  async handle(req: NextApiRequest, res: NextApiResponse) {
    try {
      switch (req.method) {
        case "GET":
          return await this.getReports(req, res);
        case "POST":
          return await this.createReport(req, res);
        case "PUT":
          return await this.updateReport(req, res);
        case "DELETE":
          return await this.deleteReport(req, res);
        default:
          return res.status(405).json({ error: "Método no permitido" });
      }
    } catch (error) {
      logger.error("Error en ReportController:", error);
      return res.status(500).json({
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  /**
   * GET /api/report
   */
  private async getReports(req: NextApiRequest, res: NextApiResponse) {
    try {
      // Validar parámetros de query con schema centralizado
      const queryValidation = queryReportSchema.safeParse(req.query);
      if (!queryValidation.success) {
        return res.status(400).json({
          error: "Parámetros de query inválidos",
          details: queryValidation.error.issues,
        });
      }

      const validatedQuery = queryValidation.data || {};
      const { id, page, limit } = req.query;

      // Si se solicita un ID específico
      if (id) {
        if (typeof id !== "string" || !this.isValidUUID(id)) {
          return res.status(400).json({ error: "ID inválido" });
        }
        const report = await this.reportService.findById(id);
        return res.status(200).json(report);
      }

      // Construir filtros usando datos validados
      const filters: ReportFilters = validatedQuery;

      // Usar métodos específicos si se proporciona un solo filtro
      if (validatedQuery.type && Object.keys(validatedQuery).length === 1) {
        const reports = await this.reportService.findByType(
          validatedQuery.type
        );
        return res.status(200).json(reports);
      }

      if (validatedQuery.status && Object.keys(validatedQuery).length === 1) {
        const reports = await this.reportService.findByStatus(
          validatedQuery.status
        );
        return res.status(200).json(reports);
      }

      if (validatedQuery.user_id && Object.keys(validatedQuery).length === 1) {
        const reports = await this.reportService.findByUser(
          validatedQuery.user_id
        );
        return res.status(200).json(reports);
      }

      if (
        validatedQuery.service_point_id &&
        Object.keys(validatedQuery).length === 1
      ) {
        const reports = await this.reportService.findByServicePoint(
          validatedQuery.service_point_id
        );
        return res.status(200).json(reports);
      }

      // Paginación
      const pageNum = page && typeof page === "string" ? parseInt(page) : 1;
      const limitNum =
        limit && typeof limit === "string" ? parseInt(limit) : 10;

      const reports = await this.reportService.findAll(filters, {
        page: pageNum,
        limit: limitNum,
      });
      return res.status(200).json(reports);
    } catch (error) {
      logger.error("Error al obtener reportes:", error);
      return res.status(500).json({
        error: "Error al obtener reportes",
        details: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  /**
   * POST /api/report
   */
  private async createReport(req: NextApiRequest, res: NextApiResponse) {
    try {
      const validation = createReportSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: "Errores de validación",
          details: validation.error.issues,
        });
      }

       
      const report = await this.reportService.createReport(
        validation.data as any
      ); // TODO: Alinear schema con DTO
      return res.status(201).json([report]);
    } catch (error) {
      logger.error("Error al crear reporte:", error);
      return res.status(500).json({
        error: "Error al crear reporte",
        details: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  /**
   * PUT /api/report
   */
  private async updateReport(req: NextApiRequest, res: NextApiResponse) {
    try {
      const validation = updateReportSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: "Errores de validación",
          details: validation.error.issues,
        });
      }

      const { id, ...updateData } = validation.data;

      if (!this.isValidUUID(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const report = await this.reportService.updateReport(id, updateData);
      return res.status(200).json([report]);
    } catch (error) {
      logger.error("Error al actualizar reporte:", error);
      return res.status(500).json({
        error: "Error al actualizar reporte",
        details: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  /**
   * DELETE /api/report
   */
  private async deleteReport(req: NextApiRequest, res: NextApiResponse) {
    try {
      const validation = deleteReportSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: "Errores de validación",
          details: validation.error.issues,
        });
      }

      const { id } = validation.data;
      await this.reportService.delete(id);
      return res
        .status(200)
        .json({ message: "Reporte eliminado correctamente" });
    } catch (error) {
      logger.error("Error al eliminar reporte:", error);
      return res.status(500).json({
        error: "Error al eliminar reporte",
        details: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  /**
   * Validar formato UUID
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}
