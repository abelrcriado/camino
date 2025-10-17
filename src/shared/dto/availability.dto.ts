// DTOs y tipos para el Sistema de Disponibilidad

export interface OpeningHours {
  day_of_week: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  open_time: string; // "09:00"
  close_time: string; // "18:00"
  is_closed: boolean; // true if closed that day
}

export interface ServiceAvailability {
  service_id: string;
  service_name: string;
  service_type: string;
  is_available: boolean;
  available_slots?: number;
  next_available?: string; // ISO timestamp
  unavailable_reason?: string; // "maintenance", "fully_booked", "closed"
}

export interface CSPAvailabilityStatus {
  csp_id: string;
  csp_name: string;
  is_open: boolean;
  current_status: "open" | "closed" | "maintenance" | "unknown";
  opening_hours: OpeningHours[];
  services: ServiceAvailability[];
  special_closures?: SpecialClosure[];
}

export interface SpecialClosure {
  id: string;
  csp_id: string;
  start_date: string; // ISO date
  end_date: string; // ISO date
  reason: string;
  created_at?: string;
}

export interface TimeSlot {
  start_time: string; // "09:00"
  end_time: string; // "10:00"
  is_available: boolean;
  capacity: number;
  booked: number;
  service_id?: string;
}

export interface DayAvailability {
  date: string; // "2025-10-15"
  day_of_week: number; // 0-6
  is_open: boolean;
  open_time?: string;
  close_time?: string;
  slots: TimeSlot[];
  special_closure?: SpecialClosure;
}

export interface AvailabilityQueryParams {
  csp_id?: string;
  service_id?: string;
  date?: string; // "2025-10-15"
  start_date?: string;
  end_date?: string;
  include_slots?: boolean;
}

export interface CreateOpeningHoursDto {
  csp_id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed?: boolean;
}

export interface UpdateOpeningHoursDto {
  id: string;
  open_time?: string;
  close_time?: string;
  is_closed?: boolean;
}

export interface CreateSpecialClosureDto {
  csp_id: string;
  start_date: string;
  end_date: string;
  reason: string;
}

export interface UpdateSpecialClosureDto {
  id: string;
  start_date?: string;
  end_date?: string;
  reason?: string;
}
