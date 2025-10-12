/**
 * DTOs para Taller Manager
 */

export interface TallerManager {
  id: string;
  workshop_id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

export interface TallerManagerFilters {
  [key: string]: string | undefined;
  workshop_id?: string;
  user_id?: string;
}

export interface CreateTallerManagerDto {
  workshop_id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
}

export interface UpdateTallerManagerDto {
  id: string;
  workshop_id?: string;
  user_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
}
