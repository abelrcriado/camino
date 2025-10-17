import { ProductCategoryService } from "@/api/services/product-category.service";
import logger from "@/config/logger";
import type {
  ProductCategoryInsert,
  ProductCategoryUpdate,
  ProductCategoryFilters,
} from "@/api/repositories/product-category.repository";
import type { NextApiRequest, NextApiResponse } from "next";

export class ProductCategoryController {
  private service: ProductCategoryService;

  constructor() {
    this.service = new ProductCategoryService();
  }

  /**
   * GET /api/categories
   * Listar todas las categorías
   */
  async list(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { is_active, search, with_counts } = req.query;

      const filters: ProductCategoryFilters = {};

      if (is_active !== undefined) {
        filters.is_active = is_active === "true";
      }

      if (search && typeof search === "string") {
        filters.search = search;
      }

      const categories =
        with_counts === "true"
          ? await this.service.listWithCounts()
          : await this.service.list(filters);

      return res.status(200).json({
        success: true,
        data: categories,
        count: categories.length,
      });
    } catch (error: any) {
      logger.error("Error listing categories:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  /**
   * POST /api/categories
   * Crear una nueva categoría
   */
  async create(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data: ProductCategoryInsert = req.body;

      // Validar que se proporcionen los campos requeridos
      if (!data.code || !data.name) {
        return res.status(400).json({
          success: false,
          error: "Code and name are required",
        });
      }

      const category = await this.service.create(data);

      return res.status(201).json({
        success: true,
        data: category,
        message: "Category created successfully",
      });
    } catch (error: any) {
      logger.error("Error creating category:", error);

      // Manejar errores de validación
      if (
        error.message.includes("already exists") ||
        error.message.includes("must contain") ||
        error.message.includes("must be between")
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

  /**
   * GET /api/categories/:id
   * Obtener una categoría por ID
   */
  async getById(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          error: "Invalid category ID",
        });
      }

      const category = await this.service.getById(id);

      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      logger.error("Error getting category:", error);

      if (error.message === "Category not found") {
        return res.status(404).json({
          success: false,
          error: "Category not found",
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  /**
   * PUT /api/categories/:id
   * Actualizar una categoría
   */
  async update(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;
      const data: ProductCategoryUpdate = req.body;

      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          error: "Invalid category ID",
        });
      }

      const category = await this.service.update(id, data);

      return res.status(200).json({
        success: true,
        data: category,
        message: "Category updated successfully",
      });
    } catch (error: any) {
      logger.error("Error updating category:", error);

      if (error.message === "Category not found") {
        return res.status(404).json({
          success: false,
          error: "Category not found",
        });
      }

      if (
        error.message.includes("already exists") ||
        error.message.includes("must contain") ||
        error.message.includes("must be between")
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

  /**
   * DELETE /api/categories/:id
   * Eliminar una categoría
   */
  async delete(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;
      const { soft } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          error: "Invalid category ID",
        });
      }

      if (soft === "true") {
        await this.service.softDelete(id);
      } else {
        await this.service.delete(id);
      }

      return res.status(200).json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error: any) {
      logger.error("Error deleting category:", error);

      if (error.message === "Category not found") {
        return res.status(404).json({
          success: false,
          error: "Category not found",
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  /**
   * PATCH /api/categories/:id/toggle
   * Activar/Desactivar una categoría
   */
  async toggleActive(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          error: "Invalid category ID",
        });
      }

      const category = await this.service.toggleActive(id);

      return res.status(200).json({
        success: true,
        data: category,
        message: `Category ${
          category.is_active ? "activated" : "deactivated"
        } successfully`,
      });
    } catch (error: any) {
      logger.error("Error toggling category:", error);

      if (error.message === "Category not found") {
        return res.status(404).json({
          success: false,
          error: "Category not found",
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  /**
   * POST /api/categories/reorder
   * Reordenar categorías
   */
  async reorder(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { category_ids } = req.body;

      if (!Array.isArray(category_ids) || category_ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Invalid category IDs array",
        });
      }

      await this.service.reorder(category_ids);

      return res.status(200).json({
        success: true,
        message: "Categories reordered successfully",
      });
    } catch (error: any) {
      logger.error("Error reordering categories:", error);

      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }
}
