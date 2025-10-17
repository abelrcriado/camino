// Controller para manejo de requests HTTP de Review
import logger from "@/config/logger";
import type { NextApiRequest, NextApiResponse } from "next";
import { ReviewService } from "../services/review.service";
import type { CreateReviewDto, UpdateReviewDto } from "@/shared/dto/review.dto";

// Esquemas de validación Zod centralizados
import {
  createReviewSchema,
  updateReviewSchema,
  deleteReviewSchema,
  queryReviewSchema,
} from "../schemas/review.schema";

export class ReviewController {
  private service: ReviewService;

  constructor(service?: ReviewService) {
    this.service = service || new ReviewService();
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
            error: `Method ${req.method} Not Allowed`,
          });
      }
    } catch (error) {
      return this.handleError(error, res, startTime);
    }
  }

  /**
   * GET - Obtener reviews con filtros
   */
  private async getAll(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    // Validar query parameters con Zod
    const validation = queryReviewSchema.safeParse(req.query);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación en parámetros de búsqueda",
        details: validation.error.issues,
      });
    }

    const filters = validation.data || {};
    const { user_id, service_point_id, workshop_id, rating } = filters;

    // Si hay filtro de user_id
    if (user_id) {
      const reviews = await this.service.findByUser(user_id);
      this.logRequest(req, 200, startTime);
      return res.status(200).json(reviews);
    }

    // Si hay filtro de service_point_id
    if (service_point_id) {
      const reviews = await this.service.findByServicePoint(service_point_id);
      this.logRequest(req, 200, startTime);
      return res.status(200).json(reviews);
    }

    // Si hay filtro de workshop_id
    if (workshop_id) {
      const reviews = await this.service.findByWorkshop(workshop_id);
      this.logRequest(req, 200, startTime);
      return res.status(200).json(reviews);
    }

    // Si hay filtro de rating
    if (rating) {
      const reviews = await this.service.findByRating(rating);
      this.logRequest(req, 200, startTime);
      return res.status(200).json(reviews);
    }

    // Sin filtros, devolver todos
    const result = await this.service.findAll();

    this.logRequest(req, 200, startTime);
    return res.status(200).json(result.data);
  }

  /**
   * POST - Crear nueva review
   */
  private async create(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    // Validar datos con Zod
    const validation = createReviewSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const data: CreateReviewDto = validation.data;
    const review = await this.service.createReview(data);

    this.logRequest(req, 201, startTime);
    return res.status(201).json([review]);
  }

  /**
   * PUT - Actualizar review
   */
  private async update(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    // Validar datos completos con Zod
    const validation = updateReviewSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const data: UpdateReviewDto = validation.data;
    const review = await this.service.updateReview(data);

    this.logRequest(req, 200, startTime);
    return res.status(200).json([review]);
  }

  /**
   * DELETE - Eliminar review
   */
  private async delete(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    // Validar datos con Zod
    const validation = deleteReviewSchema.safeParse(req.body);

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
    return res.status(204).end();
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(
    error: unknown,
    res: NextApiResponse,
    startTime: number
  ): void {
    logger.error("[ReviewController Error]:", error);

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

  /**
   * Logger de requests
   */
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
