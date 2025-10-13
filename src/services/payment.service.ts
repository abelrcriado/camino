/**
 * Service para Payment - lógica de negocio con integración Stripe
 */

import logger from "@/config/logger";
import { config } from "@/config/app.config";
import Stripe from "stripe";
import { BaseService } from "./base.service";
import { PaymentRepository } from "../repositories/payment.repository";
import {
  NotFoundError,
  ValidationError,
  BusinessRuleError,
  DatabaseError,
} from "@/errors/custom-errors";
import {
  Payment,
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentIntentResponse,
  CreateRefundDto,
  PaymentFilters,
  PaymentStats,
  StripeWebhookEvent,
  PaymentStatus,
} from "../dto/payment.dto";

// Configuración de Stripe
const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: "2025-09-30.clover",
});

// Configuración de comisiones
const PLATFORM_FEE_PERCENTAGE = 0.15; // 15% de comisión plataforma

export class PaymentService extends BaseService<Payment> {
  private stripe: Stripe;

  constructor(repository?: PaymentRepository) {
    super(repository || new PaymentRepository());
    this.stripe = stripe;
  }

  /**
   * Getter privado para acceder al repository con tipos específicos
   */
  private get paymentRepository(): PaymentRepository {
    return this.repository as PaymentRepository;
  }

  /**
   * Calcular comisión de la plataforma
   */
  private calculatePlatformFee(amount: number): number {
    return Math.round(amount * PLATFORM_FEE_PERCENTAGE);
  }

  /**
   * Calcular monto para el CSP (después de comisión)
   */
  private calculateCSPAmount(amount: number, platformFee: number): number {
    return amount - platformFee;
  }

  /**
   * Crear Payment Intent en Stripe y guardar pago en BD
   */
  async createPaymentIntent(
    data: CreatePaymentDto
  ): Promise<PaymentIntentResponse> {
    // Validaciones
    if (!data.booking_id || !data.user_id || !data.service_point_id) {
      throw new ValidationError(
        "Missing required fields: booking_id, user_id, service_point_id"
      );
    }

    if (data.amount <= 0) {
      throw new ValidationError("Amount must be greater than 0");
    }

    // Calcular comisiones
    const platformFee = this.calculatePlatformFee(data.amount);
    const cspAmount = this.calculateCSPAmount(data.amount, platformFee);

    // Crear Payment Intent en Stripe
    const paymentIntentData: Stripe.PaymentIntentCreateParams = {
      amount: data.amount,
      currency: data.currency || "eur",
      payment_method_types: ["card"],
      description: data.description || `Payment for booking ${data.booking_id}`,
      metadata: {
        booking_id: data.booking_id,
        user_id: data.user_id,
        service_point_id: data.service_point_id,
        platform_fee: platformFee.toString(),
        csp_amount: cspAmount.toString(),
        ...(data.metadata || {}),
      },
    };

    const paymentIntent = await this.stripe.paymentIntents.create(
      paymentIntentData
    );

    // Guardar pago en base de datos
    const paymentData: Partial<Payment> = {
      booking_id: data.booking_id,
      user_id: data.user_id,
      service_point_id: data.service_point_id,
      amount: data.amount,
      currency: data.currency || "eur",
      stripe_payment_intent_id: paymentIntent.id,
      payment_method: data.payment_method || "card",
      status: "pending",
      platform_fee: platformFee,
      csp_amount: cspAmount,
      description: data.description || null,
      metadata: data.metadata || null,
      refunded_amount: 0,
      refund_reason: null,
    };

    const { data: payment, error } = await this.paymentRepository.create(
      paymentData
    );

    if (error || !payment || !payment[0]) {
      // Si falla, cancelar el Payment Intent en Stripe
      await this.stripe.paymentIntents.cancel(paymentIntent.id);
      throw new DatabaseError("Failed to create payment", {
        originalError: error?.message,
      });
    }

    return {
      payment_id: payment[0].id,
      client_secret: paymentIntent.client_secret!,
      stripe_payment_intent_id: paymentIntent.id,
      amount: data.amount,
      currency: data.currency || "eur",
      status: "pending",
    };
  }

  /**
   * Confirmar pago (webhook de Stripe o confirmación manual)
   */
  async confirmPayment(
    stripePaymentIntentId: string,
    stripeChargeId?: string
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findByStripePaymentIntentId(
      stripePaymentIntentId
    );

    if (!payment) {
      throw new NotFoundError(
        "Payment",
        `Stripe Payment Intent: ${stripePaymentIntentId}`
      );
    }

    // Marcar como exitoso usando la función RPC
    return this.paymentRepository.markAsSucceeded(payment.id, stripeChargeId);
  }

  /**
   * Procesar reembolso
   */
  async processRefund(refundData: CreateRefundDto): Promise<unknown> {
    const payment = await this.findById(refundData.payment_id);

    if (!payment) {
      throw new NotFoundError("Payment", refundData.payment_id);
    }

    if (payment.status !== "succeeded") {
      throw new BusinessRuleError(
        `Cannot refund payment with status: ${payment.status}`
      );
    }

    // Calcular monto del reembolso
    const refundAmount =
      refundData.amount || payment.amount - payment.refunded_amount;

    if (refundAmount <= 0) {
      throw new ValidationError("Refund amount must be greater than 0");
    }

    if (payment.refunded_amount + refundAmount > payment.amount) {
      throw new ValidationError("Refund amount exceeds payment amount");
    }

    // Crear reembolso en Stripe
    let stripeRefund: Stripe.Refund | null = null;
    if (payment.stripe_payment_intent_id) {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: payment.stripe_payment_intent_id,
        amount: refundAmount,
        reason: "requested_by_customer",
      };

      // Solo agregar metadata si es un objeto válido
      if (refundData.metadata && Object.keys(refundData.metadata).length > 0) {
        refundParams.metadata = refundData.metadata as Stripe.MetadataParam;
      }

      stripeRefund = await this.stripe.refunds.create(refundParams);
    }

    // Procesar reembolso en BD usando RPC
    return this.paymentRepository.processRefund({
      ...refundData,
      amount: refundAmount,
      stripe_refund_id: stripeRefund?.id,
    });
  }

  /**
   * Manejar webhook de Stripe
   */
  async handleWebhook(event: StripeWebhookEvent): Promise<void> {
    switch (event.type) {
      case "payment_intent.succeeded":
        await this.handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case "payment_intent.payment_failed":
        await this.handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case "charge.refunded":
        await this.handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        logger.info(`Unhandled webhook event type: ${event.type}`);
    }
  }

  /**
   * Handler para payment_intent.succeeded
   */
  private async handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    // Para obtener el charge ID necesitamos hacer una llamada adicional o recibirlo desde expanded
    await this.confirmPayment(paymentIntent.id, undefined);
  }

  /**
   * Handler para payment_intent.payment_failed
   */
  private async handlePaymentIntentFailed(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    const payment = await this.paymentRepository.findByStripePaymentIntentId(
      paymentIntent.id
    );

    if (payment) {
      await this.paymentRepository.updateStatus(payment.id, "failed");
    }
  }

  /**
   * Handler para charge.refunded
   */
  private async handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
    if (!charge.payment_intent) return;

    const paymentIntentId =
      typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : charge.payment_intent.id;

    const payment = await this.paymentRepository.findByStripePaymentIntentId(
      paymentIntentId
    );

    if (payment) {
      // El reembolso ya fue procesado por la función RPC process_refund
      // Aquí solo actualizamos metadata si es necesario
      logger.info(`Refund processed for payment ${payment.id}`);
    }
  }

  /**
   * Crear pago (implementación específica que hereda de BaseService)
   */
  async createPayment(data: CreatePaymentDto): Promise<Payment> {
    return this.create(data);
  }

  /**
   * Actualizar pago (implementación específica que hereda de BaseService)
   */
  async updatePayment(
    paymentId: string,
    data: UpdatePaymentDto
  ): Promise<Payment> {
    return this.update(paymentId, data);
  }

  /**
   * Obtener pagos por usuario
   */
  async findByUser(userId: string): Promise<Payment[]> {
    return this.paymentRepository.findByUserId(userId);
  }

  /**
   * Obtener pagos por booking
   */
  async findByBooking(bookingId: string): Promise<Payment[]> {
    return this.paymentRepository.findByBookingId(bookingId);
  }

  /**
   * Obtener pagos por estado
   */
  async findByStatus(status: PaymentStatus): Promise<Payment[]> {
    return this.paymentRepository.findWithFilters({ status });
  }

  /**
   * Obtener pago por ID (override del BaseService)
   */
  async findById(paymentId: string): Promise<Payment> {
    const { data, error } = await this.paymentRepository.findById(paymentId);

    if (error) {
      throw new DatabaseError("Error al obtener payment", {
        originalError: error.message,
      });
    }

    if (!data) {
      throw new NotFoundError("Payment", paymentId);
    }

    return data as Payment;
  }

  /**
   * Obtener pagos por usuario
   */
  async findByUserId(userId: string): Promise<Payment[]> {
    return this.paymentRepository.findByUserId(userId);
  }

  /**
   * Obtener pagos por CSP
   */
  async findByServicePointId(cspId: string): Promise<Payment[]> {
    return this.paymentRepository.findByServicePointId(cspId);
  }

  /**
   * Obtener pagos por booking
   */
  async findByBookingId(bookingId: string): Promise<Payment[]> {
    return this.paymentRepository.findByBookingId(bookingId);
  }

  /**
   * Buscar pagos con filtros
   */
  async findWithFilters(filters: PaymentFilters): Promise<Payment[]> {
    return this.paymentRepository.findWithFilters(filters);
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
    return this.paymentRepository.getStats(cspId, userId, startDate, endDate);
  }

  /**
   * Obtener ingresos de un CSP
   */
  async getServicePointRevenue(
    cspId: string,
    startDate: string,
    endDate: string
  ): Promise<unknown> {
    return this.paymentRepository.getServicePointRevenue(
      cspId,
      startDate,
      endDate
    );
  }

  /**
   * Obtener pagos pendientes
   */
  async getPendingPayments(userId: string): Promise<Payment[]> {
    return this.paymentRepository.getPendingPayments(userId);
  }

  /**
   * Cancelar pago
   */
  async cancelPayment(paymentId: string): Promise<Payment> {
    const payment = await this.findById(paymentId);

    if (!payment) {
      throw new NotFoundError("Payment", paymentId);
    }

    if (payment.status !== "pending") {
      throw new BusinessRuleError(
        `Cannot cancel payment with status: ${payment.status}`
      );
    }

    // Cancelar en Stripe si existe
    if (payment.stripe_payment_intent_id) {
      await this.stripe.paymentIntents.cancel(payment.stripe_payment_intent_id);
    }

    // Actualizar estado en BD
    return this.paymentRepository.updateStatus(paymentId, "canceled");
  }

  /**
   * Verificar firma de webhook de Stripe
   */
  verifyWebhookSignature(
    payload: string,
    signature: string
  ): StripeWebhookEvent {
    const webhookSecret = config.stripe.webhookSecret;

    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      ) as StripeWebhookEvent;
    } catch (error) {
      throw new ValidationError(
        `Webhook signature verification failed: ${(error as Error).message}`
      );
    }
  }
}
