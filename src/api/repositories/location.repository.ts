import { supabase } from "../services/supabase";
import logger from "@/config/logger";

export interface Location {
  id: string;
  city: string;
  province: string;
  postal_code?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  camino_id?: string | null;
  camino_nombre?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLocationDTO {
  city: string;
  province: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  is_active?: boolean;
  camino_id?: string;
}

export interface UpdateLocationDTO {
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  is_active?: boolean;
  camino_id?: string | null;
}

export class LocationRepository {
  async findAll(filters?: {
    city?: string;
    province?: string;
    is_active?: boolean;
  }): Promise<Location[]> {
    logger.info("[LocationRepository] findAll", { filters });

    // Join with caminos table to get camino_nombre
    let query = supabase.from("locations").select(
      `
        *,
        caminos (
          nombre
        )
      `
    );

    if (filters?.city) {
      query = query.ilike("city", `%${filters.city}%`);
    }

    if (filters?.province) {
      query = query.ilike("province", `%${filters.province}%`);
    }

    if (filters?.is_active !== undefined) {
      query = query.eq("is_active", filters.is_active);
    }

    const { data, error } = await query.order("city", { ascending: true });

    if (error) {
      logger.error("[LocationRepository] findAll error:", error);
      throw new Error(`Failed to fetch locations: ${error.message}`);
    }

    // Map the nested caminos.nombre to camino_nombre
    const locations = (data || []).map((loc) => {
      const { caminos, ...rest } = loc as Location & {
        caminos?: { nombre?: string };
      };
      return {
        ...rest,
        camino_nombre: caminos?.nombre || null,
      } as Location;
    });

    return locations;
  }

  async findById(id: string): Promise<Location | null> {
    logger.info("[LocationRepository] findById", { id });

    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      logger.error("[LocationRepository] findById error:", error);
      throw new Error(`Failed to fetch location: ${error.message}`);
    }

    return data;
  }

  async create(locationData: CreateLocationDTO): Promise<Location> {
    logger.info("[LocationRepository] create", { locationData });

    const { data, error } = await supabase
      .from("locations")
      .insert({
        ...locationData,
        country: locationData.country || "España",
        is_active: locationData.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      logger.error("[LocationRepository] create error:", error);
      throw new Error(`Failed to create location: ${error.message}`);
    }

    return data;
  }

  async update(id: string, locationData: UpdateLocationDTO): Promise<Location> {
    logger.info("[LocationRepository] update", { id, locationData });

    const { data, error } = await supabase
      .from("locations")
      .update(locationData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.error("[LocationRepository] update error:", error);
      throw new Error(`Failed to update location: ${error.message}`);
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    logger.info("[LocationRepository] delete", { id });

    const { error } = await supabase.from("locations").delete().eq("id", id);

    if (error) {
      logger.error("[LocationRepository] delete error:", error);
      throw new Error(`Failed to delete location: ${error.message}`);
    }
  }
}
