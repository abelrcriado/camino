/**
 * DTOs para el Sistema de Service Points de Camino
 * Incluye: CSP (Partner), CSS (Propio), CSH (Taller Aliado)
 */

// =====================================================
// ENUMS Y TIPOS BASE
// =====================================================

export enum ServicePointType {
  CSP = "CSP", // Camino Service Point - Partner
  CSS = "CSS", // Camino Service Station - Propia
  CSH = "CSH", // Camino Service Hub - Taller Aliado Comisión
}

export enum ServicePointStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  MAINTENANCE = "maintenance",
  PENDING = "pending",
}

export enum BookingType {
  WORKSHOP_SELF = "workshop_self",
  WORKSHOP_PROFESSIONAL = "workshop_professional",
  BIKE_WASH = "bike_wash",
  EBIKE_CHARGING = "ebike_charging",
}

export enum BookingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  NO_SHOW = "no_show",
}

export enum RevenueStreamType {
  // Flujos principales (A)
  VENDING = "vending",
  WORKSHOP_RENTAL = "workshop_rental",
  BIKE_WASH = "bike_wash",
  EBIKE_CHARGING = "ebike_charging",
  WORKSHOP_COMMISSION = "workshop_commission",

  // Flujos secundarios (B)
  ADVERTISING = "advertising",
  SUBSCRIPTIONS = "subscriptions",
  LUGGAGE_TRANSPORT = "luggage_transport",
  ACCOMMODATION_COMMISSION = "accommodation_commission",
  SPARE_PARTS = "spare_parts",

  // Flujos a largo plazo (C)
  LICENSING = "licensing",
}

// =====================================================
// LOCATION DTOs
// =====================================================

export interface LocationDTO {
  id: string;
  city: string;
  province: string;
  postal_code?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
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
}

export interface UpdateLocationDTO {
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  is_active?: boolean;
}

// =====================================================
// SERVICE POINT DTOs
// =====================================================

export interface CommissionModel {
  // Para CSP (Partner)
  vending?: number; // 0.05 - 0.10 (5-10% para partner, 90-95% para network)
  workshop?: number; // 0.30 (30% para partner, 70% para network)
  wash?: number; // 0.40 (40% para partner, 60% para network)
  charging?: number; // 0.50 (50% para partner, 50% para network)
  advertising?: number; // 0.50 (50% para partner, 50% para network)

  // Para CSS (Propio) - siempre 1.00 (100% para network)

  // Para CSH (Taller Aliado)
  service_commission?: number; // 0.175 - 0.20 (17.5-20% para network)
}

export interface OperatingHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export interface ServicePointDTO {
  id: string;
  name: string;
  code: string; // CSP-MAD-001, CSS-BCN-001, CSH-VAL-001
  type: ServicePointType;

  // Ubicación
  location_id: string;
  location_name?: string; // Poblado del JOIN
  city?: string; // Poblado del JOIN
  province?: string; // Poblado del JOIN
  address: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;

  // Info del socio (CSP)
  partner_name?: string;
  partner_contact_name?: string;
  partner_contact_email?: string;
  partner_contact_phone?: string;
  partner_type?: string; // albergue, hotel, gasolinera

  // Info del taller (CSH)
  workshop_name?: string;
  workshop_owner?: string;
  workshop_license?: string;
  workshop_specialties?: string[];

  // Servicios disponibles
  has_vending: boolean;
  has_workshop_space: boolean;
  has_bike_wash: boolean;
  has_ebike_charging: boolean;
  has_professional_service: boolean;
  has_digital_screen: boolean; // Para publicidad

  // Modelo económico
  commission_model: CommissionModel;

  // Horarios
  operating_hours?: OperatingHours;

  // Estado
  status: ServicePointStatus;
  description?: string;
  images?: string[];

  // Métricas
  total_bookings: number;
  total_revenue: number;
  rating?: number;
  review_count: number;

  created_at: string;
  updated_at: string;
}

export interface CreateServicePointDTO {
  name: string;
  type: ServicePointType;
  location_id: string;
  address: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;

  // CSP fields
  partner_name?: string;
  partner_contact_name?: string;
  partner_contact_email?: string;
  partner_contact_phone?: string;
  partner_type?: string;

  // CSH fields
  workshop_name?: string;
  workshop_owner?: string;
  workshop_license?: string;
  workshop_specialties?: string[];

  // Services
  has_vending?: boolean;
  has_workshop_space?: boolean;
  has_bike_wash?: boolean;
  has_ebike_charging?: boolean;
  has_professional_service?: boolean;

  commission_model?: CommissionModel;
  operating_hours?: OperatingHours;
  description?: string;
}

export interface UpdateServicePointDTO {
  name?: string;
  address?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;

  partner_name?: string;
  partner_contact_name?: string;
  partner_contact_email?: string;
  partner_contact_phone?: string;
  partner_type?: string;

  workshop_name?: string;
  workshop_owner?: string;
  workshop_license?: string;
  workshop_specialties?: string[];

  has_vending?: boolean;
  has_workshop_space?: boolean;
  has_bike_wash?: boolean;
  has_ebike_charging?: boolean;
  has_professional_service?: boolean;

  commission_model?: CommissionModel;
  operating_hours?: OperatingHours;
  status?: ServicePointStatus;
  description?: string;
  images?: string[];
}

// =====================================================
// BOOKING DTOs
// =====================================================

export interface BookingDTO {
  id: string;
  user_id: string;
  user_name?: string; // Poblado del JOIN
  service_point_id: string;
  service_point_name?: string; // Poblado del JOIN
  service_point_type?: ServicePointType; // Poblado del JOIN

  booking_type: BookingType;
  booking_date: string;
  booking_time: string;
  duration_minutes: number;

  service_description?: string;
  bike_type?: string;
  issue_description?: string;

  estimated_price?: number;
  final_price?: number;
  commission_amount?: number;

  status: BookingStatus;

  rating?: number;
  review?: string;

  payment_id?: string;

  created_at: string;
  updated_at: string;
  completed_at?: string;
  cancelled_at?: string;
}

export interface CreateBookingDTO {
  user_id: string;
  service_point_id: string;
  booking_type: BookingType;
  booking_date: string;
  booking_time: string;
  duration_minutes: number;
  service_description?: string;
  bike_type?: string;
  issue_description?: string;
  estimated_price?: number;
}

export interface UpdateBookingDTO {
  booking_date?: string;
  booking_time?: string;
  duration_minutes?: number;
  service_description?: string;
  status?: BookingStatus;
  final_price?: number;
  commission_amount?: number;
  rating?: number;
  review?: string;
}

// =====================================================
// REVENUE STREAM DTOs
// =====================================================

export interface RevenueStreamDTO {
  id: string;
  service_point_id: string;
  service_point_name?: string;
  stream_type: RevenueStreamType;
  transaction_date: string;

  gross_amount: number;
  partner_commission: number;
  network_revenue: number;

  booking_id?: string;
  payment_id?: string;
  user_id?: string;

  details?: Record<string, any>;

  created_at: string;
}

export interface CreateRevenueStreamDTO {
  service_point_id: string;
  stream_type: RevenueStreamType;
  gross_amount: number;
  partner_commission: number;
  network_revenue: number;
  booking_id?: string;
  payment_id?: string;
  user_id?: string;
  details?: Record<string, any>;
}

// =====================================================
// VENDING MACHINE DTOs
// =====================================================

export interface VendingMachineDTO {
  id: string;
  service_point_id: string;
  service_point_name?: string;
  machine_code: string;
  name?: string;
  model?: string;
  location_description?: string;
  status: string;
  total_slots: number;
  occupied_slots: number;
  last_refill_date?: string;
  next_maintenance_date?: string;
  total_sales: number;
  total_revenue: number;
  created_at: string;
  updated_at: string;
}

export interface CreateVendingMachineDTO {
  service_point_id: string;
  machine_code: string;
  name?: string;
  model?: string;
  location_description?: string;
  total_slots?: number;
}

// =====================================================
// SUBSCRIPTION DTOs
// =====================================================

export interface SubscriptionDTO {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  monthly_price: number;
  benefits?: Record<string, any>;
  start_date: string;
  end_date?: string;
  next_billing_date?: string;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionDTO {
  user_id: string;
  plan_type: string;
  monthly_price: number;
  benefits?: Record<string, any>;
}

// =====================================================
// STATISTICS DTOs
// =====================================================

export interface ServicePointRevenueStats {
  service_point_id: string;
  total_gross_revenue: number;
  total_partner_commission: number;
  total_network_revenue: number;

  revenue_by_stream: {
    [key: string]: {
      gross_amount: number;
      partner_commission: number;
      network_revenue: number;
      count: number;
    };
  };

  period_start: string;
  period_end: string;
}

export interface NetworkDashboardStats {
  // Totales por tipo
  total_service_points: number;
  total_csp: number;
  total_css: number;
  total_csh: number;

  // Revenue total
  total_gross_revenue: number;
  total_partner_commission: number;
  total_network_revenue: number;

  // Por flujo de ingreso
  revenue_by_stream: {
    [key: string]: {
      gross_amount: number;
      partner_commission: number;
      network_revenue: number;
      count: number;
    };
  };

  // Por período
  period_start: string;
  period_end: string;
}

// =====================================================
// FILTER DTOs
// =====================================================

export interface ServicePointFilters {
  type?: ServicePointType;
  location_id?: string;
  status?: ServicePointStatus;
  has_vending?: boolean;
  has_workshop_space?: boolean;
  has_bike_wash?: boolean;
  has_ebike_charging?: boolean;
  has_professional_service?: boolean;
  search?: string;
}

export interface BookingFilters {
  user_id?: string;
  service_point_id?: string;
  booking_type?: BookingType;
  status?: BookingStatus;
  start_date?: string;
  end_date?: string;
}

export interface RevenueFilters {
  service_point_id?: string;
  stream_type?: RevenueStreamType;
  start_date?: string;
  end_date?: string;
}
