import {
  ProductCategoryRepository,
  type ProductCategory,
  type ProductCategoryInsert,
  type ProductCategoryUpdate,
  type ProductCategoryFilters,
} from "@/repositories/product-category.repository";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from "@/errors/custom-errors";

export class ProductCategoryService {
  private repository: ProductCategoryRepository;

  constructor() {
    this.repository = new ProductCategoryRepository();
  }

  /**
   * Listar todas las categorías con filtros
   */
  async list(filters?: ProductCategoryFilters): Promise<ProductCategory[]> {
    return this.repository.findAll(filters);
  }

  /**
   * Listar categorías con conteos
   */
  async listWithCounts() {
    return this.repository.findAllWithCounts();
  }

  /**
   * Obtener una categoría por ID
   */
  async getById(id: string): Promise<ProductCategory> {
    const category = await this.repository.findById(id);

    if (!category) {
      throw new NotFoundError("Product Category", id);
    }

    return category;
  }

  /**
   * Obtener una categoría por código
   */
  async getByCode(code: string): Promise<ProductCategory> {
    const category = await this.repository.findByCode(code);

    if (!category) {
      throw new NotFoundError("Product Category", `code: ${code}`);
    }

    return category;
  }

  /**
   * Crear una nueva categoría
   */
  async create(data: ProductCategoryInsert): Promise<ProductCategory> {
    // Validaciones
    await this.validateCategoryData(data);

    // Verificar que el código no exista
    const codeExists = await this.repository.codeExists(data.code);
    if (codeExists) {
      throw new ConflictError(
        `Category with code '${data.code}' already exists`
      );
    }

    // Si no se proporciona sort_order, asignar el siguiente
    if (data.sort_order === undefined) {
      const maxSortOrder = await this.repository.getMaxSortOrder();
      data.sort_order = maxSortOrder + 1;
    }

    return this.repository.create(data);
  }

  /**
   * Actualizar una categoría
   */
  async update(
    id: string,
    data: ProductCategoryUpdate
  ): Promise<ProductCategory> {
    // Verificar que la categoría existe
    await this.getById(id);

    // Validaciones
    if (data.code || data.name) {
      await this.validateCategoryData(data as ProductCategoryInsert);
    }

    // Si se está actualizando el código, verificar que no exista
    if (data.code) {
      const codeExists = await this.repository.codeExists(data.code, id);
      if (codeExists) {
        throw new ConflictError(
          `Category with code '${data.code}' already exists`
        );
      }
    }

    return this.repository.update(id, data);
  }

  /**
   * Eliminar una categoría (soft delete)
   */
  async softDelete(id: string): Promise<void> {
    // Verificar que la categoría existe
    await this.getById(id);

    return this.repository.softDelete(id);
  }

  /**
   * Eliminar una categoría permanentemente
   */
  async delete(id: string): Promise<void> {
    // Verificar que la categoría existe
    await this.getById(id);

    // TODO: Verificar que no tenga productos asociados
    // O manejar la eliminación en cascada según las reglas de negocio

    return this.repository.delete(id);
  }

  /**
   * Activar/Desactivar una categoría
   */
  async toggleActive(id: string): Promise<ProductCategory> {
    const category = await this.getById(id);
    return this.repository.update(id, { is_active: !category.is_active });
  }

  /**
   * Reordenar categorías
   */
  async reorder(categoryIds: string[]): Promise<void> {
    const updates = categoryIds.map((id, index) =>
      this.repository.update(id, { sort_order: index + 1 })
    );

    await Promise.all(updates);
  }

  /**
   * Validar datos de categoría
   */
  private async validateCategoryData(
    data: Partial<ProductCategoryInsert>
    // _excludeId?: string  // Reserved for future use
  ): Promise<void> {
    if (data.code) {
      // Validar formato del código (solo letras minúsculas, números y guiones bajos)
      if (!/^[a-z0-9_]+$/.test(data.code)) {
        throw new ValidationError(
          "Category code must contain only lowercase letters, numbers, and underscores"
        );
      }

      // Longitud mínima y máxima
      if (data.code.length < 2 || data.code.length > 50) {
        throw new ValidationError(
          "Category code must be between 2 and 50 characters"
        );
      }
    }

    if (data.name) {
      // Longitud mínima y máxima
      if (data.name.length < 2 || data.name.length > 200) {
        throw new ValidationError(
          "Category name must be between 2 and 200 characters"
        );
      }
    }

    if (data.sort_order !== undefined && data.sort_order < 0) {
      throw new ValidationError("Sort order must be a positive number");
    }
  }
}
