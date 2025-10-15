/**
 * Service Layer: VendingTransaction
 * Business logic for vending transactions
 */

import { BaseService } from "./base.service";
import { VendingTransactionRepository } from "../repositories/vending_transaction.repository";
import {
  VendingTransaction,
  CreateVendingTransactionDto,
  UpdateVendingTransactionDto,
  VendingTransactionFilters,
  VendingTransactionStats,
  VendingTransactionStatsByPeriod,
  VendingTransactionFull,
} from "../dto/vending_transaction.dto";
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
} from "../errors/custom-errors";

export class VendingTransactionService extends BaseService<VendingTransaction> {
  constructor(private transactionRepository: VendingTransactionRepository) {
    super(transactionRepository);
  }

  /**
   * Crear nueva transacción
   */
  async createTransaction(
    dto: CreateVendingTransactionDto
  ): Promise<VendingTransaction> {
    try {
      // Validar que precio_total = precio_unitario * cantidad
      if (dto.precio_total !== dto.precio_unitario * dto.cantidad) {
        throw new ValidationError(
          "El precio_total debe ser igual a precio_unitario * cantidad"
        );
      }

      const { data, error } = await this.transactionRepository.create(dto);

      if (error) {
        throw new DatabaseError(`Error creating transaction: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new DatabaseError("No data returned after creating transaction");
      }

      return data[0];
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof DatabaseError
      ) {
        throw error;
      }
      throw new DatabaseError(
        "Error al crear transacción",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Actualizar transacción
   */
  async updateTransaction(
    dto: UpdateVendingTransactionDto
  ): Promise<VendingTransaction> {
    try {
      // Verificar que la transacción existe
      const existing = await this.findById(dto.id);
      if (!existing) {
        throw new NotFoundError("Transacción", dto.id);
      }

      const { data, error } = await this.transactionRepository.update(
        dto.id,
        dto
      );

      if (error) {
        throw new DatabaseError(`Error updating transaction: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new DatabaseError("No data returned after updating transaction");
      }

      return data[0];
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof DatabaseError
      ) {
        throw error;
      }
      throw new DatabaseError(
        "Error al actualizar transacción",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Eliminar transacción (solo para correcciones)
   */
  async deleteTransaction(id: string): Promise<boolean> {
    try {
      // Verificar que la transacción existe
      const existing = await this.findById(id);
      if (!existing) {
        throw new NotFoundError("Transacción", id);
      }

      const { error } = await this.transactionRepository.delete(id);

      if (error) {
        throw new DatabaseError(`Error deleting transaction: ${error.message}`);
      }

      return true;
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof DatabaseError
      ) {
        throw error;
      }
      throw new DatabaseError(
        "Error al eliminar transacción",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Buscar transacciones con filtros
   */
  async getTransactions(
    filters: VendingTransactionFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: VendingTransaction[]; count: number }> {
    try {
      return await this.transactionRepository.findByFilters(
        filters,
        page,
        limit
      );
    } catch (error) {
      throw new DatabaseError(
        "Error al buscar transacciones",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Buscar transacciones con detalles completos
   */
  async getTransactionsWithDetails(
    filters: VendingTransactionFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: VendingTransactionFull[]; count: number }> {
    try {
      return await this.transactionRepository.findByFiltersWithDetails(
        filters,
        page,
        limit
      );
    } catch (error) {
      throw new DatabaseError(
        "Error al buscar transacciones con detalles",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Buscar transacciones por máquina
   */
  async getTransactionsByMachine(
    machineId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: VendingTransaction[]; count: number }> {
    try {
      return await this.transactionRepository.findByMachineId(
        machineId,
        page,
        limit
      );
    } catch (error) {
      throw new DatabaseError(
        "Error al buscar transacciones por máquina",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Buscar transacciones por slot
   */
  async getTransactionsBySlot(
    slotId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: VendingTransaction[]; count: number }> {
    try {
      return await this.transactionRepository.findBySlotId(slotId, page, limit);
    } catch (error) {
      throw new DatabaseError(
        "Error al buscar transacciones por slot",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Buscar transacciones por producto
   */
  async getTransactionsByProduct(
    productoId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: VendingTransaction[]; count: number }> {
    try {
      return await this.transactionRepository.findByProductoId(
        productoId,
        page,
        limit
      );
    } catch (error) {
      throw new DatabaseError(
        "Error al buscar transacciones por producto",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Obtener estadísticas de ventas
   */
  async getStats(
    filters: VendingTransactionFilters
  ): Promise<VendingTransactionStats> {
    try {
      return await this.transactionRepository.getStats(filters);
    } catch (error) {
      throw new DatabaseError(
        "Error al obtener estadísticas",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Obtener estadísticas por periodo
   */
  async getStatsByPeriod(
    filters: VendingTransactionFilters,
    groupBy: "day" | "week" | "month" = "day"
  ): Promise<VendingTransactionStatsByPeriod[]> {
    try {
      return await this.transactionRepository.getStatsByPeriod(
        filters,
        groupBy
      );
    } catch (error) {
      throw new DatabaseError(
        "Error al obtener estadísticas por periodo",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Obtener estadísticas con filtro de periodo predefinido
   */
  async getStatsByPredefinedPeriod(
    period: "today" | "week" | "month" | "year" | "all",
    machineId?: string
  ): Promise<VendingTransactionStats> {
    try {
      const now = new Date();
      let start_date: string | undefined;

      switch (period) {
        case "today":
          start_date = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          ).toISOString();
          break;
        case "week":
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          start_date = weekStart.toISOString();
          break;
        case "month":
          start_date = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
          ).toISOString();
          break;
        case "year":
          start_date = new Date(now.getFullYear(), 0, 1).toISOString();
          break;
        case "all":
          start_date = undefined;
          break;
      }

      const filters: VendingTransactionFilters = {
        start_date,
        machine_id: machineId,
      };

      return await this.getStats(filters);
    } catch (error) {
      throw new DatabaseError(
        "Error al obtener estadísticas por periodo predefinido",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Verificar si existe una transacción
   */
  async exists(id: string): Promise<boolean> {
    try {
      const transaction = await this.findById(id);
      return !!transaction;
    } catch (error) {
      if (error instanceof NotFoundError) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Contar transacciones con filtros
   */
  async countTransactions(
    filters: VendingTransactionFilters
  ): Promise<number> {
    try {
      const result = await this.transactionRepository.findByFilters(
        filters,
        1,
        1
      );
      return result.count;
    } catch (error) {
      throw new DatabaseError(
        "Error al contar transacciones",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }
}
