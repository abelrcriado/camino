import { ProductSubcategoryService } from "@/services/product-subcategory.service";
import logger from "@/config/logger";
import type {
  ProductSubcategoryInsert,
  ProductSubcategoryUpdate,
  ProductSubcategoryFilters,
} from "@/repositories/product-subcategory.repository";
import type { NextApiRequest, NextApiResponse } from "next";

export class ProductSubcategoryController {
  private service: ProductSubcategoryService;

  constructor() {
    this.service = new ProductSubcategoryService();
  }

  async list(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { category_id, is_active, search, with_counts } = req.query;

      const filters: ProductSubcategoryFilters = {};

      if (category_id && typeof category_id === "string") {
        filters.category_id = category_id;
      }

      if (is_active !== undefined) {
        filters.is_active = is_active === "true";
      }

      if (search && typeof search === "string") {
        filters.search = search;
      }

      const subcategories =
        with_counts === "true"
          ? await this.service.listWithCounts(filters.category_id)
          : await this.service.list(filters);

      return res.status(200).json({
        success: true,
        data: subcategories,
        count: subcategories.length,
      });
    } catch (error: any) {
      logger.error("Error listing subcategories:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  async create(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data: ProductSubcategoryInsert = req.body;

      if (!data.category_id || !data.code || !data.name) {
        return res.status(400).json({
          success: false,
          error: "Category ID, code and name are required",
        });
      }

      const subcategory = await this.service.create(data);

      return res.status(201).json({
        success: true,
        data: subcategory,
        message: "Subcategory created successfully",
      });
    } catch (error: any) {
      logger.error("Error creating subcategory:", error);

      if (
        error.message.includes("already exists") ||
        error.message.includes("must contain") ||
        error.message.includes("must be between") ||
        error.message.includes("not found")
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
          error: "Invalid subcategory ID",
        });
      }

      const subcategory = await this.service.getById(id);

      return res.status(200).json({
        success: true,
        data: subcategory,
      });
    } catch (error: any) {
      logger.error("Error getting subcategory:", error);

      if (error.message === "Subcategory not found") {
        return res.status(404).json({
          success: false,
          error: "Subcategory not found",
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
      const data: ProductSubcategoryUpdate = req.body;

      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          error: "Invalid subcategory ID",
        });
      }

      const subcategory = await this.service.update(id, data);

      return res.status(200).json({
        success: true,
        data: subcategory,
        message: "Subcategory updated successfully",
      });
    } catch (error: any) {
      logger.error("Error updating subcategory:", error);

      if (error.message === "Subcategory not found") {
        return res.status(404).json({
          success: false,
          error: "Subcategory not found",
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

  async delete(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;
      const { soft } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          error: "Invalid subcategory ID",
        });
      }

      if (soft === "true") {
        await this.service.softDelete(id);
      } else {
        await this.service.delete(id);
      }

      return res.status(200).json({
        success: true,
        message: "Subcategory deleted successfully",
      });
    } catch (error: any) {
      logger.error("Error deleting subcategory:", error);

      if (error.message === "Subcategory not found") {
        return res.status(404).json({
          success: false,
          error: "Subcategory not found",
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  async toggleActive(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          error: "Invalid subcategory ID",
        });
      }

      const subcategory = await this.service.toggleActive(id);

      return res.status(200).json({
        success: true,
        data: subcategory,
        message: `Subcategory ${
          subcategory.is_active ? "activated" : "deactivated"
        } successfully`,
      });
    } catch (error: any) {
      logger.error("Error toggling subcategory:", error);

      if (error.message === "Subcategory not found") {
        return res.status(404).json({
          success: false,
          error: "Subcategory not found",
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }
}
