import { ServiceProductService } from "@/services/service-product.service";
import type {
  ServiceProductInsert,
  ServiceProductUpdate,
  ServiceProductFilters,
} from "@/repositories/service-product.repository";
import type { NextApiRequest, NextApiResponse } from "next";

export class ServiceProductController {
  private service: ServiceProductService;

  constructor() {
    this.service = new ServiceProductService();
  }

  async list(req: NextApiRequest, res: NextApiResponse) {
    try {
      const {
        category_id,
        subcategory_id,
        brand,
        is_active,
        requires_refrigeration,
        search,
        with_details,
        tags,
      } = req.query;

      const filters: ServiceProductFilters = {};

      if (category_id && typeof category_id === "string") {
        filters.category_id = category_id;
      }

      if (subcategory_id && typeof subcategory_id === "string") {
        filters.subcategory_id = subcategory_id;
      }

      if (brand && typeof brand === "string") {
        filters.brand = brand;
      }

      if (is_active !== undefined) {
        filters.is_active = is_active === "true";
      }

      if (requires_refrigeration !== undefined) {
        filters.requires_refrigeration = requires_refrigeration === "true";
      }

      if (search && typeof search === "string") {
        filters.search = search;
      }

      if (tags) {
        filters.tags = Array.isArray(tags) ? tags : [tags as string];
      }

      const products =
        with_details === "true"
          ? await this.service.listWithDetails(filters)
          : await this.service.list(filters);

      return res.status(200).json({
        success: true,
        data: products,
        count: products.length,
      });
    } catch (error: any) {
      console.error("Error listing products:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  async create(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data: ServiceProductInsert = req.body;

      if (
        !data.sku ||
        !data.name ||
        !data.category_id ||
        data.base_cost === undefined ||
        data.retail_price === undefined
      ) {
        return res.status(400).json({
          success: false,
          error:
            "SKU, name, category_id, base_cost, and retail_price are required",
        });
      }

      const product = await this.service.create(data);

      return res.status(201).json({
        success: true,
        data: product,
        message: "Product created successfully",
      });
    } catch (error: any) {
      console.error("Error creating product:", error);

      if (
        error.message.includes("already exists") ||
        error.message.includes("must be between") ||
        error.message.includes("must be greater") ||
        error.message.includes("not found") ||
        error.message.includes("does not belong")
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
          error: "Invalid product ID",
        });
      }

      const product = await this.service.getById(id);

      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      console.error("Error getting product:", error);

      if (error.message === "Product not found") {
        return res.status(404).json({
          success: false,
          error: "Product not found",
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  async getBySku(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { sku } = req.query;

      if (!sku || typeof sku !== "string") {
        return res.status(400).json({
          success: false,
          error: "Invalid SKU",
        });
      }

      const product = await this.service.getBySku(sku);

      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      console.error("Error getting product by SKU:", error);

      if (error.message === "Product not found") {
        return res.status(404).json({
          success: false,
          error: "Product not found",
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
      const data: ServiceProductUpdate = req.body;

      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          error: "Invalid product ID",
        });
      }

      const product = await this.service.update(id, data);

      return res.status(200).json({
        success: true,
        data: product,
        message: "Product updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating product:", error);

      if (error.message === "Product not found") {
        return res.status(404).json({
          success: false,
          error: "Product not found",
        });
      }

      if (
        error.message.includes("already exists") ||
        error.message.includes("must be between") ||
        error.message.includes("must be greater") ||
        error.message.includes("not found") ||
        error.message.includes("does not belong")
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
          error: "Invalid product ID",
        });
      }

      await this.service.delete(id);

      return res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting product:", error);

      if (error.message === "Product not found") {
        return res.status(404).json({
          success: false,
          error: "Product not found",
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
          error: "Invalid product ID",
        });
      }

      const product = await this.service.toggleActive(id);

      return res.status(200).json({
        success: true,
        data: product,
        message: `Product ${
          product.is_active ? "activated" : "deactivated"
        } successfully`,
      });
    } catch (error: any) {
      console.error("Error toggling product:", error);

      if (error.message === "Product not found") {
        return res.status(404).json({
          success: false,
          error: "Product not found",
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  async getBrands(req: NextApiRequest, res: NextApiResponse) {
    try {
      const brands = await this.service.getBrands();

      return res.status(200).json({
        success: true,
        data: brands,
      });
    } catch (error: any) {
      console.error("Error getting brands:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  async getTags(req: NextApiRequest, res: NextApiResponse) {
    try {
      const tags = await this.service.getAllTags();

      return res.status(200).json({
        success: true,
        data: tags,
      });
    } catch (error: any) {
      console.error("Error getting tags:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }
}
