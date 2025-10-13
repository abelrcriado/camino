// Service para lógica de negocio de Inventory Items
import { BaseService } from "./base.service";
import { InventoryItemRepository } from "../repositories/inventory_item.repository";
import type {
  InventoryItem,
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
} from "../dto/inventory_item.dto";
import { DatabaseError } from "../errors/custom-errors";

export class InventoryItemService extends BaseService<InventoryItem> {
  private inventoryItemRepository: InventoryItemRepository;

  constructor(repository?: InventoryItemRepository) {
    const repo = repository || new InventoryItemRepository();
    super(repo);
    this.inventoryItemRepository = repo;
  }

  /**
   * Crear un nuevo item de inventario
   */
  async createInventoryItem(
    data: CreateInventoryItemDto
  ): Promise<InventoryItem> {
    return this.create(data);
  }

  /**
   * Actualizar un item de inventario
   */
  async updateInventoryItem(
    data: UpdateInventoryItemDto
  ): Promise<InventoryItem> {
    const { id, ...updates } = data;
    return this.update(id, updates);
  }

  /**
   * Buscar items por inventario
   */
  async findByInventory(inventoryId: string): Promise<InventoryItem[]> {
    const { data, error } = await this.inventoryItemRepository.findByInventory(
      inventoryId
    );

    if (error) {
      throw new DatabaseError("Error al obtener items por inventario", {
        originalError: error.message,
      });
    }

    return data || [];
  }

  /**
   * Buscar items por tipo
   */
  async findByType(type: string): Promise<InventoryItem[]> {
    const { data, error } = await this.inventoryItemRepository.findByType(type);

    if (error) {
      throw new DatabaseError("Error al obtener items por tipo", {
        originalError: error.message,
      });
    }

    return data || [];
  }
}
