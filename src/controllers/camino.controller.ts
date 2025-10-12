// Controller para manejo de requests HTTP de Caminos
import type { NextApiRequest, NextApiResponse } from "next";
import { CaminoService } from "../services/camino.service";
import type { CreateCaminoDto, UpdateCaminoDto } from "../dto/camino.dto";

// Usar schemas centralizados
import {
  createCaminoSchema,
  updateCaminoSchema,
  deleteCaminoSchema,
} from "../schemas/camino.schema";

export class CaminoController {
  private service: CaminoService;

  constructor(service?: CaminoService) {
    this.service = service || new CaminoService();
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
            error: `Método ${req.method} no permitido`,
          });
      }
    } catch (error) {
      return this.handleError(error, res, startTime);
    }
  }

  /**
   * GET - Obtener caminos con filtros
   */
  private async getAll(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const { codigo, estado_operativo, region } = req.query;

    // Si hay filtro de código, buscar por código específico
    if (codigo && typeof codigo === "string") {
      const camino = await this.service.findByCodigo(codigo);
      this.logRequest(req, 200, startTime);
      return res.status(200).json(camino ? [camino] : []);
    }

    // Si hay filtro de estado, buscar por estado
    if (estado_operativo && typeof estado_operativo === "string") {
      const caminos = await this.service.findByEstado(estado_operativo);
      this.logRequest(req, 200, startTime);
      return res.status(200).json(caminos);
    }

    // Si hay filtro de región, buscar por región
    if (region && typeof region === "string") {
      const caminos = await this.service.findByRegion(region);
      this.logRequest(req, 200, startTime);
      return res.status(200).json(caminos);
    }

    // Sin filtros, devolver todos
    const result = await this.service.findAll();

    this.logRequest(req, 200, startTime);
    return res.status(200).json(result.data);
  }

  /**
   * POST - Crear nuevo camino
   */
  private async create(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    // Validar datos con Zod centralizado
    const validation = createCaminoSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const caminoData = validation.data as CreateCaminoDto;
    const camino = await this.service.createCamino(caminoData);

    this.logRequest(req, 201, startTime);
    return res.status(201).json([camino]); // Array con único elemento
  }

  /**
   * PUT - Actualizar camino
   */
  private async update(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    // Validar datos con Zod centralizado
    const validation = updateCaminoSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const caminoData = validation.data as UpdateCaminoDto;
    const camino = await this.service.updateCamino(caminoData);

    this.logRequest(req, 200, startTime);
    return res.status(200).json([camino]); // Array con único elemento
  }

  /**
   * DELETE - Eliminar camino
   */
  private async delete(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    // Validar datos con Zod centralizado
    const validation = deleteCaminoSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const { id } = validation.data;
    await this.service.delete(id);

    this.logRequest(req, 200, startTime);
    return res.status(200).json({
      message: "Camino eliminado correctamente",
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
    const duration = Date.now() - startTime;

    console.error("[CaminoController] Error:", error);

    if (error && typeof error === "object" && "statusCode" in error) {
      const appError = error as { statusCode: number; message: string };
      res.status(appError.statusCode).json({
        error: appError.message,
        duration: `${duration}ms`,
      });
      return;
    }

    res.status(500).json({
      error: "Error interno del servidor",
      duration: `${duration}ms`,
    });
  }

  /**
   * Log de requests (simplificado)
   */
  private logRequest(
    req: NextApiRequest,
    status: number,
    startTime: number
  ): void {
    const duration = Date.now() - startTime;
    console.log(
      `[CaminoController] ${req.method} ${req.url} - ${status} (${duration}ms)`
    );
  }
}
