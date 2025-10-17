// Controller para manejo de requests HTTP de Taller Manager
import logger from "@/config/logger";
import type { NextApiRequest, NextApiResponse } from "next";
import { TallerManagerService } from "../services/taller_manager.service";
import type {
  CreateTallerManagerDto,
  UpdateTallerManagerDto,
} from "@/shared/dto/taller_manager.dto";
import {
  createTallerManagerSchema,
  updateTallerManagerSchema,
  deleteTallerManagerSchema,
  queryTallerManagerSchema,
} from "../schemas/taller_manager.schema";

export class TallerManagerController {
  private service: TallerManagerService;

  constructor(service?: TallerManagerService) {
    this.service = service || new TallerManagerService();
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
    const queryValidation = queryTallerManagerSchema?.safeParse(req.query);
    if (queryValidation && !queryValidation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Parámetros de consulta inválidos",
        details: queryValidation.error.issues,
      });
    }

    const { workshop_id, user_id } = req.query;

    if (workshop_id && typeof workshop_id === "string") {
      const managers = await this.service.findByWorkshop(workshop_id);
      this.logRequest(req, 200, startTime);
      return res.status(200).json(managers);
    }

    if (user_id && typeof user_id === "string") {
      const managers = await this.service.findByUser(user_id);
      this.logRequest(req, 200, startTime);
      return res.status(200).json(managers);
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
    const validation = createTallerManagerSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const data: CreateTallerManagerDto =
      validation.data as CreateTallerManagerDto;
    const manager = await this.service.createTallerManager(data);

    this.logRequest(req, 201, startTime);
    return res.status(201).json([manager]);
  }

  private async update(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const validation = updateTallerManagerSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const data: UpdateTallerManagerDto =
      validation.data as UpdateTallerManagerDto;
    const manager = await this.service.updateTallerManager(data);

    this.logRequest(req, 200, startTime);
    return res.status(200).json([manager]);
  }

  private async delete(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const validation = deleteTallerManagerSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    await this.service.delete(validation.data.id);

    this.logRequest(req, 200, startTime);
    return res.status(200).json({
      message: "Gestor de taller eliminado exitosamente",
    });
  }

  private handleError(
    error: unknown,
    res: NextApiResponse,
    startTime: number
  ): void {
    logger.error("[TallerManagerController Error]:", error);

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
