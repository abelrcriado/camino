/**
 * DTOs para Workshop
 */

export interface Workshop {
  id: string;
  service_point_id: string;
  name: string;
  description?: string;
  specialties?: string[];
  contact_phone: string;
  contact_email?: string;
  website_url?: string;
  capacity?: number;
  equipment?: Record<string, unknown>;
  certifications?: string[];
  average_rating?: number;
  total_reviews?: number;
  created_at?: string;
  updated_at?: string;
}

export interface WorkshopFilters {
  [key: string]: string | undefined;
  service_point_id?: string;
}

export interface CreateWorkshopDto {
  service_point_id: string;
  name: string;
  description?: string;
  specialties?: string[];
  contact_phone: string;
  contact_email?: string;
  website_url?: string;
  capacity?: number;
  equipment?: Record<string, unknown>;
  certifications?: string[];
}

export interface UpdateWorkshopDto {
  id: string;
  service_point_id?: string;
  name?: string;
  description?: string;
  specialties?: string[];
  contact_phone?: string;
  contact_email?: string;
  website_url?: string;
  capacity?: number;
  equipment?: Record<string, unknown>;
  certifications?: string[];
}
