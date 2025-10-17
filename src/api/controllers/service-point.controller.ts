/**
 * Service Point Controller
 * Gestiona CSP (Partner), CSS (Propio), CSH (Taller Aliado)
 */

import { NextApiRequest, NextApiResponse } from "next";
import { ServicePointService } from "../services/service-point.service";
import { logger } from "@/config/logger";
import {
  CreateServicePointDTO,
  UpdateServicePointDTO,
  ServicePointFilters,
  ServicePointType,
} from "@/shared/dto/service-point.dto";

export class ServicePointController {
  constructor(private servicePointService: ServicePointService) {}

  async handle(req: NextApiRequest, res: NextApiResponse) {
    const { method, query } = req;
    const startTime = Date.now();

    try {
      // GET /api/service-points - Listar
      if (method === "GET" && !query.id) {
        return await this.list(req, res, startTime);
      }

      // GET /api/service-points/[id] - Obtener uno
      if (method === "GET" && query.id) {
        return await this.getById(req, res, startTime);
      }

      // GET /api/service-points/stats - Estadísticas
      if (req.url?.includes("/stats")) {
        return await this.getStats(req, res, startTime);
      }

      // POST /api/service-points - Crear
      if (method === "POST") {
        return await this.create(req, res, startTime);
      }

      // PUT /api/service-points/[id] - Actualizar
      if (method === "PUT" && query.id) {
        return await this.update(req, res, startTime);
      }

      // DELETE /api/service-points/[id] - Eliminar
      if (method === "DELETE" && query.id) {
        return await this.delete(req, res, startTime);
      }

      // GET /api/service-points/[id]/revenue - Revenue de un punto
      if (req.url?.includes("/revenue")) {
        return await this.getRevenue(req, res, startTime);
      }

      return res.status(405).json({ message: "Method not allowed" });
    } catch (error) {
      const err = error as Error;
      logger.error("[ServicePointController] Error:", err);
      this.logRequest(req, 500, startTime);
      return res.status(500).json({
        message: "Internal server error",
        error: err.message,
      });
    }
  }

  /**
   * GET - Listar service points con filtros
   */
  private async list(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const filters: ServicePointFilters = {
      type: req.query.type as ServicePointType,
      location_id: req.query.location_id as string,
      status: (req.query.status as string) as ServicePointFilters['status'],
      has_vending: req.query.has_vending === "true",
      has_workshop_space: req.query.has_workshop_space === "true",
      has_bike_wash: req.query.has_bike_wash === "true",
      has_ebike_charging: req.query.has_ebike_charging === "true",
      has_professional_service: req.query.has_professional_service === "true",
      search: req.query.search as string,
    };

    const result = await this.servicePointService.list(filters);

    this.logRequest(req, 200, startTime);
    return res.status(200).json(result);
  }

  /**
   * GET - Obtener service point por ID
   */
  private async getById(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const { id } = req.query;

    const result = await this.servicePointService.getById(id as string);

    if (!result) {
      this.logRequest(req, 404, startTime);
      return res.status(404).json({ message: "Service point not found" });
    }

    this.logRequest(req, 200, startTime);
    return res.status(200).json(result);
  }

  /**
   * POST - Crear nuevo service point
   */
  private async create(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const data: CreateServicePointDTO = req.body;

    // Validaciones
    if (!data.name || !data.type || !data.location_id || !data.address) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        message: "Missing required fields: name, type, location_id, address",
      });
    }

    // Validar tipo
    if (!Object.values(ServicePointType).includes(data.type)) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        message: "Invalid type. Must be CSP, CSS, or CSH",
      });
    }

    // Validaciones específicas por tipo
    if (data.type === ServicePointType.CSP && !data.partner_name) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        message: "partner_name is required for CSP type",
      });
    }

    if (data.type === ServicePointType.CSH && !data.workshop_name) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        message: "workshop_name is required for CSH type",
      });
    }

    const result = await this.servicePointService.create(data);

    this.logRequest(req, 201, startTime);
    return res.status(201).json(result);
  }

  /**
   * PUT - Actualizar service point
   */
  private async update(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const { id } = req.query;
    const data: UpdateServicePointDTO = req.body;

    const result = await this.servicePointService.update(id as string, data);

    if (!result) {
      this.logRequest(req, 404, startTime);
      return res.status(404).json({ message: "Service point not found" });
    }

    this.logRequest(req, 200, startTime);
    return res.status(200).json(result);
  }

  /**
   * DELETE - Eliminar service point
   */
  private async delete(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const { id } = req.query;

    const success = await this.servicePointService.delete(id as string);

    if (!success) {
      this.logRequest(req, 404, startTime);
      return res.status(404).json({ message: "Service point not found" });
    }

    this.logRequest(req, 200, startTime);
    return res
      .status(200)
      .json({ message: "Service point deleted successfully" });
  }

  /**
   * GET - Estadísticas generales
   */
  private async getStats(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const { start_date, end_date } = req.query;

    const stats = await this.servicePointService.getNetworkStats(
      start_date as string,
      end_date as string
    );

    this.logRequest(req, 200, startTime);
    return res.status(200).json(stats);
  }

  /**
   * GET - Revenue de un service point específico
   */
  private async getRevenue(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const { id } = req.query;
    const { start_date, end_date } = req.query;

    const revenue = await this.servicePointService.getServicePointRevenue(
      id as string,
      start_date as string,
      end_date as string
    );

    this.logRequest(req, 200, startTime);
    return res.status(200).json(revenue);
  }

  /**
   * Logging helper
   */
  private logRequest(
    req: NextApiRequest,
    statusCode: number,
    startTime: number
  ): void {
    const duration = Date.now() - startTime;
    logger.info(
      `[ServicePointController] ${req.method} ${req.url} - ${statusCode} (${duration}ms)`
    );
  }
}
