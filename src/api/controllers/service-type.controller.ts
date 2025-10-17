import { ServiceTypeService } from "@/api/services/service-type.service";
import type { NextApiRequest, NextApiResponse } from "next";

export class ServiceTypeController {
  private service: ServiceTypeService;

  constructor() {
    this.service = new ServiceTypeService();
  }

  async list(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { is_active } = req.query;

      const isActiveOnly = is_active !== "false"; // Por defecto true

      const serviceTypes = await this.service.list(isActiveOnly);

      return res.status(200).json({
        success: true,
        data: serviceTypes,
        count: serviceTypes.length,
      });
    } catch (error: any) {
      logger.error("Error listing service types:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  async getById(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          error: "Service type ID is required",
        });
      }

      const serviceType = await this.service.getById(id);

      if (!serviceType) {
        return res.status(404).json({
          success: false,
          error: "Service type not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: serviceType,
      });
    } catch (error: any) {
      logger.error("Error fetching service type:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }
}
