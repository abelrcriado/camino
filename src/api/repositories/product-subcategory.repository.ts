import { supabase } from "@/api/services/supabase";

export interface ProductSubcategory {
  id: string;
  category_id: string;
  code: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductSubcategoryInsert {
  category_id: string;
  code: string;
  name: string;
  description?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface ProductSubcategoryUpdate {
  category_id?: string;
  code?: string;
  name?: string;
  description?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface ProductSubcategoryFilters {
  category_id?: string;
  is_active?: boolean;
  search?: string;
}

export class ProductSubcategoryRepository {
  private tableName = "product_subcategories";

  /**
   * Obtener todas las subcategorías con filtros opcionales
   */
  async findAll(
    filters?: ProductSubcategoryFilters
  ): Promise<ProductSubcategory[]> {
    let query = supabase
      .from(this.tableName)
      .select("*")
      .order("sort_order", { ascending: true });

    if (filters?.category_id) {
      query = query.eq("category_id", filters.category_id);
    }

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
      throw new Error(`Error fetching subcategories: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Obtener subcategorías con conteo de productos (usando vista)
   */
  async findAllWithCounts(categoryId?: string) {
    let query = supabase
      .from("v_product_subcategories_summary")
      .select("*")
      .order("category_code", { ascending: true })
      .order("sort_order", { ascending: true });

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(
        `Error fetching subcategories with counts: ${error.message}`
      );
    }

    return data || [];
  }

  /**
   * Obtener una subcategoría por ID
   */
  async findById(id: string): Promise<ProductSubcategory | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Error fetching subcategory by id: ${error.message}`);
    }

    return data;
  }

  /**
   * Obtener una subcategoría por código
   */
  async findByCode(code: string): Promise<ProductSubcategory | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("code", code)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Error fetching subcategory by code: ${error.message}`);
    }

    return data;
  }

  /**
   * Obtener subcategorías por categoría
   */
  async findByCategory(categoryId: string): Promise<ProductSubcategory[]> {
    return this.findAll({ category_id: categoryId });
  }

  /**
   * Crear una nueva subcategoría
   */
  async create(
    subcategory: ProductSubcategoryInsert
  ): Promise<ProductSubcategory> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(subcategory)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating subcategory: ${error.message}`);
    }

    return data;
  }

  /**
   * Actualizar una subcategoría
   */
  async update(
    id: string,
    updates: ProductSubcategoryUpdate
  ): Promise<ProductSubcategory> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating subcategory: ${error.message}`);
    }

    return data;
  }

  /**
   * Eliminar una subcategoría (soft delete)
   */
  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      throw new Error(`Error soft deleting subcategory: ${error.message}`);
    }
  }

  /**
   * Eliminar una subcategoría permanentemente
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.tableName).delete().eq("id", id);

    if (error) {
      throw new Error(`Error deleting subcategory: ${error.message}`);
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
   * Obtener el último sort_order para una categoría
   */
  async getMaxSortOrder(categoryId: string): Promise<number> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("sort_order")
      .eq("category_id", categoryId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Error getting max sort order: ${error.message}`);
    }

    return data?.sort_order ?? 0;
  }
}
