/**
 * DTOs para el sistema de pagos con Stripe
 */

/**
 * Estado de un pago
 */
export type PaymentStatus =
  | "pending" // Pago creado, esperando confirmación
  | "processing" // Siendo procesado por Stripe
  | "succeeded" // Pago exitoso
  | "failed" // Pago fallido
  | "canceled" // Pago cancelado
  | "refunded" // Pago reembolsado
  | "partially_refunded"; // Pago parcialmente reembolsado

/**
 * Método de pago
 */
export type PaymentMethod = "card" | "bank_transfer" | "wallet" | "cash";

/**
 * Payment entity - Representa un pago en la base de datos
 */
export interface Payment {
  id: string;
  booking_id: string;
  user_id: string;
  service_point_id: string; // ID del CSP (Camino Service Point)
  amount: number; // Monto total en céntimos (ej: 2500 = 25.00 EUR)
  currency: string; // ISO 4217 (ej: 'eur', 'usd')
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  payment_method: PaymentMethod;
  status: PaymentStatus;

  // Comisiones y splits
  platform_fee: number; // Comisión plataforma en céntimos
  csp_amount: number; // Monto para el CSP en céntimos
  commission_percentage?: number; // Porcentaje de comisión (0.0-1.0)
  partner_amount?: number; // Monto neto para partner en céntimos
  stripe_transfer_id?: string | null; // ID de transferencia Stripe Connect
  stripe_account_id?: string | null; // Cuenta Stripe Connect del partner

  // Metadata
  description: string | null;
  metadata: Record<string, unknown> | null;

  // Refund info
  refunded_amount: number; // Monto total reembolsado
  refund_reason: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  refunded_at: string | null;
}

/**
 * DTO para crear un nuevo pago
 */
export interface CreatePaymentDto {
  booking_id: string;
  user_id: string;
  service_point_id: string; // ID del CSP
  amount: number; // En céntimos
  currency?: string; // Default: 'eur'
  payment_method?: PaymentMethod; // Default: 'card'
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * DTO para actualizar un pago
 */
export interface UpdatePaymentDto {
  status?: PaymentStatus;
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  paid_at?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Stripe Payment Intent
 */
export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
  payment_method: string | null;
  metadata: Record<string, unknown>;
  created: number;
}

/**
 * DTO para crear un Payment Intent en Stripe
 */
export interface CreatePaymentIntentDto {
  amount: number; // En céntimos
  currency: string;
  payment_method_types?: string[]; // Default: ['card']
  metadata?: Record<string, unknown>;
  description?: string;
  customer?: string; // Stripe customer ID
  receipt_email?: string;
}

/**
 * Response al crear un Payment Intent
 */
export interface PaymentIntentResponse {
  payment_id: string; // ID del pago en nuestra BD
  client_secret: string; // Secret para completar pago en frontend
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
}

/**
 * Refund entity
 */
export interface Refund {
  id: string;
  payment_id: string;
  stripe_refund_id: string | null;
  amount: number; // Monto reembolsado en céntimos
  reason: string;
  status: "pending" | "succeeded" | "failed";
  created_at: string;
  processed_at: string | null;
}

/**
 * DTO para crear un reembolso
 */
export interface CreateRefundDto {
  payment_id: string;
  amount?: number; // Opcional: reembolso parcial
  reason: string;
  metadata?: Record<string, unknown>;
}

/**
 * Webhook event from Stripe
 */
export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: unknown;
  };
  created: number;
}

/**
 * Payment statistics
 */
export interface PaymentStats {
  total_payments: number;
  total_amount: number;
  successful_payments: number;
  failed_payments: number;
  refunded_payments: number;
  total_refunded_amount: number;
  total_platform_fees: number;
  average_payment: number;
}

/**
 * Filtros para búsqueda de pagos
 */
export interface PaymentFilters {
  user_id?: string;
  service_point_id?: string; // ID del CSP
  booking_id?: string;
  status?: PaymentStatus;
  payment_method?: PaymentMethod;
  min_amount?: number;
  max_amount?: number;
  start_date?: string;
  end_date?: string;
}

/**
 * Payment con información relacionada
 */
export interface PaymentWithDetails extends Payment {
  user_email?: string;
  csp_name?: string;
  booking_details?: unknown;
}

/**
 * Resultado del cálculo de comisión
 */
export interface CommissionCalculation {
  total: number; // Monto total en céntimos
  partner_amount: number; // Monto para partner en céntimos
  platform_fee: number; // Comisión plataforma en céntimos
  commission_percentage: number; // Porcentaje aplicado (0.0-1.0)
}
