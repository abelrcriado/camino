import { NextApiRequest, NextApiResponse } from "next";
import logger from "@/config/logger";
import {
  WarehouseInventoryService,
  type TransferStockDTO,
  type AdjustStockDTO,
} from "@/services/warehouse-inventory.service";

export class WarehouseInventoryController {
  private inventoryService: WarehouseInventoryService;

  constructor() {
    this.inventoryService = new WarehouseInventoryService();
  }

  /**
   * GET /api/warehouse-inventory/summary
   * Obtener resumen consolidado de inventario
   */
  async getSummary(req: NextApiRequest, res: NextApiResponse) {
    try {
      const summary = await this.inventoryService.getInventorySummary();

      return res.status(200).json({
        success: true,
        data: summary,
        count: summary.length,
      });
    } catch (error: any) {
      logger.error("Error in getSummary:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  /**
   * GET /api/warehouse-inventory/locations
   * Obtener stock por ubicación
   */
  async getByLocation(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { location_type, product_id } = req.query;

      const filters = {
        location_type: location_type as string | undefined,
        product_id: product_id as string | undefined,
      };

      const locations = await this.inventoryService.getStockByLocation(filters);

      return res.status(200).json({
        success: true,
        data: locations,
        count: locations.length,
      });
    } catch (error: any) {
      logger.error("Error in getByLocation:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  /**
   * GET /api/warehouse-inventory/warehouse/:id
   * Obtener stock de un almacén
   */
  async getWarehouseStock(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;
      const { product_id, low_stock } = req.query;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          error: "Invalid warehouse ID",
        });
      }

      const filters = {
        product_id: product_id as string | undefined,
        low_stock: low_stock === "true",
      };

      const stock = await this.inventoryService.getWarehouseStock(id, filters);

      return res.status(200).json({
        success: true,
        data: stock,
        count: stock.length,
      });
    } catch (error: any) {
      logger.error("Error in getWarehouseStock:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  /**
   * GET /api/warehouse-inventory/product/:id
   * Obtener stock de un producto (todos los almacenes)
   */
  async getProductStock(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          error: "Invalid product ID",
        });
      }

      const stock = await this.inventoryService.getProductStock(id);

      return res.status(200).json({
        success: true,
        data: stock,
      });
    } catch (error: any) {
      logger.error("Error in getProductStock:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  /**
   * POST /api/warehouse-inventory/transfer
   * Transferir stock entre ubicaciones
   */
  async transfer(req: NextApiRequest, res: NextApiResponse) {
    try {
      const transferData: TransferStockDTO = req.body;

      // Validar campos requeridos
      if (!transferData.product_id || !transferData.quantity) {
        return res.status(400).json({
          success: false,
          error: "product_id and quantity are required",
        });
      }

      // Determinar tipo de transferencia
      let result;
      if (transferData.from_warehouse_id && transferData.to_service_id) {
        // Transferencia almacén → servicio
        result = await this.inventoryService.transferStockToService(
          transferData
        );
      } else if (
        transferData.from_warehouse_id &&
        transferData.to_warehouse_id
      ) {
        // Transferencia almacén → almacén
        result = await this.inventoryService.transferBetweenWarehouses(
          transferData
        );
      } else {
        return res.status(400).json({
          success: false,
          error:
            "Invalid transfer parameters. Specify valid from/to locations.",
        });
      }

      return res.status(200).json({
        success: true,
        data: result,
        message: "Stock transferred successfully",
      });
    } catch (error: any) {
      logger.error("Error in transfer:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  /**
   * POST /api/warehouse-inventory/adjust
   * Ajustar stock (inventario físico)
   */
  async adjust(req: NextApiRequest, res: NextApiResponse) {
    try {
      const adjustData: AdjustStockDTO = req.body;

      // Validar campos requeridos
      if (
        !adjustData.warehouse_id ||
        !adjustData.product_id ||
        adjustData.actual_quantity === undefined
      ) {
        return res.status(400).json({
          success: false,
          error: "warehouse_id, product_id, and actual_quantity are required",
        });
      }

      const result = await this.inventoryService.adjustWarehouseStock(
        adjustData
      );

      return res.status(200).json({
        success: true,
        data: result,
        message: "Stock adjusted successfully",
      });
    } catch (error: any) {
      logger.error("Error in adjust:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  /**
   * POST /api/warehouse-inventory/purchase
   * Registrar compra a proveedor
   */
  async registerPurchase(req: NextApiRequest, res: NextApiResponse) {
    try {
      const purchaseData = req.body;

      // Validar campos requeridos
      if (
        !purchaseData.warehouse_id ||
        !purchaseData.product_id ||
        !purchaseData.quantity ||
        !purchaseData.unit_cost
      ) {
        return res.status(400).json({
          success: false,
          error:
            "warehouse_id, product_id, quantity, and unit_cost are required",
        });
      }

      const result = await this.inventoryService.registerPurchase(purchaseData);

      return res.status(201).json({
        success: true,
        data: result,
        message: "Purchase registered successfully",
      });
    } catch (error: any) {
      logger.error("Error in registerPurchase:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  /**
   * GET /api/warehouse-inventory/movements
   * Obtener historial de movimientos
   */
  async getMovements(req: NextApiRequest, res: NextApiResponse) {
    try {
      const {
        product_id,
        movement_type,
        from_date,
        to_date,
        warehouse_id,
        service_id,
        limit,
      } = req.query;

      const filters = {
        product_id: product_id as string | undefined,
        movement_type: movement_type as string | undefined,
        from_date: from_date as string | undefined,
        to_date: to_date as string | undefined,
        warehouse_id: warehouse_id as string | undefined,
        service_id: service_id as string | undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const movements = await this.inventoryService.getMovementHistory(filters);

      return res.status(200).json({
        success: true,
        data: movements,
        count: movements.length,
      });
    } catch (error: any) {
      logger.error("Error in getMovements:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  /**
   * GET /api/warehouse-inventory/low-stock
   * Obtener productos con stock bajo
   */
  async getLowStock(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { warehouse_id } = req.query;

      const products = await this.inventoryService.getLowStockProducts(
        warehouse_id as string | undefined
      );

      return res.status(200).json({
        success: true,
        data: products,
        count: products.length,
      });
    } catch (error: any) {
      logger.error("Error in getLowStock:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  /**
   * GET /api/warehouse-inventory/value
   * Calcular valor total del inventario
   */
  async getInventoryValue(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { warehouse_id } = req.query;

      const value = await this.inventoryService.calculateInventoryValue(
        warehouse_id as string | undefined
      );

      return res.status(200).json({
        success: true,
        data: value,
      });
    } catch (error: any) {
      logger.error("Error in getInventoryValue:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }
}
