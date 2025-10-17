// Controller para manejo de requests HTTP de CSP
import type { NextApiRequest, NextApiResponse } from "next";
import { CSPService } from "../services/csp.service";
import { validateAndRespond } from "@/shared/utils/zodValidation";
import {
  createCSPSchema,
  updateCSPSchema,
  deleteCSPSchema,
  queryCSPSchema,
} from "../schemas/csp.schema";
import type { CSPFilters, CreateCSPDto, UpdateCSPDto } from "@/shared/dto/csp.dto";
import logger from "@/config/logger";

export class CSPController {
  private service: CSPService;

  constructor(service?: CSPService) {
    this.service = service || new CSPService();
  }

  /**
   * Maneja todas las requests del endpoint /api/csp
   */
  async handle(req: NextApiRequest, res: NextApiResponse) {
    const correlationId =
      (req as NextApiRequest & { correlationId?: string }).correlationId ||
      "unknown";
    const startTime = Date.now();

    try {
      switch (req.method) {
        case "GET":
          return await this.getAll(req, res, correlationId, startTime);
        case "POST":
          return await this.create(req, res, correlationId, startTime);
        case "PUT":
          return await this.update(req, res, correlationId, startTime);
        case "DELETE":
          return await this.delete(req, res, correlationId, startTime);
        default:
          logger.warn("Invalid HTTP method", {
            correlationId,
            method: req.method,
          });
          return res.status(405).json({ error: "Method not allowed" });
      }
    } catch (error) {
      logger.error("Unhandled error in CSP controller", {
        correlationId,
        error: (error as Error).message,
        responseTime: `${Date.now() - startTime}ms`,
      });
      return res.status(500).json({
        error: "Internal server error",
        message: (error as Error).message,
      });
    }
  }

  /**
   * GET - Obtener todos los CSPs
   */
  private async getAll(
    req: NextApiRequest,
    res: NextApiResponse,
    correlationId: string,
    startTime: number
  ) {
    // Cache: Los CSPs cambian raramente, cachear 5 minutos
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );

    // Validar query parameters con Zod
    const validation = queryCSPSchema.safeParse(req.query);

    if (!validation.success) {
      logger.warn("GET /api/csp - Invalid query parameters", {
        correlationId,
        errors: validation.error.issues,
      });
      return res.status(400).json({
        error: "Errores de validación en parámetros de búsqueda",
        details: validation.error.issues,
      });
    }

    // Extraer parámetros validados y de paginación
    const { page = "1", limit = "10", status, ...otherFilters } = req.query;
    const queryFilters = validation.data || {};

    // Validar status si está presente
    if (
      status &&
      !["active", "inactive", "maintenance"].includes(status as string)
    ) {
      logger.warn("GET /api/csp - Invalid status value", {
        correlationId,
        status,
      });
      return res.status(400).json({ error: "Invalid status value" });
    }

    // Construir filtros combinando datos validados con otros filtros
    const filters: CSPFilters = {
      ...queryFilters,
      ...otherFilters,
    };
    if (status) filters.status = status as "online" | "offline" | "maintenance";

    // Construir paginación
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));

    logger.info("GET /api/csp - Fetching CSPs", {
      correlationId,
      filters,
      pagination: { page: pageNum, limit: limitNum },
    });

    try {
      const result = await this.service.findAllCSPs(filters, {
        page: pageNum,
        limit: limitNum,
      });

      logger.info("GET /api/csp - Success", {
        correlationId,
        recordCount: result.data.length,
        totalRecords: result.pagination.total,
        responseTime: `${Date.now() - startTime}ms`,
      });

      return res.status(200).json(result);
    } catch (error) {
      logger.error("GET /api/csp - Error", {
        correlationId,
        error: (error as Error).message,
        responseTime: `${Date.now() - startTime}ms`,
      });
      return res.status(500).json({ error: (error as Error).message });
    }
  }

  /**
   * POST - Crear nuevo CSP
   */
  private async create(
    req: NextApiRequest,
    res: NextApiResponse,
    correlationId: string,
    startTime: number
  ) {
    // Validar datos con Zod
    const validatedData = validateAndRespond(createCSPSchema, req.body, res);
    if (!validatedData) {
      return;
    }

    logger.info("POST /api/csp - Creating CSP", {
      correlationId,
      name: validatedData.name,
      city: validatedData.city,
    });

    try {
      const created = await this.service.createCSP(
        validatedData as unknown as CreateCSPDto
      );

      logger.info("POST /api/csp - Success", {
        correlationId,
        cspId: created.id,
        responseTime: `${Date.now() - startTime}ms`,
      });

      return res.status(201).json(created);
    } catch (error) {
      logger.error("POST /api/csp - Error", {
        correlationId,
        error: (error as Error).message,
        responseTime: `${Date.now() - startTime}ms`,
      });
      return res.status(500).json({ error: (error as Error).message });
    }
  }

  /**
   * PUT - Actualizar CSP
   */
  private async update(
    req: NextApiRequest,
    res: NextApiResponse,
    correlationId: string,
    startTime: number
  ) {
    // Validar datos con Zod
    const validatedData = validateAndRespond(updateCSPSchema, req.body, res);
    if (!validatedData) {
      return;
    }

    logger.info("POST /api/csp - Updating CSP", {
      correlationId,
      cspId: validatedData.id,
    });

    try {
      const updated = await this.service.updateCSP(
        validatedData as unknown as UpdateCSPDto
      );

      logger.info("PUT /api/csp - Success", {
        correlationId,
        cspId: updated.id,
        responseTime: `${Date.now() - startTime}ms`,
      });

      return res.status(200).json(updated);
    } catch (error) {
      logger.error("PUT /api/csp - Error", {
        correlationId,
        error: (error as Error).message,
        responseTime: `${Date.now() - startTime}ms`,
      });
      return res.status(500).json({ error: (error as Error).message });
    }
  }

  /**
   * DELETE - Eliminar CSP
   */
  private async delete(
    req: NextApiRequest,
    res: NextApiResponse,
    correlationId: string,
    startTime: number
  ) {
    // Validar datos con Zod
    const validatedData = validateAndRespond(deleteCSPSchema, req.body, res);
    if (!validatedData) {
      return;
    }

    logger.info("DELETE /api/csp - Deleting CSP", {
      correlationId,
      cspId: validatedData.id,
    });

    try {
      await this.service.deleteCSP(validatedData.id);

      logger.info("DELETE /api/csp - Success", {
        correlationId,
        cspId: validatedData.id,
        responseTime: `${Date.now() - startTime}ms`,
      });

      return res.status(204).end();
    } catch (error) {
      logger.error("DELETE /api/csp - Error", {
        correlationId,
        error: (error as Error).message,
        responseTime: `${Date.now() - startTime}ms`,
      });
      return res.status(500).json({ error: (error as Error).message });
    }
  }
}
