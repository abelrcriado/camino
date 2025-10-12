/**
 * Service para Productos
 * Lógica de negocio: validación SKU único, gestión de productos
 */

import { BaseService } from "./base.service";
import { ProductoRepository } from "@/repositories/producto.repository";
import {
  Producto,
  CreateProductoDto,
  UpdateProductoDto,
  ProductoFilters,
  ProductoInventario,
} from "@/dto/producto.dto";

export class ProductoService extends BaseService<Producto> {
  private productoRepository: ProductoRepository;

  constructor(repository?: ProductoRepository) {
    const repo = repository || new ProductoRepository();
    super(repo);
    this.productoRepository = repo;
  }

  /**
   * Crear producto con validación de SKU único
   */
  async createProducto(data: CreateProductoDto): Promise<Producto> {
    // Validar SKU único
    const skuExists = await this.productoRepository.skuExists(data.sku);
    if (skuExists) {
      throw new Error(`El SKU '${data.sku}' ya existe`);
    }

    // Validación: precio_venta > costo_base
    if (data.precio_venta <= data.costo_base) {
      throw new Error("El precio de venta debe ser mayor al costo base");
    }

    // Validación: productos perecederos deben tener caducidad
    if (data.perecedero && !data.meses_caducidad && !data.dias_caducidad) {
      throw new Error(
        "Producto perecedero debe tener meses_caducidad o dias_caducidad"
      );
    }

    // Crear producto
    return await this.create(data);
  }

  /**
   * Actualizar producto con validación
   */
  async updateProducto(data: UpdateProductoDto): Promise<Producto> {
    // Validar que el producto existe
    const existing = await this.findById(data.id);
    if (!existing) {
      throw new Error(`Producto con ID ${data.id} no encontrado`);
    }

    // Si se cambia el SKU, validar que no exista
    if (data.sku && data.sku !== existing.sku) {
      const skuExists = await this.productoRepository.skuExists(
        data.sku,
        data.id
      );
      if (skuExists) {
        throw new Error(`El SKU '${data.sku}' ya existe`);
      }
    }

    // Validación: si se actualizan ambos precios, venta > costo
    const newPrecioVenta = data.precio_venta ?? existing.precio_venta;
    const newCostoBase = data.costo_base ?? existing.costo_base;

    if (newPrecioVenta <= newCostoBase) {
      throw new Error("El precio de venta debe ser mayor al costo base");
    }

    // Actualizar
    return await this.update(data.id, data);
  }

  /**
   * Eliminar producto (soft delete)
   */
  async deleteProducto(id: string): Promise<{ message: string }> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Producto con ID ${id} no encontrado`);
    }

    // Soft delete
    await this.update(id, { is_active: false } as UpdateProductoDto);

    return { message: "Producto marcado como inactivo exitosamente" };
  }

  /**
   * Buscar productos con stock
   */
  async findProductosConStock(
    filters?: ProductoFilters
  ): Promise<ProductoInventario[]> {
    return this.productoRepository.findConStock(filters);
  }

  /**
   * Buscar producto por SKU
   */
  async findBySku(sku: string): Promise<Producto | null> {
    return this.productoRepository.findBySku(sku);
  }

  /**
   * Verificar disponibilidad de producto
   */
  async checkDisponible(productoId: string): Promise<boolean> {
    return this.productoRepository.checkDisponible(productoId);
  }

  /**
   * Obtener productos próximos a caducar
   */
  async getProximosCaducar(diasUmbral: number = 30): Promise<Producto[]> {
    return this.productoRepository.getProximosCaducar(diasUmbral);
  }

  /**
   * Obtener categorías disponibles
   */
  async getCategorias(): Promise<
    Array<{ category_id: string; category_name: string }>
  > {
    return this.productoRepository.getCategorias();
  }

  /**
   * Obtener marcas disponibles
   */
  async getMarcas(): Promise<string[]> {
    return this.productoRepository.getMarcas();
  }
}
