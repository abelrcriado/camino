import { ServiceProductRepository } from "@/repositories/service-product.repository";
import { ProductCategoryRepository } from "@/repositories/product-category.repository";
import { ProductSubcategoryRepository } from "@/repositories/product-subcategory.repository";
import type {
  ServiceProduct,
  ServiceProductInsert,
  ServiceProductUpdate,
  ServiceProductFilters,
} from "@/repositories/service-product.repository";

export class ServiceProductService {
  private repository: ServiceProductRepository;
  private categoryRepository: ProductCategoryRepository;
  private subcategoryRepository: ProductSubcategoryRepository;

  constructor() {
    this.repository = new ServiceProductRepository();
    this.categoryRepository = new ProductCategoryRepository();
    this.subcategoryRepository = new ProductSubcategoryRepository();
  }

  async list(filters?: ServiceProductFilters): Promise<ServiceProduct[]> {
    return this.repository.findAll(filters);
  }

  async listWithDetails(filters?: ServiceProductFilters): Promise<any[]> {
    return this.repository.findAllWithDetails(filters);
  }

  async getById(id: string): Promise<ServiceProduct> {
    const product = await this.repository.findById(id);

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }

  async getBySku(sku: string): Promise<ServiceProduct> {
    const product = await this.repository.findBySku(sku);

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }

  async create(data: ServiceProductInsert): Promise<ServiceProduct> {
    // Validar SKU
    if (!data.sku || data.sku.length < 2 || data.sku.length > 50) {
      throw new Error("SKU must be between 2 and 50 characters");
    }

    // Validar que no exista el SKU
    const exists = await this.repository.skuExists(data.sku);
    if (exists) {
      throw new Error(`Product with SKU ${data.sku} already exists`);
    }

    // Validar nombre
    if (!data.name || data.name.length < 2 || data.name.length > 200) {
      throw new Error("Name must be between 2 and 200 characters");
    }

    // Validar que la categoría existe
    const category = await this.categoryRepository.findById(data.category_id);
    if (!category) {
      throw new Error(`Category with ID ${data.category_id} not found`);
    }

    // Validar subcategoría si se proporciona
    if (data.subcategory_id) {
      const subcategory = await this.subcategoryRepository.findById(
        data.subcategory_id
      );
      if (!subcategory) {
        throw new Error(`Subcategory with ID ${data.subcategory_id} not found`);
      }

      // Verificar que la subcategoría pertenece a la categoría
      if (subcategory.category_id !== data.category_id) {
        throw new Error(
          "Subcategory does not belong to the specified category"
        );
      }
    }

    // Validar precios
    if (data.base_cost <= 0) {
      throw new Error("Base cost must be greater than 0");
    }

    if (data.retail_price <= 0) {
      throw new Error("Retail price must be greater than 0");
    }

    if (data.retail_price < data.base_cost) {
      throw new Error(
        "Retail price must be greater than or equal to base cost"
      );
    }

    // Calcular margen de ganancia si no se proporciona
    if (data.profit_margin === undefined) {
      data.profit_margin = this.calculateProfitMargin(
        data.base_cost,
        data.retail_price
      );
    }

    // Valores por defecto
    if (data.vat_rate === undefined) {
      data.vat_rate = 21; // IVA por defecto 21%
    }

    if (data.partner_commission_rate === undefined) {
      data.partner_commission_rate = 10; // Comisión por defecto 10%
    }

    if (data.is_active === undefined) {
      data.is_active = true;
    }

    if (data.requires_refrigeration === undefined) {
      data.requires_refrigeration = false;
    }

    return this.repository.create(data);
  }

  async update(
    id: string,
    updates: ServiceProductUpdate
  ): Promise<ServiceProduct> {
    const product = await this.repository.findById(id);

    if (!product) {
      throw new Error("Product not found");
    }

    // Validar SKU si se actualiza
    if (updates.sku !== undefined) {
      if (updates.sku.length < 2 || updates.sku.length > 50) {
        throw new Error("SKU must be between 2 and 50 characters");
      }

      const exists = await this.repository.skuExists(updates.sku, id);
      if (exists) {
        throw new Error(`Product with SKU ${updates.sku} already exists`);
      }
    }

    // Validar nombre si se actualiza
    if (updates.name !== undefined) {
      if (updates.name.length < 2 || updates.name.length > 200) {
        throw new Error("Name must be between 2 and 200 characters");
      }
    }

    // Validar categoría si se actualiza
    if (updates.category_id !== undefined) {
      const category = await this.categoryRepository.findById(
        updates.category_id
      );
      if (!category) {
        throw new Error(`Category with ID ${updates.category_id} not found`);
      }
    }

    // Validar subcategoría si se actualiza
    if (
      updates.subcategory_id !== undefined &&
      updates.subcategory_id !== null
    ) {
      const subcategory = await this.subcategoryRepository.findById(
        updates.subcategory_id
      );
      if (!subcategory) {
        throw new Error(
          `Subcategory with ID ${updates.subcategory_id} not found`
        );
      }

      const categoryId = updates.category_id || product.category_id;
      if (subcategory.category_id !== categoryId) {
        throw new Error(
          "Subcategory does not belong to the specified category"
        );
      }
    }

    // Validar precios si se actualizan
    const newBaseCost = updates.base_cost ?? product.base_cost;
    const newRetailPrice = updates.retail_price ?? product.retail_price;

    if (updates.base_cost !== undefined && updates.base_cost <= 0) {
      throw new Error("Base cost must be greater than 0");
    }

    if (updates.retail_price !== undefined && updates.retail_price <= 0) {
      throw new Error("Retail price must be greater than 0");
    }

    if (newRetailPrice < newBaseCost) {
      throw new Error(
        "Retail price must be greater than or equal to base cost"
      );
    }

    // Recalcular margen si cambian los precios
    if (updates.base_cost !== undefined || updates.retail_price !== undefined) {
      updates.profit_margin = this.calculateProfitMargin(
        newBaseCost,
        newRetailPrice
      );
    }

    const updatedProduct = await this.repository.update(id, updates);

    if (!updatedProduct) {
      throw new Error("Product not found");
    }

    return updatedProduct;
  }

  async delete(id: string): Promise<boolean> {
    const product = await this.repository.findById(id);

    if (!product) {
      throw new Error("Product not found");
    }

    return this.repository.delete(id);
  }

  async toggleActive(id: string): Promise<ServiceProduct> {
    const product = await this.repository.findById(id);

    if (!product) {
      throw new Error("Product not found");
    }

    const updated = await this.repository.update(id, {
      is_active: !product.is_active,
    });

    if (!updated) {
      throw new Error("Product not found");
    }

    return updated;
  }

  async getBrands(): Promise<string[]> {
    return this.repository.getBrands();
  }

  async getAllTags(): Promise<string[]> {
    return this.repository.getAllTags();
  }

  private calculateProfitMargin(baseCost: number, retailPrice: number): number {
    if (baseCost === 0) return 0;
    return ((retailPrice - baseCost) / baseCost) * 100;
  }
}
