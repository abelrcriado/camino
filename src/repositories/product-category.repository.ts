import { supabase } from "@/services/supabase";

export interface ProductCategory {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCategoryInsert {
  code: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface ProductCategoryUpdate {
  code?: string;
  name?: string;
  description?: string | null;
  icon?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface ProductCategoryFilters {
  is_active?: boolean;
  search?: string;
}

export class ProductCategoryRepository {
  private tableName = "product_categories";

  /**
   * Obtener todas las categorías con filtros opcionales
   */
  async findAll(filters?: ProductCategoryFilters): Promise<ProductCategory[]> {
    let query = supabase
      .from(this.tableName)
      .select("*")
      .order("sort_order", { ascending: true });

    if (filters?.is_active !== undefined) {
      query = query.eq("is_active", filters.is_active);
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching categories: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Obtener categorías con conteo de subcategorías y productos (usando vista)
   */
  async findAllWithCounts() {
    const { data, error } = await supabase
      .from("v_product_categories_summary")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      throw new Error(
        `Error fetching categories with counts: ${error.message}`
      );
    }

    return data || [];
  }

  /**
   * Obtener una categoría por ID
   */
  async findById(id: string): Promise<ProductCategory | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw new Error(`Error fetching category by id: ${error.message}`);
    }

    return data;
  }

  /**
   * Obtener una categoría por código
   */
  async findByCode(code: string): Promise<ProductCategory | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("code", code)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw new Error(`Error fetching category by code: ${error.message}`);
    }

    return data;
  }

  /**
   * Crear una nueva categoría
   */
  async create(category: ProductCategoryInsert): Promise<ProductCategory> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(category)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating category: ${error.message}`);
    }

    return data;
  }

  /**
   * Actualizar una categoría
   */
  async update(
    id: string,
    updates: ProductCategoryUpdate
  ): Promise<ProductCategory> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating category: ${error.message}`);
    }

    return data;
  }

  /**
   * Eliminar una categoría (soft delete - marcar como inactiva)
   */
  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      throw new Error(`Error soft deleting category: ${error.message}`);
    }
  }

  /**
   * Eliminar una categoría permanentemente
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.tableName).delete().eq("id", id);

    if (error) {
      throw new Error(`Error deleting category: ${error.message}`);
    }
  }

  /**
   * Verificar si un código ya existe
   */
  async codeExists(code: string, excludeId?: string): Promise<boolean> {
    let query = supabase.from(this.tableName).select("id").eq("code", code);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw new Error(`Error checking code existence: ${error.message}`);
    }

    return !!data;
  }

  /**
   * Obtener el último sort_order para asignar uno nuevo
   */
  async getMaxSortOrder(): Promise<number> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Error getting max sort order: ${error.message}`);
    }

    return data?.sort_order ?? 0;
  }
}
