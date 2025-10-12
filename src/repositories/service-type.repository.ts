import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface ServiceType {
  id: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  icon?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class ServiceTypeRepository {
  async findAll(isActiveOnly: boolean = true): Promise<ServiceType[]> {
    let query = supabase
      .from("service_types")
      .select("*")
      .order("name", { ascending: true });

    if (isActiveOnly) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching service types: ${error.message}`);
    }

    return data as ServiceType[];
  }

  async findById(id: string): Promise<ServiceType | null> {
    const { data, error } = await supabase
      .from("service_types")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Error fetching service type: ${error.message}`);
    }

    return data as ServiceType;
  }

  async findByCode(code: string): Promise<ServiceType | null> {
    const { data, error } = await supabase
      .from("service_types")
      .select("*")
      .eq("code", code)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Error fetching service type by code: ${error.message}`);
    }

    return data as ServiceType;
  }
}
