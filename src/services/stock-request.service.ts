import {
  stockRequestRepository,
  type CreateStockRequestDTO,
  type StockRequestFilters,
  type StockRequestStatus,
  type StockRequestPriority,
  type StockRequestDetail,
} from "@/repositories/stock-request.repository";
import { warehouseStockRepository } from "@/repositories/warehouse-stock.repository";
import logger from "@/config/logger";

export interface CreateStockRequestInput {
  fromWarehouseId: string;
  toWarehouseId: string;
  productId: string;
  quantityRequested: number;
  requestedBy?: string;
  priority?: StockRequestPriority;
  notes?: string;
}

export interface StockRequestListFilters {
  status?: StockRequestStatus | StockRequestStatus[];
  priority?: StockRequestPriority;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  productId?: string;
  locationId?: string;
  fromDate?: string;
  toDate?: string;
}

export class StockRequestService {
  /**
   * Crear nuevo pedido de stock
   * Valida stock disponible y crea el pedido
   */
  async createRequest(input: CreateStockRequestInput) {
    try {
      // Validaciones
      if (!input.fromWarehouseId || !input.toWarehouseId) {
        return {
          success: false,
          error: "Debe especificar almacén origen y destino",
        };
      }

      if (input.fromWarehouseId === input.toWarehouseId) {
        return {
          success: false,
          error: "El almacén origen y destino deben ser diferentes",
        };
      }

      if (!input.productId) {
        return {
          success: false,
          error: "Debe especificar un producto",
        };
      }

      if (!input.quantityRequested || input.quantityRequested <= 0) {
        return {
          success: false,
          error: "La cantidad debe ser mayor a 0",
        };
      }

      // Verificar stock disponible en origen
      const stock = await warehouseStockRepository.findByWarehouseAndProduct(
        input.fromWarehouseId,
        input.productId
      );

      if (!stock) {
        return {
          success: false,
          error:
            "No hay stock registrado para este producto en el almacén origen",
        };
      }

      if (stock.available_stock < input.quantityRequested) {
        return {
          success: false,
          error: `Stock insuficiente. Disponible: ${stock.available_stock}, Solicitado: ${input.quantityRequested}`,
        };
      }

      // Crear pedido usando función de BD (que ya reserva el stock)
      const dto: CreateStockRequestDTO = {
        from_warehouse_id: input.fromWarehouseId,
        to_warehouse_id: input.toWarehouseId,
        product_id: input.productId,
        quantity_requested: input.quantityRequested,
        requested_by: input.requestedBy,
        priority: input.priority || "normal",
        notes: input.notes,
      };

      const result = await stockRequestRepository.create(dto);

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Error al crear el pedido",
        };
      }

      // Obtener el pedido creado con detalles
      const request = await stockRequestRepository.getById(result.request_id!);

      return {
        success: true,
        data: request,
      };
    } catch (error) {
      logger.error("Error in createRequest:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener pedido por ID
   */
  async getRequestById(id: string) {
    try {
      const request = await stockRequestRepository.getById(id);

      if (!request) {
        return {
          success: false,
          error: "Pedido no encontrado",
        };
      }

      return {
        success: true,
        data: request,
      };
    } catch (error) {
      logger.error("Error in getRequestById:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener pedido por número de referencia
   */
  async getRequestByNumber(requestNumber: string) {
    try {
      const request = await stockRequestRepository.getByRequestNumber(
        requestNumber
      );

      if (!request) {
        return {
          success: false,
          error: "Pedido no encontrado",
        };
      }

      return {
        success: true,
        data: request,
      };
    } catch (error) {
      logger.error("Error in getRequestByNumber:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Listar pedidos con filtros
   */
  async listRequests(filters?: StockRequestListFilters) {
    try {
      const repoFilters: StockRequestFilters = {};

      if (filters?.status) repoFilters.status = filters.status;
      if (filters?.priority) repoFilters.priority = filters.priority;
      if (filters?.fromWarehouseId)
        repoFilters.from_warehouse_id = filters.fromWarehouseId;
      if (filters?.toWarehouseId)
        repoFilters.to_warehouse_id = filters.toWarehouseId;
      if (filters?.productId) repoFilters.product_id = filters.productId;
      if (filters?.locationId) repoFilters.location_id = filters.locationId;
      if (filters?.fromDate) repoFilters.from_date = filters.fromDate;
      if (filters?.toDate) repoFilters.to_date = filters.toDate;

      const requests = await stockRequestRepository.list(repoFilters);

      return {
        success: true,
        data: requests,
      };
    } catch (error) {
      logger.error("Error in listRequests:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        data: [],
      };
    }
  }

  /**
   * Marcar pedido como "preparando"
   */
  async markAsPreparing(id: string) {
    try {
      const request = await stockRequestRepository.getById(id);

      if (!request) {
        return { success: false, error: "Pedido no encontrado" };
      }

      if (request.status !== "pending") {
        return {
          success: false,
          error: `No se puede marcar como preparando. Estado actual: ${request.status}`,
        };
      }

      const updated = await stockRequestRepository.updateStatus(id, {
        status: "preparing",
        prepared_date: new Date().toISOString(),
      });

      if (!updated) {
        return { success: false, error: "Error al actualizar el estado" };
      }

      return {
        success: true,
        data: await stockRequestRepository.getById(id),
      };
    } catch (error) {
      logger.error("Error in markAsPreparing:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Enviar pedido (sale del almacén origen)
   */
  async shipRequest(id: string, shippedBy?: string) {
    try {
      const request = await stockRequestRepository.getById(id);

      if (!request) {
        return { success: false, error: "Pedido no encontrado" };
      }

      if (!["pending", "preparing"].includes(request.status)) {
        return {
          success: false,
          error: `No se puede enviar. Estado actual: ${request.status}`,
        };
      }

      const result = await stockRequestRepository.ship(id, shippedBy);

      if (!result.success) {
        return result;
      }

      return {
        success: true,
        data: await stockRequestRepository.getById(id),
      };
    } catch (error) {
      logger.error("Error in shipRequest:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Marcar como entregado (físicamente recibido)
   */
  async markAsDelivered(id: string, deliveredBy?: string) {
    try {
      const request = await stockRequestRepository.getById(id);

      if (!request) {
        return { success: false, error: "Pedido no encontrado" };
      }

      if (request.status !== "in_transit") {
        return {
          success: false,
          error: `No se puede marcar como entregado. Estado actual: ${request.status}`,
        };
      }

      const updated = await stockRequestRepository.updateStatus(id, {
        status: "delivered",
        delivered_date: new Date().toISOString(),
        delivered_by: deliveredBy,
      });

      if (!updated) {
        return { success: false, error: "Error al actualizar el estado" };
      }

      return {
        success: true,
        data: await stockRequestRepository.getById(id),
      };
    } catch (error) {
      logger.error("Error in markAsDelivered:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Consolidar pedido (confirmar carga en destino)
   */
  async consolidateRequest(id: string, deliveredBy?: string) {
    try {
      const request = await stockRequestRepository.getById(id);

      if (!request) {
        return { success: false, error: "Pedido no encontrado" };
      }

      if (request.status !== "delivered") {
        return {
          success: false,
          error: `El pedido debe estar entregado para consolidar. Estado actual: ${request.status}`,
        };
      }

      const result = await stockRequestRepository.consolidate(id, deliveredBy);

      if (!result.success) {
        return result;
      }

      return {
        success: true,
        data: await stockRequestRepository.getById(id),
      };
    } catch (error) {
      logger.error("Error in consolidateRequest:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Cancelar pedido
   */
  async cancelRequest(id: string, reason: string) {
    try {
      if (!reason || reason.trim().length === 0) {
        return {
          success: false,
          error: "Debe proporcionar un motivo de cancelación",
        };
      }

      const request = await stockRequestRepository.getById(id);

      if (!request) {
        return { success: false, error: "Pedido no encontrado" };
      }

      if (["consolidated", "cancelled"].includes(request.status)) {
        return {
          success: false,
          error: `No se puede cancelar un pedido en estado: ${request.status}`,
        };
      }

      const result = await stockRequestRepository.cancel(id, reason);

      if (!result.success) {
        return result;
      }

      return {
        success: true,
        data: await stockRequestRepository.getById(id),
      };
    } catch (error) {
      logger.error("Error in cancelRequest:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener pedidos pendientes de acción
   */
  async getRequiringAction() {
    try {
      const requests = await stockRequestRepository.getRequiringAction();
      return {
        success: true,
        data: requests,
      };
    } catch (error) {
      logger.error("Error in getRequiringAction:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        data: [],
      };
    }
  }

  /**
   * Obtener pedidos en tránsito
   */
  async getInTransit() {
    try {
      const requests = await stockRequestRepository.getInTransit();
      return {
        success: true,
        data: requests,
      };
    } catch (error) {
      logger.error("Error in getInTransit:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        data: [],
      };
    }
  }

  /**
   * Obtener estadísticas de pedidos
   */
  async getStats(filters?: {
    warehouseId?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    try {
      const repoFilters: any = {};
      if (filters?.warehouseId) repoFilters.warehouse_id = filters.warehouseId;
      if (filters?.fromDate) repoFilters.from_date = filters.fromDate;
      if (filters?.toDate) repoFilters.to_date = filters.toDate;

      const stats = await stockRequestRepository.getStats(repoFilters);

      if (!stats) {
        return {
          success: false,
          error: "Error al obtener estadísticas",
        };
      }

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      logger.error("Error in getStats:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Workflow completo: Preparar → Enviar → Entregar → Consolidar
   */
  async processRequestWorkflow(
    id: string,
    action: "prepare" | "ship" | "deliver" | "consolidate",
    userId?: string
  ) {
    switch (action) {
      case "prepare":
        return this.markAsPreparing(id);

      case "ship":
        return this.shipRequest(id, userId);

      case "deliver":
        return this.markAsDelivered(id, userId);

      case "consolidate":
        return this.consolidateRequest(id, userId);

      default:
        return {
          success: false,
          error: "Acción no válida",
        };
    }
  }
}

export const stockRequestService = new StockRequestService();
