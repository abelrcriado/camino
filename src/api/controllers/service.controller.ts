import { ServiceService } from "@/api/services/service.service";
import logger from "@/config/logger";
import type {
  ServiceInsert,
  ServiceUpdate,
  ServiceFilters,
} from "@/api/repositories/service.repository";
import type { NextApiRequest, NextApiResponse } from "next";

export class ServiceController {
  private service: ServiceService;

  constructor() {
    this.service = new ServiceService();
  }

  async list(req: NextApiRequest, res: NextApiResponse) {
    try {
      const {
        service_point_id,
        service_type_id,
        location_id,
        status,
        search,
        with_details,
      } = req.query;

      const filters: ServiceFilters = {};

      if (service_point_id && typeof service_point_id === "string") {
        filters.service_point_id = service_point_id;
      }

      if (service_type_id && typeof service_type_id === "string") {
        filters.service_type_id = service_type_id;
      }

      if (location_id && typeof location_id === "string") {
        filters.location_id = location_id;
      }

      if (status && typeof status === "string") {
        filters.status = status as
          | "active"
          | "inactive"
          | "maintenance"
          | "out_of_service";
      }

      if (search && typeof search === "string") {
        filters.search = search;
      }

      const services =
        with_details === "true"
          ? await this.service.listWithDetails(filters)
          : await this.service.list(filters);

      return res.status(200).json({
        success: true,
        data: services,
        count: services.length,
      });
    } catch (error: any) {
      logger.error("Error listing services:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  async create(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data: ServiceInsert = req.body;

      // Only service_type_id and name are required
      // service_point_id is optional (services are generic, assigned later via service_assignments)
      if (!data.service_type_id || !data.name) {
        return res.status(400).json({
          success: false,
          error: "Service type ID and name are required",
        });
      }

      const service = await this.service.create(data);

      return res.status(201).json({
        success: true,
        data: service,
        message: "Service created successfully",
      });
    } catch (error: any) {
      logger.error("Error creating service:", error);

      if (
        error.message.includes("must be between") ||
        error.message.includes("must be greater") ||
        error.message.includes("cannot exceed") ||
        error.message.includes("must be after") ||
        error.message.includes("is required")
      ) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

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
          error: "Invalid service ID",
        });
      }

      const service = await this.service.getById(id);

      return res.status(200).json({
        success: true,
        data: service,
      });
    } catch (error: any) {
      logger.error("Error getting service:", error);

      if (error.message === "Service not found") {
        return res.status(404).json({
          success: false,
          error: "Service not found",
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  async update(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;
      const data: ServiceUpdate = req.body;

      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          error: "Invalid service ID",
        });
      }

      const service = await this.service.update(id, data);

      return res.status(200).json({
        success: true,
        data: service,
        message: "Service updated successfully",
      });
    } catch (error: any) {
      logger.error("Error updating service:", error);

      if (error.message === "Service not found") {
        return res.status(404).json({
          success: false,
          error: "Service not found",
        });
      }

      if (
        error.message.includes("must be between") ||
        error.message.includes("must be greater") ||
        error.message.includes("cannot exceed") ||
        error.message.includes("must be after")
      ) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  async delete(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          error: "Invalid service ID",
        });
      }

      await this.service.delete(id);

      return res.status(200).json({
        success: true,
        message: "Service deleted successfully",
      });
    } catch (error: any) {
      logger.error("Error deleting service:", error);

      if (error.message === "Service not found") {
        return res.status(404).json({
          success: false,
          error: "Service not found",
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  async updateStatus(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;
      const { status } = req.body;

      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          error: "Invalid service ID",
        });
      }

      if (
        !status ||
        !["active", "inactive", "maintenance", "out_of_service"].includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Invalid status. Must be: active, inactive, maintenance, or out_of_service",
        });
      }

      const service = await this.service.updateStatus(id, status);

      return res.status(200).json({
        success: true,
        data: service,
        message: `Service status updated to ${status}`,
      });
    } catch (error: any) {
      logger.error("Error updating service status:", error);

      if (error.message === "Service not found") {
        return res.status(404).json({
          success: false,
          error: "Service not found",
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  async getByStatus(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { status } = req.query;

      if (
        !status ||
        typeof status !== "string" ||
        !["active", "inactive", "maintenance", "out_of_service"].includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Invalid status. Must be: active, inactive, maintenance, or out_of_service",
        });
      }

      const services = await this.service.getServicesByStatus(status as any);

      return res.status(200).json({
        success: true,
        data: services,
        count: services.length,
      });
    } catch (error: any) {
      logger.error("Error getting services by status:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }
}
