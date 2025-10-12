import {
  ProductSubcategoryRepository,
  type ProductSubcategory,
  type ProductSubcategoryInsert,
  type ProductSubcategoryUpdate,
  type ProductSubcategoryFilters,
} from "@/repositories/product-subcategory.repository";
import { ProductCategoryRepository } from "@/repositories/product-category.repository";

export class ProductSubcategoryService {
  private repository: ProductSubcategoryRepository;
  private categoryRepository: ProductCategoryRepository;

  constructor() {
    this.repository = new ProductSubcategoryRepository();
    this.categoryRepository = new ProductCategoryRepository();
  }

  async list(
    filters?: ProductSubcategoryFilters
  ): Promise<ProductSubcategory[]> {
    return this.repository.findAll(filters);
  }

  async listWithCounts(categoryId?: string) {
    return this.repository.findAllWithCounts(categoryId);
  }

  async getById(id: string): Promise<ProductSubcategory> {
    const subcategory = await this.repository.findById(id);
    if (!subcategory) {
      throw new Error("Subcategory not found");
    }
    return subcategory;
  }

  async getByCode(code: string): Promise<ProductSubcategory> {
    const subcategory = await this.repository.findByCode(code);
    if (!subcategory) {
      throw new Error("Subcategory not found");
    }
    return subcategory;
  }

  async getByCategory(categoryId: string): Promise<ProductSubcategory[]> {
    return this.repository.findByCategory(categoryId);
  }

  async create(data: ProductSubcategoryInsert): Promise<ProductSubcategory> {
    // Validar datos
    await this.validateSubcategoryData(data);

    // Verificar que la categoría existe
    const category = await this.categoryRepository.findById(data.category_id);
    if (!category) {
      throw new Error("Category not found");
    }

    // Verificar que el código no exista
    const codeExists = await this.repository.codeExists(data.code);
    if (codeExists) {
      throw new Error(`Subcategory with code '${data.code}' already exists`);
    }

    // Si no se proporciona sort_order, asignar el siguiente
    if (data.sort_order === undefined) {
      const maxSortOrder = await this.repository.getMaxSortOrder(
        data.category_id
      );
      data.sort_order = maxSortOrder + 1;
    }

    return this.repository.create(data);
  }

  async update(
    id: string,
    data: ProductSubcategoryUpdate
  ): Promise<ProductSubcategory> {
    await this.getById(id);

    if (data.code || data.name || data.category_id) {
      await this.validateSubcategoryData(data as ProductSubcategoryInsert, id);
    }

    if (data.code) {
      const codeExists = await this.repository.codeExists(data.code, id);
      if (codeExists) {
        throw new Error(`Subcategory with code '${data.code}' already exists`);
      }
    }

    if (data.category_id) {
      const category = await this.categoryRepository.findById(data.category_id);
      if (!category) {
        throw new Error("Category not found");
      }
    }

    return this.repository.update(id, data);
  }

  async softDelete(id: string): Promise<void> {
    await this.getById(id);
    return this.repository.softDelete(id);
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    return this.repository.delete(id);
  }

  async toggleActive(id: string): Promise<ProductSubcategory> {
    const subcategory = await this.getById(id);
    return this.repository.update(id, { is_active: !subcategory.is_active });
  }

  private async validateSubcategoryData(
    data: Partial<ProductSubcategoryInsert>,
    excludeId?: string
  ): Promise<void> {
    if (data.code) {
      if (!/^[a-z0-9_]+$/.test(data.code)) {
        throw new Error(
          "Subcategory code must contain only lowercase letters, numbers, and underscores"
        );
      }
      if (data.code.length < 2 || data.code.length > 50) {
        throw new Error("Subcategory code must be between 2 and 50 characters");
      }
    }

    if (data.name) {
      if (data.name.length < 2 || data.name.length > 200) {
        throw new Error(
          "Subcategory name must be between 2 and 200 characters"
        );
      }
    }

    if (data.sort_order !== undefined && data.sort_order < 0) {
      throw new Error("Sort order must be a positive number");
    }
  }
}
