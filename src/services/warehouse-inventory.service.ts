import { WarehouseStockRepository } from "@/repositories/warehouse-stock.repository";
import {
  StockMovementRepository,
  type CreateStockMovementDTO,
} from "@/repositories/stock-movement.repository";
import { supabase } from "@/services/supabase";
import {
  BusinessRuleError,
  DatabaseError,
} from "@/errors/custom-errors";

export interface TransferStockDTO {
  product_id: string;
  from_warehouse_id?: string;
  to_warehouse_id?: string;
  from_service_id?: string;
  to_service_id?: string;
  quantity: number;
  unit_cost?: number;
  notes?: string;
  performed_by?: string;
}

export interface AdjustStockDTO {
  warehouse_id: string;
  product_id: string;
  actual_quantity: number;
  reason?: string;
  performed_by?: string;
}

export class WarehouseInventoryService {
  private stockRepository: WarehouseStockRepository;
  private movementRepository: StockMovementRepository;

  constructor() {
    this.stockRepository = new WarehouseStockRepository();
    this.movementRepository = new StockMovementRepository();
  }

  /**
   * Obtener resumen consolidado de inventario
   */
  async getInventorySummary(): Promise<any[]> {
    return this.stockRepository.getStockSummary();
  }

  /**
   * Obtener stock por ubicación
   */
  async getStockByLocation(filters?: {
    location_type?: string;
    product_id?: string;
  }): Promise<any[]> {
    return this.stockRepository.getStockByLocation(filters);
  }

  /**
   * Obtener stock de un almacén
   */
  async getWarehouseStock(
    warehouseId: string,
    filters?: { product_id?: string; low_stock?: boolean }
  ): Promise<any[]> {
    return this.stockRepository.findByWarehouse(warehouseId, filters);
  }

  /**
   * Obtener stock de un producto (todos los almacenes)
   */
  async getProductStock(productId: string): Promise<any> {
    const warehouseStock = await this.stockRepository.findByProduct(productId);
    const summary = await this.stockRepository.getStockSummary();
    const productSummary = summary.find((s) => s.product_id === productId);

    return {
      warehouse_stock: warehouseStock,
      summary: productSummary || null,
    };
  }

  /**
   * Transferir stock de almacén a servicio
   */
  async transferStockToService(transferData: TransferStockDTO): Promise<any> {
    const {
      product_id,
      from_warehouse_id,
      to_service_id,
      quantity,
      unit_cost,
      notes,
      performed_by,
    } = transferData;

    if (!from_warehouse_id || !to_service_id) {
      throw new BusinessRuleError("Both from_warehouse_id and to_service_id are required");
    }

    // Llamar a la función de PostgreSQL
    const { data, error } = await supabase.rpc("transfer_stock_to_service", {
      p_product_id: product_id,
      p_warehouse_id: from_warehouse_id,
      p_service_id: to_service_id,
      p_quantity: quantity,
      p_notes: notes || null,
    });

    if (error) {
      throw new DatabaseError(`Transfer failed: ${error.message}`, { originalError: error });
    }

    return data;
  }

  /**
   * Transferir stock entre almacenes
   */
  async transferBetweenWarehouses(
    transferData: TransferStockDTO
  ): Promise<any> {
    const {
      product_id,
      from_warehouse_id,
      to_warehouse_id,
      quantity,
      unit_cost,
      notes,
      performed_by,
    } = transferData;

    if (!from_warehouse_id || !to_warehouse_id) {
      throw new BusinessRuleError(
        "Both from_warehouse_id and to_warehouse_id are required"
      );
    }

    // Verificar stock disponible en almacén origen
    const sourceStock = await this.stockRepository.findByWarehouseAndProduct(
      from_warehouse_id,
      product_id
    );

    if (!sourceStock || sourceStock.available_stock < quantity) {
      throw new BusinessRuleError(
        `Insufficient stock. Available: ${
          sourceStock?.available_stock || 0
        }, Requested: ${quantity}`
      );
    }

    // Crear movimiento
    const movement: CreateStockMovementDTO = {
      product_id,
      movement_type: "transfer",
      from_warehouse_id,
      to_warehouse_id,
      quantity,
      unit_cost,
      notes,
      movement_reason: "warehouse_transfer",
      performed_by,
    };

    return this.movementRepository.create(movement);
  }

  /**
   * Ajustar stock (inventario físico)
   */
  async adjustWarehouseStock(adjustData: AdjustStockDTO): Promise<any> {
    const { warehouse_id, product_id, actual_quantity, reason } = adjustData;

    // Llamar a la función de PostgreSQL
    const { data, error } = await supabase.rpc("adjust_warehouse_stock", {
      p_product_id: product_id,
      p_warehouse_id: warehouse_id,
      p_actual_quantity: actual_quantity,
      p_reason: reason || "physical_count",
    });

    if (error) {
      throw new DatabaseError(`Adjustment failed: ${error.message}`, { error });
    }

    return data;
  }

  /**
   * Registrar compra a proveedor
   */
  async registerPurchase(purchaseData: {
    warehouse_id: string;
    product_id: string;
    quantity: number;
    unit_cost: number;
    reference_number?: string;
    notes?: string;
    performed_by?: string;
  }): Promise<any> {
    const movement: CreateStockMovementDTO = {
      product_id: purchaseData.product_id,
      movement_type: "purchase",
      to_warehouse_id: purchaseData.warehouse_id,
      quantity: purchaseData.quantity,
      unit_cost: purchaseData.unit_cost,
      reference_number: purchaseData.reference_number,
      notes: purchaseData.notes,
      movement_reason: "supplier_purchase",
      performed_by: purchaseData.performed_by,
    };

    return this.movementRepository.create(movement);
  }

  /**
   * Obtener historial de movimientos
   */
  async getMovementHistory(filters?: {
    product_id?: string;
    movement_type?: string;
    from_date?: string;
    to_date?: string;
    warehouse_id?: string;
    service_id?: string;
    limit?: number;
  }): Promise<any[]> {
    return this.movementRepository.findAll(filters as any);
  }

  /**
   * Obtener productos con stock bajo
   */
  async getLowStockProducts(warehouseId?: string): Promise<any[]> {
    return this.stockRepository.findLowStock(warehouseId);
  }

  /**
   * Obtener productos que necesitan reorden
   */
  async getProductsNeedingReorder(warehouseId?: string): Promise<any[]> {
    const stocks = warehouseId
      ? await this.stockRepository.findByWarehouse(warehouseId)
      : await this.stockRepository.getStockSummary();

    // Filtrar productos que están por debajo del reorder_point
    return stocks.filter(
      (stock: any) => stock.available_stock <= (stock.reorder_point || 20)
    );
  }

  /**
   * Calcular valor total del inventario
   */
  async calculateInventoryValue(warehouseId?: string): Promise<{
    total_units: number;
    total_value_cents: number;
    by_category: any[];
  }> {
    const summary = warehouseId
      ? await this.stockRepository.findByWarehouse(warehouseId)
      : await this.stockRepository.getStockSummary();

    const totalUnits = summary.reduce(
      (sum: number, item: any) => sum + (item.total_stock || 0),
      0
    );

    const totalValueCents = summary.reduce(
      (sum: number, item: any) =>
        sum +
        ((item.warehouse_value_cents || 0) + (item.services_value_cents || 0)),
      0
    );

    return {
      total_units: totalUnits,
      total_value_cents: totalValueCents,
      by_category: summary,
    };
  }
}
