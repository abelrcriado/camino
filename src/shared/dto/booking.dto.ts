// DTOs y tipos para Booking - Alineado con tabla bookings

export interface Booking {
  id: string;
  user_id: string;
  service_point_id?: string;
  workshop_id?: string;
  service_type: string;
  start_time: string;
  end_time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  estimated_cost?: number; // in cents
  actual_cost?: number; // in cents
  payment_status?: "pending" | "paid" | "refunded";
  bike_details?: Record<string, unknown>; // JSONB field from database
  service_details?: Record<string, unknown>; // JSONB field from database
  created_at?: string;
  updated_at?: string;
}

export interface BookingFilters {
  user_id?: string;
  service_point_id?: string;
  workshop_id?: string;
  status?: "pending" | "confirmed" | "completed" | "cancelled";
  start_date?: string;
  end_date?: string;
  service_type?: string;
  payment_status?: "pending" | "paid" | "refunded";
  [key: string]: string | undefined;
}

export interface CreateBookingDto {
  user_id: string;
  service_point_id?: string;
  workshop_id?: string;
  service_type: string;
  start_time: string;
  end_time: string;
  status?: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  estimated_cost?: number; // in cents
  payment_status?: "pending" | "paid" | "refunded";
  bike_details?: Record<string, unknown>;
  service_details?: Record<string, unknown>;
}

export interface UpdateBookingDto {
  id: string;
  user_id?: string;
  service_point_id?: string;
  workshop_id?: string;
  service_type?: string;
  start_time?: string;
  end_time?: string;
  status?: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  estimated_cost?: number; // in cents
  actual_cost?: number; // in cents
  payment_status?: "pending" | "paid" | "refunded";
  bike_details?: Record<string, unknown>;
  service_details?: Record<string, unknown>;
}
