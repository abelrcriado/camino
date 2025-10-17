import { SupabaseClient } from "@supabase/supabase-js";
import { CSP, CSPWithDistance } from "@/shared/dto/csp.dto";

export interface NearbySearchParams {
  latitude: number;
  longitude: number;
  radiusKm: number;
  serviceType?: string;
  isActive?: boolean;
  limit?: number;
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
  order: number;
}

export interface CSPOnRoute extends CSP {
  distance_from_route: number;
  nearest_point_lat: number;
  nearest_point_lng: number;
}

export class GeolocationRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Find CSPs within a radius of a given point
   * Uses PostGIS ST_DWithin for efficient geographic queries
   */
  async findNearby(params: NearbySearchParams): Promise<CSPWithDistance[]> {
    const {
      latitude,
      longitude,
      radiusKm,
      serviceType,
      isActive,
      limit = 50,
    } = params;

    // Build the query with PostGIS distance calculation
    const { data, error } = await this.supabase.rpc("find_nearby_csps", {
      lat: latitude,
      lng: longitude,
      radius_km: radiusKm,
      service_type: serviceType || null,
      active_only: isActive !== undefined ? isActive : null,
      max_results: limit,
    });

    if (error) {
      throw new Error(`Failed to find nearby CSPs: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Calculate distance between two points in kilometers
   * Uses PostGIS ST_Distance for accurate geodesic calculations
   */
  async calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): Promise<number> {
    const { data, error } = await this.supabase.rpc("calculate_distance", {
      lat1: point1.latitude,
      lng1: point1.longitude,
      lat2: point2.latitude,
      lng2: point2.longitude,
    });

    if (error) {
      throw new Error(`Failed to calculate distance: ${error.message}`);
    }

    return data || 0;
  }

  /**
   * Find CSPs along a route (polyline)
   * Useful for planning stops along the Camino de Santiago
   */
  async findAlongRoute(
    routePoints: RoutePoint[],
    maxDistanceFromRouteKm: number = 2,
    limit: number = 50
  ): Promise<CSPOnRoute[]> {
    // Convert route points to LineString format
    const lineString = routePoints
      .sort((a, b) => a.order - b.order)
      .map((p) => `${p.longitude} ${p.latitude}`)
      .join(",");

    const { data, error } = await this.supabase.rpc("find_csps_along_route", {
      route_linestring: `LINESTRING(${lineString})`,
      max_distance_km: maxDistanceFromRouteKm,
      max_results: limit,
    });

    if (error) {
      throw new Error(`Failed to find CSPs along route: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get distance from a CSP to a specific point
   */
  async getDistanceToCSP(
    cspId: string,
    targetPoint: { latitude: number; longitude: number }
  ): Promise<number> {
    // First get the CSP location
    const { data: csp, error: cspError } = await this.supabase
      .from("service_points")
      .select("latitude, longitude")
      .eq("id", cspId)
      .single();

    if (cspError || !csp) {
      throw new Error(`CSP not found: ${cspId}`);
    }

    // Calculate distance
    return this.calculateDistance(
      { latitude: csp.latitude, longitude: csp.longitude },
      targetPoint
    );
  }

  /**
   * Find the nearest CSP to a given point
   */
  async findNearest(
    latitude: number,
    longitude: number,
    serviceType?: string
  ): Promise<CSPWithDistance | null> {
    const results = await this.findNearby({
      latitude,
      longitude,
      radiusKm: 100, // Search within 100km
      serviceType,
      isActive: true,
      limit: 1,
    });

    return results.length > 0 ? results[0] : null;
  }

  /**
   * Get CSPs within a bounding box (viewport)
   * Useful for map views
   */
  async findInBoundingBox(
    northEast: { latitude: number; longitude: number },
    southWest: { latitude: number; longitude: number },
    limit: number = 100
  ): Promise<CSP[]> {
    const { data, error } = await this.supabase.rpc("find_csps_in_bbox", {
      ne_lat: northEast.latitude,
      ne_lng: northEast.longitude,
      sw_lat: southWest.latitude,
      sw_lng: southWest.longitude,
      max_results: limit,
    });

    if (error) {
      throw new Error(`Failed to find CSPs in bounding box: ${error.message}`);
    }

    return data || [];
  }
}
