// Service para lógica de negocio de Inventory
import { BaseService } from "./base.service";
import { InventoryRepository } from "../repositories/inventory.repository";
import type {
  Inventory,
  CreateInventoryDto,
  UpdateInventoryDto,
} from "../dto/inventory.dto";

export class InventoryService extends BaseService<Inventory> {
  private inventoryRepository: InventoryRepository;

  constructor(repository?: InventoryRepository) {
    const repo = repository || new InventoryRepository();
    super(repo);
    this.inventoryRepository = repo;
  }

  /**
   * Crear un nuevo inventario
   */
  async createInventory(data: CreateInventoryDto): Promise<Inventory> {
    return this.create(data);
  }

  /**
   * Actualizar un inventario
   */
  async updateInventory(data: UpdateInventoryDto): Promise<Inventory> {
    const { id, ...updates } = data;
    return this.update(id, updates);
  }

  /**
   * Buscar inventarios por service point
   */
  async findByServicePoint(servicePointId: string): Promise<Inventory[]> {
    const { data, error } = await this.inventoryRepository.findByServicePoint(
      servicePointId
    );

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  /**
   * Buscar inventarios con stock bajo
   */
  async findLowStock(): Promise<Inventory[]> {
    const { data, error } = await this.inventoryRepository.findLowStock();

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }
}
