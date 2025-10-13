// Controller para manejo de requests HTTP de Workshop
import logger from "@/config/logger";
import type { NextApiRequest, NextApiResponse } from "next";
import { WorkshopService } from "../services/workshop.service";
import type { CreateWorkshopDto, UpdateWorkshopDto } from "../dto/workshop.dto";
import {
  createWorkshopSchema,
  updateWorkshopSchema,
  deleteWorkshopSchema,
  queryWorkshopSchema,
} from "../schemas/workshop.schema";

export class WorkshopController {
  private service: WorkshopService;

  constructor(service?: WorkshopService) {
    this.service = service || new WorkshopService();
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
    // Validar query parameters usando schema centralizado
    const queryValidation = queryWorkshopSchema.safeParse(req.query);

    if (!queryValidation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Parámetros de query inválidos",
        details: queryValidation.error.issues,
      });
    }

    const { service_point_id } = queryValidation.data || {};

    if (service_point_id) {
      const workshops = await this.service.findByServicePoint(service_point_id);
      this.logRequest(req, 200, startTime);
      return res.status(200).json(workshops);
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
    const validation = createWorkshopSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const data: CreateWorkshopDto = validation.data;
    const workshop = await this.service.createWorkshop(data);

    this.logRequest(req, 201, startTime);
    return res.status(201).json([workshop]);
  }

  private async update(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const validation = updateWorkshopSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const data: UpdateWorkshopDto = validation.data;
    const workshop = await this.service.updateWorkshop(data);

    this.logRequest(req, 200, startTime);
    return res.status(200).json([workshop]);
  }

  private async delete(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const validation = deleteWorkshopSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const { id } = validation.data;

    await this.service.delete(id);

    this.logRequest(req, 204, startTime);
    res.status(204).end();
  }

  private handleError(
    error: unknown,
    res: NextApiResponse,
    startTime: number
  ): void {
    logger.error("[WorkshopController Error]:", error);

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
