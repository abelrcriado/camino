// DTOs y tipos para CSP (Camino Service Point)

export interface CSP {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  status: "online" | "offline" | "maintenance";
  partner_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CSPWithDistance extends CSP {
  distance_km: number;
}

export interface CSPFilters {
  status?: "online" | "offline" | "maintenance";
  type?: string;
  partner_id?: string;
  [key: string]: string | undefined;
}

export interface CreateCSPDto {
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  status?: "online" | "offline" | "maintenance";
  partner_id?: string;
}

export interface UpdateCSPDto {
  id: string;
  name?: string;
  type?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  description?: string;
  status?: "online" | "offline" | "maintenance";
  partner_id?: string;
}
