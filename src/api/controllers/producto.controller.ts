/**
 * Controller para Productos
 * Maneja HTTP requests y delegación al service
 */

import { NextApiRequest, NextApiResponse } from "next";
import { ProductoService } from "@/api/services/producto.service";
import {
  createProductoSchema,
  updateProductoSchema,
  deleteProductoSchema,
  queryProductoSchema,
} from "@/api/schemas/producto.schema";
import logger from "@/config/logger";
import { ProductoFilters } from "@/shared/dto/producto.dto";

export class ProductoController {
  private service: ProductoService;

  constructor(service?: ProductoService) {
    this.service = service || new ProductoService();
  }

  async handle(req: NextApiRequest, res: NextApiResponse) {
    try {
      switch (req.method) {
        case "GET":
          return await this.getProductos(req, res);
        case "POST":
          return await this.createProducto(req, res);
        case "PUT":
          return await this.updateProducto(req, res);
        case "DELETE":
          return await this.deleteProducto(req, res);
        default:
          return res.status(405).json({ error: "Método no permitido" });
      }
    } catch (error) {
      logger.error("Error en ProductoController:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  private async getProductos(req: NextApiRequest, res: NextApiResponse) {
    try {
      const query = queryProductoSchema.parse(req.query);

      const filters: ProductoFilters = {
        sku: query.sku,
        nombre: query.nombre,
        category_id: query.category_id,
        subcategory_id: query.subcategory_id,
        marca: query.marca,
        modelo: query.modelo,
        unidad_medida: query.unidad_medida,
        is_active: query.is_active,
        perecedero: query.perecedero,
        requiere_refrigeracion: query.requiere_refrigeracion,
        precio_min: query.precio_min,
        precio_max: query.precio_max,
        search: query.search,
      };

      const paginationParams = {
        page: query.page,
        limit: query.limit,
      };

      const sortParams = {
        field: query.sort_by,
        order: query.sort_order,
      };

      const result = await this.service.findAll(
        filters as Record<string, string | number | boolean | undefined>,
        paginationParams,
        sortParams
      );

      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error && error.message.includes("validation")) {
        return res.status(400).json({ error: error.message });
      }
      logger.error("Error al obtener productos:", error);
      return res.status(500).json({ error: "Error al obtener productos" });
    }
  }

  private async createProducto(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = createProductoSchema.parse(req.body);

      const producto = await this.service.createProducto(data);

      logger.info(`Producto creado: ${producto.id}`);
      return res.status(201).json({ data: [producto] });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("SKU") ||
          error.message.includes("precio") ||
          error.message.includes("perecedero")
        ) {
          return res.status(409).json({ error: error.message });
        }
        if (error.message.includes("validation")) {
          return res.status(400).json({ error: error.message });
        }
      }
      logger.error("Error al crear producto:", error);
      return res.status(500).json({ error: "Error al crear producto" });
    }
  }

  private async updateProducto(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = updateProductoSchema.parse(req.body);

      const producto = await this.service.updateProducto(data);

      logger.info(`Producto actualizado: ${producto.id}`);
      return res.status(200).json({ data: [producto] });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("no encontrado")) {
          return res.status(404).json({ error: error.message });
        }
        if (error.message.includes("SKU") || error.message.includes("precio")) {
          return res.status(409).json({ error: error.message });
        }
        if (error.message.includes("validation")) {
          return res.status(400).json({ error: error.message });
        }
      }
      logger.error("Error al actualizar producto:", error);
      return res.status(500).json({ error: "Error al actualizar producto" });
    }
  }

  private async deleteProducto(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = deleteProductoSchema.parse(req.query);

      const result = await this.service.deleteProducto(id);

      logger.info(`Producto eliminado (soft delete): ${id}`);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("no encontrado")) {
          return res.status(404).json({ error: error.message });
        }
        if (error.message.includes("validation")) {
          return res.status(400).json({ error: error.message });
        }
      }
      logger.error("Error al eliminar producto:", error);
      return res.status(500).json({ error: "Error al eliminar producto" });
    }
  }
}
