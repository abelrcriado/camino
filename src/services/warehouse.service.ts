import {
  WarehouseRepository,
  type CreateWarehouseDTO,
  type UpdateWarehouseDTO,
  type Warehouse,
} from "@/repositories/warehouse.repository";

export class WarehouseService {
  private warehouseRepository: WarehouseRepository;

  constructor() {
    this.warehouseRepository = new WarehouseRepository();
  }

  /**
   * Obtener todos los almacenes
   */
  async getAllWarehouses(filters?: {
    is_active?: boolean;
  }): Promise<Warehouse[]> {
    return this.warehouseRepository.findAll(filters);
  }

  /**
   * Obtener almacén por ID
   */
  async getWarehouseById(id: string): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findById(id);

    if (!warehouse) {
      throw new Error("Warehouse not found");
    }

    return warehouse;
  }

  /**
   * Obtener almacén por código
   */
  async getWarehouseByCode(code: string): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findByCode(code);

    if (!warehouse) {
      throw new Error("Warehouse not found");
    }

    return warehouse;
  }

  /**
   * Crear nuevo almacén
   */
  async createWarehouse(warehouseData: CreateWarehouseDTO): Promise<Warehouse> {
    // Validar que el código sea único
    const existing = await this.warehouseRepository.findByCode(
      warehouseData.code
    );
    if (existing) {
      throw new Error(
        `Warehouse with code ${warehouseData.code} already exists`
      );
    }

    // Validar datos
    this.validateWarehouseData(warehouseData);

    return this.warehouseRepository.create(warehouseData);
  }

  /**
   * Actualizar almacén
   */
  async updateWarehouse(
    id: string,
    warehouseData: UpdateWarehouseDTO
  ): Promise<Warehouse> {
    // Verificar que existe
    await this.getWarehouseById(id);

    // Si se cambia el código, validar que sea único
    if (warehouseData.code) {
      const existing = await this.warehouseRepository.findByCode(
        warehouseData.code
      );
      if (existing && existing.id !== id) {
        throw new Error(
          `Warehouse with code ${warehouseData.code} already exists`
        );
      }
    }

    return this.warehouseRepository.update(id, warehouseData);
  }

  /**
   * Eliminar almacén
   */
  async deleteWarehouse(id: string): Promise<boolean> {
    // Verificar que existe
    await this.getWarehouseById(id);

    // TODO: Verificar que no tenga stock antes de eliminar
    // Esto se podría implementar con una consulta a warehouse_stock

    return this.warehouseRepository.delete(id);
  }

  /**
   * Alternar estado activo/inactivo
   */
  async toggleWarehouseStatus(id: string): Promise<Warehouse> {
    return this.warehouseRepository.toggleActive(id);
  }

  /**
   * Obtener almacén con estadísticas
   */
  async getWarehouseWithStats(id: string): Promise<any> {
    // Verificar que existe
    await this.getWarehouseById(id);

    return this.warehouseRepository.findByIdWithStats(id);
  }

  /**
   * Validar datos del almacén
   */
  private validateWarehouseData(
    data: CreateWarehouseDTO | UpdateWarehouseDTO
  ): void {
    if ("code" in data && data.code) {
      // Validar formato de código (solo letras, números y guiones)
      if (!/^[A-Z0-9-]+$/.test(data.code)) {
        throw new Error(
          "Warehouse code must contain only uppercase letters, numbers, and hyphens"
        );
      }
    }

    if ("name" in data && data.name) {
      // Validar longitud del nombre
      if (data.name.length < 3) {
        throw new Error("Warehouse name must be at least 3 characters long");
      }
    }

    if ("contact_email" in data && data.contact_email) {
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.contact_email)) {
        throw new Error("Invalid email format");
      }
    }

    if ("latitude" in data && data.latitude !== undefined) {
      if (data.latitude < -90 || data.latitude > 90) {
        throw new Error("Latitude must be between -90 and 90");
      }
    }

    if ("longitude" in data && data.longitude !== undefined) {
      if (data.longitude < -180 || data.longitude > 180) {
        throw new Error("Longitude must be between -180 and 180");
      }
    }
  }
}
