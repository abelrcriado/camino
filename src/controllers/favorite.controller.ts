// Controller para manejo de requests HTTP de Favorite
import type { NextApiRequest, NextApiResponse } from "next";
import { FavoriteService } from "../services/favorite.service";
import type { CreateFavoriteDto, UpdateFavoriteDto } from "../dto/favorite.dto";

// Esquemas de validación Zod centralizados
import {
  createFavoriteSchema,
  updateFavoriteSchema,
  deleteFavoriteSchema,
  queryFavoriteSchema,
} from "../schemas/favorite.schema";

export class FavoriteController {
  private service: FavoriteService;

  constructor(service?: FavoriteService) {
    this.service = service || new FavoriteService();
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
   * GET - Obtener favoritos con filtros
   */
  private async getAll(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    // Validar query parameters con Zod
    const validation = queryFavoriteSchema.safeParse(req.query);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación en parámetros de búsqueda",
        details: validation.error.issues,
      });
    }

    const filters = validation.data || {};
    const { user_id, service_point_id } = filters;

    // Si hay filtro de user_id
    if (user_id) {
      const favorites = await this.service.findByUser(user_id);
      this.logRequest(req, 200, startTime);
      return res.status(200).json(favorites);
    }

    // Si hay filtro de service_point_id
    if (service_point_id) {
      const favorites = await this.service.findByServicePoint(service_point_id);
      this.logRequest(req, 200, startTime);
      return res.status(200).json(favorites);
    }

    // Sin filtros, devolver todos
    const result = await this.service.findAll();

    this.logRequest(req, 200, startTime);
    return res.status(200).json(result.data);
  }

  /**
   * POST - Crear nuevo favorito
   */
  private async create(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    // Validar datos con Zod
    const validation = createFavoriteSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const favoriteData = validation.data as unknown as CreateFavoriteDto;
    const favorite = await this.service.createFavorite(favoriteData);

    this.logRequest(req, 201, startTime);
    return res.status(201).json([favorite]);
  }

  /**
   * PUT - Actualizar favorito existente
   */
  private async update(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    // Validar datos completos con Zod
    const validation = updateFavoriteSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const updateData = validation.data as unknown as UpdateFavoriteDto;
    const favorite = await this.service.updateFavorite(updateData);

    this.logRequest(req, 200, startTime);
    return res.status(200).json([favorite]);
  }

  /**
   * DELETE - Eliminar favorito
   */
  private async delete(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    // Validar datos con Zod
    const validation = deleteFavoriteSchema.safeParse(req.body);

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

  /**
   * Manejo de errores centralizado
   */
  private handleError(
    error: unknown,
    res: NextApiResponse,
    startTime: number
  ): void {
    console.error("[FavoriteController] Error:", error);

    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.log(
      JSON.stringify({
        level: "error",
        message: errorMessage,
        duration,
        timestamp: new Date().toISOString(),
      })
    );

    if (errorMessage.includes("not found")) {
      return res.status(404).json({
        error: errorMessage,
      });
    }

    if (
      errorMessage.includes("Validation") ||
      errorMessage.includes("Invalid") ||
      errorMessage.includes("already exists") ||
      errorMessage.includes("must be")
    ) {
      return res.status(400).json({
        error: errorMessage,
      });
    }

    return res.status(500).json({
      error: "Internal server error",
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
    console.log(
      JSON.stringify({
        level: "info",
        method: req.method,
        path: "/api/favorite",
        statusCode,
        duration,
        timestamp: new Date().toISOString(),
      })
    );
  }
}
