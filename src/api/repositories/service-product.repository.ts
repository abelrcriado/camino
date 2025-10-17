import { supabase } from "@/api/services/supabase";

export interface ServiceProduct {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category_id: string;
  subcategory_id: string | null;
  brand: string | null;
  model: string | null;
  specifications: Record<string, any> | null;
  base_cost: number;
  retail_price: number;
  vat_rate: number;
  profit_margin: number | null;
  partner_commission_rate: number;
  weight_grams: number | null;
  dimensions: {
    length_mm?: number;
    width_mm?: number;
    height_mm?: number;
  } | null;
  barcode: string | null;
  is_active: boolean;
  requires_refrigeration: boolean;
  expiration_months: number | null;
  supplier_name: string | null;
  supplier_code: string | null;
  supplier_url: string | null;
  images: string[] | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceProductInsert {
  sku: string;
  name: string;
  description?: string;
  category_id: string;
  subcategory_id?: string;
  brand?: string;
  model?: string;
  specifications?: Record<string, any>;
  base_cost: number;
  retail_price: number;
  vat_rate?: number;
  profit_margin?: number;
  partner_commission_rate?: number;
  weight_grams?: number;
  dimensions?: {
    length_mm?: number;
    width_mm?: number;
    height_mm?: number;
  };
  barcode?: string;
  is_active?: boolean;
  requires_refrigeration?: boolean;
  expiration_months?: number;
  supplier_name?: string;
  supplier_code?: string;
  supplier_url?: string;
  images?: string[];
  tags?: string[];
}

export interface ServiceProductUpdate {
  sku?: string;
  name?: string;
  description?: string | null;
  category_id?: string;
  subcategory_id?: string | null;
  brand?: string | null;
  model?: string | null;
  specifications?: Record<string, any> | null;
  base_cost?: number;
  retail_price?: number;
  vat_rate?: number;
  profit_margin?: number;
  partner_commission_rate?: number;
  weight_grams?: number | null;
  dimensions?: {
    length_mm?: number;
    width_mm?: number;
    height_mm?: number;
  } | null;
  barcode?: string | null;
  is_active?: boolean;
  requires_refrigeration?: boolean;
  expiration_months?: number | null;
  supplier_name?: string | null;
  supplier_code?: string | null;
  supplier_url?: string | null;
  images?: string[] | null;
  tags?: string[] | null;
}

export interface ServiceProductFilters {
  category_id?: string;
  subcategory_id?: string;
  brand?: string;
  tags?: string[];
  is_active?: boolean;
  requires_refrigeration?: boolean;
  search?: string;
}

export class ServiceProductRepository {
  async findAll(filters?: ServiceProductFilters): Promise<ServiceProduct[]> {
    let query = supabase
      .from("service_products")
      .select("*")
      .order("name", { ascending: true });

    if (filters?.category_id) {
      query = query.eq("category_id", filters.category_id);
    }

    if (filters?.subcategory_id) {
      query = query.eq("subcategory_id", filters.subcategory_id);
    }

    if (filters?.brand) {
      query = query.eq("brand", filters.brand);
    }

    if (filters?.is_active !== undefined) {
      query = query.eq("is_active", filters.is_active);
    }

    if (filters?.requires_refrigeration !== undefined) {
      query = query.eq(
        "requires_refrigeration",
        filters.requires_refrigeration
      );
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains("tags", filters.tags);
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }

    return data as ServiceProduct[];
  }

  async findAllWithDetails(filters?: ServiceProductFilters): Promise<any[]> {
    let query = supabase
      .from("v_service_products_full")
      .select("*")
      .order("product_name", { ascending: true });

    if (filters?.category_id) {
      query = query.eq("category_id", filters.category_id);
    }

    if (filters?.subcategory_id) {
      query = query.eq("subcategory_id", filters.subcategory_id);
    }

    if (filters?.brand) {
      query = query.eq("brand", filters.brand);
    }

    if (filters?.is_active !== undefined) {
      query = query.eq("is_active", filters.is_active);
    }

    if (filters?.requires_refrigeration !== undefined) {
      query = query.eq(
        "requires_refrigeration",
        filters.requires_refrigeration
      );
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains("tags", filters.tags);
    }

    if (filters?.search) {
      query = query.or(
        `product_name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching products with details: ${error.message}`);
    }

    return data;
  }

  async findById(id: string): Promise<ServiceProduct | null> {
    const { data, error } = await supabase
      .from("service_products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Error fetching product: ${error.message}`);
    }

    return data as ServiceProduct;
  }

  async findBySku(sku: string): Promise<ServiceProduct | null> {
    const { data, error } = await supabase
      .from("service_products")
      .select("*")
      .eq("sku", sku)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Error fetching product: ${error.message}`);
    }

    return data as ServiceProduct;
  }

  async create(product: ServiceProductInsert): Promise<ServiceProduct> {
    const { data, error } = await supabase
      .from("service_products")
      .insert(product)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }

    return data as ServiceProduct;
  }

  async update(
    id: string,
    updates: ServiceProductUpdate
  ): Promise<ServiceProduct | null> {
    const { data, error } = await supabase
      .from("service_products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Error updating product: ${error.message}`);
    }

    return data as ServiceProduct;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("service_products")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }

    return true;
  }

  async skuExists(sku: string, excludeId?: string): Promise<boolean> {
    let query = supabase.from("service_products").select("id").eq("sku", sku);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error checking SKU: ${error.message}`);
    }

    return data.length > 0;
  }

  async getBrands(): Promise<string[]> {
    const { data, error } = await supabase
      .from("service_products")
      .select("brand")
      .not("brand", "is", null)
      .order("brand", { ascending: true });

    if (error) {
      throw new Error(`Error fetching brands: ${error.message}`);
    }

    const brands = [...new Set(data.map((item) => item.brand).filter(Boolean))];
    return brands as string[];
  }

  async getAllTags(): Promise<string[]> {
    const { data, error } = await supabase
      .from("service_products")
      .select("tags")
      .not("tags", "is", null);

    if (error) {
      throw new Error(`Error fetching tags: ${error.message}`);
    }

    const allTags = new Set<string>();
    data.forEach((item) => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag) => allTags.add(tag));
      }
    });

    return Array.from(allTags).sort();
  }
}
