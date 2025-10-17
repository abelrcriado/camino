import { NextApiRequest, NextApiResponse } from "next";
import logger from "@/config/logger";
import { LocationService } from "../services/location.service";

export class LocationController {
  private locationService: LocationService;

  constructor() {
    this.locationService = new LocationService();
  }

  async handle(req: NextApiRequest, res: NextApiResponse) {
    const startTime = Date.now();

    try {
      switch (req.method) {
        case "GET":
          if (req.query.id) {
            return await this.getById(req, res);
          }
          return await this.list(req, res);
        case "POST":
          return await this.create(req, res);
        case "PUT":
          return await this.update(req, res);
        case "DELETE":
          return await this.delete(req, res);
        default:
          return res.status(405).json({ message: "Method not allowed" });
      }
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      const err = error as Error;
      logger.error(`[LocationController] Error: ${err.message}`);
      logger.error(
        `[LocationController] ${req.method} ${req.url} - 500 (${duration}ms)`
      );
      return res
        .status(500)
        .json({ error: err.message || "Error interno del servidor" });
    }
  }

  async list(req: NextApiRequest, res: NextApiResponse) {
    const startTime = Date.now();

    try {
      const { city, province, is_active } = req.query;

      const filters = {
        city: city as string | undefined,
        province: province as string | undefined,
        is_active:
          is_active === "true"
            ? true
            : is_active === "false"
            ? false
            : undefined,
      };

      const locations = await this.locationService.list(filters);

      const duration = Date.now() - startTime;
      logger.info(`[LocationController] GET ${req.url} - 200 (${duration}ms)`);

      // Standard pattern: GET returns array directly
      return res.status(200).json(locations);
    } catch (error: unknown) {
      throw error;
    }
  }

  async getById(req: NextApiRequest, res: NextApiResponse) {
    const startTime = Date.now();

    try {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "ID inválido" });
      }

      const location = await this.locationService.getById(id);

      const duration = Date.now() - startTime;
      logger.info(`[LocationController] GET ${req.url} - 200 (${duration}ms)`);

      // Standard pattern: GET by ID returns object directly
      return res.status(200).json(location);
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message === "Location not found") {
        return res.status(404).json({ error: "Ubicación no encontrada" });
      }
      throw error;
    }
  }

  async create(req: NextApiRequest, res: NextApiResponse) {
    const startTime = Date.now();

    try {
      const location = await this.locationService.create(req.body);

      const duration = Date.now() - startTime;
      logger.info(`[LocationController] POST ${req.url} - 201 (${duration}ms)`);

      // Standard pattern: POST returns array with single item
      return res.status(201).json([location]);
    } catch (error: unknown) {
      throw error;
    }
  }

  async update(req: NextApiRequest, res: NextApiResponse) {
    const startTime = Date.now();

    try {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "ID inválido" });
      }

      const location = await this.locationService.update(id, req.body);

      const duration = Date.now() - startTime;
      logger.info(`[LocationController] PUT ${req.url} - 200 (${duration}ms)`);

      // Standard pattern: PUT returns array with single item
      return res.status(200).json([location]);
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message === "Location not found") {
        return res.status(404).json({ error: "Ubicación no encontrada" });
      }
      throw error;
    }
  }

  async delete(req: NextApiRequest, res: NextApiResponse) {
    const startTime = Date.now();

    try {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "ID inválido" });
      }

      await this.locationService.delete(id);

      const duration = Date.now() - startTime;
      logger.info(
        `[LocationController] DELETE ${req.url} - 200 (${duration}ms)`
      );

      // Standard pattern: DELETE returns message object
      return res.status(200).json({
        message: "Ubicación eliminada correctamente",
      });
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message === "Location not found") {
        return res.status(404).json({ error: "Ubicación no encontrada" });
      }
      throw error;
    }
  }
}
