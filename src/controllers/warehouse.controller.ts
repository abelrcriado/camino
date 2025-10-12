import { NextApiRequest, NextApiResponse } from "next";
import { WarehouseService } from "@/services/warehouse.service";
import type {
  CreateWarehouseDTO,
  UpdateWarehouseDTO,
} from "@/repositories/warehouse.repository";

export class WarehouseController {
  private warehouseService: WarehouseService;

  constructor() {
    this.warehouseService = new WarehouseService();
  }

  /**
   * GET /api/warehouses
   * Obtener todos los almacenes
   */
  async getAll(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { is_active } = req.query;

      const filters = {
        is_active:
          is_active === "true"
            ? true
            : is_active === "false"
            ? false
            : undefined,
      };

      const warehouses = await this.warehouseService.getAllWarehouses(filters);

      return res.status(200).json({
        success: true,
        data: warehouses,
        count: warehouses.length,
      });
    } catch (error: any) {
      console.error("Error in getAll warehouses:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  /**
   * GET /api/warehouses/:id
   * Obtener almacén por ID
   */
  async getById(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;
      const { with_stats } = req.query;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          error: "Invalid warehouse ID",
        });
      }

      const warehouse =
        with_stats === "true"
          ? await this.warehouseService.getWarehouseWithStats(id)
          : await this.warehouseService.getWarehouseById(id);

      return res.status(200).json({
        success: true,
        data: warehouse,
      });
    } catch (error: any) {
      console.error("Error in getById warehouse:", error);

      if (error.message === "Warehouse not found") {
        return res.status(404).json({
          success: false,
          error: "Warehouse not found",
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  /**
   * POST /api/warehouses
   * Crear nuevo almacén
   */
  async create(req: NextApiRequest, res: NextApiResponse) {
    try {
      const warehouseData: CreateWarehouseDTO = req.body;

      // Validar campos requeridos
      if (!warehouseData.code || !warehouseData.name) {
        return res.status(400).json({
          success: false,
          error: "Code and name are required fields",
        });
      }

      const warehouse = await this.warehouseService.createWarehouse(
        warehouseData
      );

      return res.status(201).json({
        success: true,
        data: warehouse,
        message: "Warehouse created successfully",
      });
    } catch (error: any) {
      console.error("Error in create warehouse:", error);

      if (error.message.includes("already exists")) {
        return res.status(409).json({
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

  /**
   * PUT /api/warehouses/:id
   * Actualizar almacén
   */
  async update(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;
      const warehouseData: UpdateWarehouseDTO = req.body;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          error: "Invalid warehouse ID",
        });
      }

      const warehouse = await this.warehouseService.updateWarehouse(
        id,
        warehouseData
      );

      return res.status(200).json({
        success: true,
        data: warehouse,
        message: "Warehouse updated successfully",
      });
    } catch (error: any) {
      console.error("Error in update warehouse:", error);

      if (error.message === "Warehouse not found") {
        return res.status(404).json({
          success: false,
          error: "Warehouse not found",
        });
      }

      if (error.message.includes("already exists")) {
        return res.status(409).json({
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

  /**
   * DELETE /api/warehouses/:id
   * Eliminar almacén
   */
  async delete(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          error: "Invalid warehouse ID",
        });
      }

      await this.warehouseService.deleteWarehouse(id);

      return res.status(200).json({
        success: true,
        message: "Warehouse deleted successfully",
      });
    } catch (error: any) {
      console.error("Error in delete warehouse:", error);

      if (error.message === "Warehouse not found") {
        return res.status(404).json({
          success: false,
          error: "Warehouse not found",
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  /**
   * PATCH /api/warehouses/:id
   * Alternar estado activo/inactivo
   */
  async toggleStatus(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          error: "Invalid warehouse ID",
        });
      }

      const warehouse = await this.warehouseService.toggleWarehouseStatus(id);

      return res.status(200).json({
        success: true,
        data: warehouse,
        message: `Warehouse ${
          warehouse.is_active ? "activated" : "deactivated"
        } successfully`,
      });
    } catch (error: any) {
      console.error("Error in toggleStatus warehouse:", error);

      if (error.message === "Warehouse not found") {
        return res.status(404).json({
          success: false,
          error: "Warehouse not found",
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }
}
