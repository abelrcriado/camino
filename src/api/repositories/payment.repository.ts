/**
 * Repository para Payment - capa de acceso a datos con integración Stripe
 */

import { BaseRepository } from "./base.repository";
import { supabase } from "../services/supabase";
import { 
  Payment, 
  PaymentFilters, 
  PaymentStats,
  Refund,
  CreateRefundDto 
} from "@/shared/dto/payment.dto";
import { SupabaseClient } from "@supabase/supabase-js";

export class PaymentRepository extends BaseRepository<Payment> {
  constructor(db: SupabaseClient = supabase) {
    super(db, "payments");
  }

  /**
   * Buscar pago por Stripe Payment Intent ID
   */
  async findByStripePaymentIntentId(stripePaymentIntentId: string): Promise<Payment | null> {
    const { data, error } = await this.db
      .from(this.tableName)
      .select("*")
      .eq("stripe_payment_intent_id", stripePaymentIntentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    return data;
  }

  /**
   * Buscar pagos por usuario
   */
  async findByUserId(userId: string): Promise<Payment[]> {
    const { data, error } = await this.db
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Buscar pagos por CSP
   */
  async findByServicePointId(cspId: string): Promise<Payment[]> {
    const { data, error } = await this.db
      .from(this.tableName)
      .select("*")
      .eq("service_point_id", cspId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Buscar pagos por reserva
   */
  async findByBookingId(bookingId: string): Promise<Payment[]> {
    const { data, error } = await this.db
      .from(this.tableName)
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Buscar pagos por estado
   */
  async findByStatus(status: string, limit = 100, offset = 0): Promise<Payment[]> {
    const { data, error } = await this.db
      .rpc("get_payments_by_status", {
        p_status: status,
        p_limit: limit,
        p_offset: offset
      });

    if (error) throw error;
    return data || [];
  }

  /**
   * Buscar pagos con filtros avanzados
   */
  async findWithFilters(filters: PaymentFilters): Promise<Payment[]> {
    let query = this.db.from(this.tableName).select("*");

    if (filters.user_id) {
      query = query.eq("user_id", filters.user_id);
    }
    if (filters.service_point_id) {
      query = query.eq("service_point_id", filters.service_point_id);
    }
    if (filters.booking_id) {
      query = query.eq("booking_id", filters.booking_id);
    }
    if (filters.status) {
      query = query.eq("status", filters.status);
    }
    if (filters.payment_method) {
      query = query.eq("payment_method", filters.payment_method);
    }
    if (filters.min_amount) {
      query = query.gte("amount", filters.min_amount);
    }
    if (filters.max_amount) {
      query = query.lte("amount", filters.max_amount);
    }
    if (filters.start_date) {
      query = query.gte("created_at", filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte("created_at", filters.end_date);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * Actualizar estado del pago
   */
  async updateStatus(paymentId: string, status: string, paidAt?: string): Promise<Payment> {
    const updateData: Partial<Payment> = { status: status as Payment['status'] };
    if (paidAt) {
      updateData.paid_at = paidAt;
    }

    const { data, error } = await this.db
      .from(this.tableName)
      .update(updateData)
      .eq("id", paymentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Marcar pago como exitoso usando RPC
   */
  async markAsSucceeded(paymentId: string, stripeChargeId?: string): Promise<Payment> {
    const { error } = await this.db
      .rpc("mark_payment_as_succeeded", {
        p_payment_id: paymentId,
        p_stripe_charge_id: stripeChargeId || null
      });

    if (error) throw error;
    
    // Obtener el pago actualizado
    const { data: payment, error: fetchError } = await this.findById(paymentId);
    if (fetchError || !payment) {
      throw new Error(`Payment ${paymentId} not found after update`);
    }
    return payment;
  }

  /**
   * Obtener estadísticas de pagos
   */
  async getStats(
    cspId?: string,
    userId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<PaymentStats> {
    const { data, error } = await this.db
      .rpc("get_payment_stats", {
        p_service_point_id: cspId || null,
        p_user_id: userId || null,
        p_start_date: startDate || null,
        p_end_date: endDate || null
      });

    if (error) throw error;
    return data as PaymentStats;
  }

  /**
   * Obtener ingresos de un CSP
   */
  async getServicePointRevenue(
    cspId: string,
    startDate: string,
    endDate: string
  ): Promise<unknown> {
    const { data, error } = await this.db
      .rpc("get_csp_revenue", {
        p_service_point_id: cspId,
        p_start_date: startDate,
        p_end_date: endDate
      });

    if (error) throw error;
    return data;
  }

  /**
   * Obtener pagos pendientes de un usuario
   */
  async getPendingPayments(userId: string): Promise<Payment[]> {
    const { data, error } = await this.db
      .rpc("get_pending_payments", {
        p_user_id: userId
      });

    if (error) throw error;
    return data || [];
  }

  /**
   * Procesar reembolso usando RPC
   */
  async processRefund(refundData: CreateRefundDto & { stripe_refund_id?: string }): Promise<unknown> {
    const { data, error } = await this.db
      .rpc("process_refund", {
        p_payment_id: refundData.payment_id,
        p_refund_amount: refundData.amount || 0,
        p_reason: refundData.reason,
        p_stripe_refund_id: refundData.stripe_refund_id || null
      });

    if (error) throw error;
    return data;
  }

  /**
   * Obtener reembolsos de un pago
   */
  async getRefundsByPaymentId(paymentId: string): Promise<Refund[]> {
    const { data, error } = await this.db
      .from("refunds")
      .select("*")
      .eq("payment_id", paymentId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Actualizar metadata del pago
   */
  async updateMetadata(paymentId: string, metadata: Record<string, unknown>): Promise<Payment> {
    const { data, error } = await this.db
      .from(this.tableName)
      .update({ metadata })
      .eq("id", paymentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
