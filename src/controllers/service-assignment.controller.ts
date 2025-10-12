import { NextApiRequest, NextApiResponse } from "next";
import { serviceAssignmentService } from "@/services/service-assignment.service";
import {
  CreateServiceAssignmentDTO,
  ServiceAssignmentFilters,
} from "@/repositories/service-assignment.repository";

export class ServiceAssignmentController {
  /**
   * GET /api/service-assignments
   * List all service assignments with optional filters
   */
  async list(req: NextApiRequest, res: NextApiResponse) {
    try {
      const filters: ServiceAssignmentFilters = {};

      if (req.query.location_id) {
        filters.location_id = req.query.location_id as string;
      }

      if (req.query.service_id) {
        filters.service_id = req.query.service_id as string;
      }

      if (req.query.service_point_id) {
        filters.service_point_id = req.query.service_point_id as string;
      }

      if (req.query.status) {
        filters.status = req.query.status as string;
      }

      const assignments = await serviceAssignmentService.list(filters);

      return res.status(200).json({
        success: true,
        data: assignments,
        count: assignments.length,
      });
    } catch (error: any) {
      console.error("Error listing service assignments:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to list service assignments",
      });
    }
  }

  /**
   * GET /api/service-assignments/:id
   * Get a single service assignment by ID
   */
  async getById(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          error: "Assignment ID is required",
        });
      }

      const assignment = await serviceAssignmentService.getById(id);

      if (!assignment) {
        return res.status(404).json({
          success: false,
          error: "Service assignment not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: assignment,
      });
    } catch (error: any) {
      console.error("Error getting service assignment:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to get service assignment",
      });
    }
  }

  /**
   * POST /api/service-assignments
   * Create a new service assignment (assign service to location)
   */
  async create(req: NextApiRequest, res: NextApiResponse) {
    try {
      const dto: CreateServiceAssignmentDTO = req.body;

      // Validate required fields
      if (!dto.service_id) {
        return res.status(400).json({
          success: false,
          error: "service_id is required",
        });
      }

      if (!dto.location_id) {
        return res.status(400).json({
          success: false,
          error: "location_id is required",
        });
      }

      const assignmentId = await serviceAssignmentService.assign(dto);

      // Fetch the created assignment
      const assignment = await serviceAssignmentService.getById(assignmentId);

      return res.status(201).json({
        success: true,
        data: assignment,
        message: "Service assigned successfully",
      });
    } catch (error: any) {
      console.error("Error creating service assignment:", error);

      // Handle specific error messages
      if (error.message.includes("already assigned")) {
        return res.status(409).json({
          success: false,
          error: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message || "Failed to create service assignment",
      });
    }
  }

  /**
   * PATCH /api/service-assignments/:id
   * Update a service assignment
   */
  async update(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          error: "Assignment ID is required",
        });
      }

      const updates = req.body;

      const assignment = await serviceAssignmentService.update(id, updates);

      return res.status(200).json({
        success: true,
        data: assignment,
        message: "Service assignment updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating service assignment:", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message || "Failed to update service assignment",
      });
    }
  }

  /**
   * DELETE /api/service-assignments/:id
   * Delete (hard delete) a service assignment
   */
  async delete(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          error: "Assignment ID is required",
        });
      }

      await serviceAssignmentService.delete(id);

      return res.status(200).json({
        success: true,
        message: "Service assignment deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting service assignment:", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message || "Failed to delete service assignment",
      });
    }
  }

  /**
   * POST /api/service-assignments/unassign
   * Unassign a service from a location (soft delete)
   */
  async unassign(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { service_id, location_id, service_point_id } = req.body;

      if (!service_id) {
        return res.status(400).json({
          success: false,
          error: "service_id is required",
        });
      }

      if (!location_id) {
        return res.status(400).json({
          success: false,
          error: "location_id is required",
        });
      }

      const result = await serviceAssignmentService.unassign(
        service_id,
        location_id,
        service_point_id || null
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          error: "Service assignment not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Service unassigned successfully",
      });
    } catch (error: any) {
      console.error("Error unassigning service:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to unassign service",
      });
    }
  }
}

export const serviceAssignmentController = new ServiceAssignmentController();
