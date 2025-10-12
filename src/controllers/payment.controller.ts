// Controller para manejo de requests HTTP de Payment (Stripe integration)
import type { NextApiRequest, NextApiResponse } from "next";
import { PaymentService } from "../services/payment.service";
import type {
  CreatePaymentDto,
  UpdatePaymentDto,
  CreateRefundDto,
  PaymentFilters,
  StripeWebhookEvent,
} from "../dto/payment.dto";

// Esquemas de validación Zod centralizados
import {
  createPaymentSchema,
  updatePaymentSchema,
  deletePaymentSchema,
  queryPaymentSchema,
} from "../schemas/payment.schema";
import { z } from "zod";

// Esquemas específicos para rutas de Payment no estándar
const CreateRefundSchema = z.object({
  payment_id: z.string().uuid(),
  amount: z.number().positive().optional(),
  reason: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const ConfirmPaymentSchema = z.object({
  stripe_payment_intent_id: z.string(),
  stripe_charge_id: z.string().optional(),
});

export class PaymentController {
  private service: PaymentService;

  constructor(service?: PaymentService) {
    this.service = service || new PaymentService();
  }

  /**
   * Handler principal que enruta según el método HTTP y path
   */
  async handle(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const startTime = Date.now();

    try {
      // Rutas especiales
      if (req.url?.includes("/webhook/stripe")) {
        return await this.handleWebhook(req, res, startTime);
      }

      if (req.url?.includes("/stats")) {
        return await this.getStats(req, res, startTime);
      }

      if (req.url?.includes("/refund")) {
        return await this.createRefund(req, res, startTime);
      }

      if (req.url?.includes("/confirm")) {
        return await this.confirmPayment(req, res, startTime);
      }

      if (req.url?.includes("/cancel")) {
        return await this.cancelPayment(req, res, startTime);
      }

      // Rutas estándar CRUD
      switch (req.method) {
        case "GET":
          return await this.getAll(req, res, startTime);
        case "POST":
          return await this.create(req, res, startTime);
        case "PUT":
          return await this.update(req, res, startTime);
        case "DELETE":
          return await this.delete(req, res, startTime);
        default:
          res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
          return res.status(405).json({
            error: `Method ${req.method} Not Allowed`,
          });
      }
    } catch (error) {
      return this.handleError(error, res, startTime);
    }
  }

  /**
   * GET - Obtener pagos con filtros
   */
  private async getAll(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    // Validar parámetros de query con schema centralizado
    const queryValidation = queryPaymentSchema.safeParse(req.query);
    if (!queryValidation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Parámetros de query inválidos",
        details: queryValidation.error.issues,
      });
    }

    const validatedQuery = queryValidation.data || {};

    // Si hay un ID específico en la URL, buscar por ID
    if (req.url?.match(/\/api\/payments\/[a-f0-9-]+$/)) {
      const paymentId = req.url.split("/").pop();
      if (paymentId) {
        const payment = await this.service.findById(paymentId);
        if (!payment) {
          this.logRequest(req, 404, startTime);
          return res.status(404).json({ error: "Payment not found" });
        }
        this.logRequest(req, 200, startTime);
        return res.status(200).json(payment);
      }
    }

    // Routing específico según query parameters (consistente con otros controladores)
    const { user_id, booking_id, status } = validatedQuery;

    // Si hay user_id, buscar por usuario
    if (user_id) {
      const payments = await this.service.findByUser(user_id);
      this.logRequest(req, 200, startTime);
      return res.status(200).json(payments);
    }

    // Si hay booking_id, buscar por booking
    if (booking_id) {
      const payments = await this.service.findByBooking(booking_id);
      this.logRequest(req, 200, startTime);
      return res.status(200).json(payments);
    }

    // Si hay status, buscar por estado
    if (status) {
      const payments = await this.service.findByStatus(
        status as
          | "pending"
          | "processing"
          | "succeeded"
          | "failed"
          | "canceled"
          | "refunded"
          | "partially_refunded"
      );
      this.logRequest(req, 200, startTime);
      return res.status(200).json(payments);
    }

    // Si no hay filtros específicos, usar findWithFilters con todos los parámetros
    const {
      service_point_id,
      payment_method,
      min_amount,
      max_amount,
      start_date,
      end_date,
    } = req.query;

    // Construir filtros combinando validación centralizada con parámetros adicionales
    const filters: PaymentFilters = validatedQuery as PaymentFilters;

    // Agregar campos adicionales específicos de Stripe/Payment
    if (service_point_id && typeof service_point_id === "string")
      filters.service_point_id = service_point_id;
    if (payment_method && typeof payment_method === "string")
      filters.payment_method =
        payment_method as PaymentFilters["payment_method"];
    if (min_amount && typeof min_amount === "string")
      filters.min_amount = Number(min_amount);
    if (max_amount && typeof max_amount === "string")
      filters.max_amount = Number(max_amount);
    if (start_date && typeof start_date === "string")
      filters.start_date = start_date;
    if (end_date && typeof end_date === "string") filters.end_date = end_date;

    const payments = await this.service.findWithFilters(filters);

    this.logRequest(req, 200, startTime);
    return res.status(200).json(payments);
  }

  /**
   * POST - Crear nuevo Payment Intent en Stripe y registro en BD
   */
  private async create(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    // Validar datos con Zod
    const validation = createPaymentSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: CreatePaymentDto = validation.data as any; // TODO: Alinear schema con DTO
    const paymentIntent = await this.service.createPaymentIntent(data);

    this.logRequest(req, 201, startTime);
    return res.status(201).json(paymentIntent);
  }

  /**
   * POST - Confirmar pago después de que Stripe lo complete
   */
  private async confirmPayment(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const validation = ConfirmPaymentSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const { stripe_payment_intent_id, stripe_charge_id } = validation.data;
    const payment = await this.service.confirmPayment(
      stripe_payment_intent_id,
      stripe_charge_id
    );

    this.logRequest(req, 200, startTime);
    return res.status(200).json(payment);
  }

  /**
   * PUT - Actualizar pago
   */
  private async update(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    // Extraer ID de la URL
    const paymentId = req.url?.split("/").pop();

    if (!paymentId) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "ID no proporcionado en la URL",
      });
    }

    // Validar datos con Zod
    const validation = updatePaymentSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const data: UpdatePaymentDto = validation.data as UpdatePaymentDto;
    const payment = await this.service.updatePayment(paymentId, data);

    this.logRequest(req, 200, startTime);
    return res.status(200).json([payment]);
  }

  /**
   * DELETE - Eliminar pago
   */
  private async delete(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const validation = deletePaymentSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const { id } = validation.data;

    // Verificar que el pago existe antes de eliminar
    const existingPayment = await this.service.findById(id);
    if (!existingPayment) {
      this.logRequest(req, 404, startTime);
      return res.status(404).json({
        error: "Pago no encontrado",
      });
    }

    // Usar el método delete heredado de BaseService
    await this.service.delete(id);

    this.logRequest(req, 204, startTime);
    return res.status(204).end();
  }

  /**
   * POST - Crear reembolso
   */
  private async createRefund(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const validation = CreateRefundSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const data: CreateRefundDto = validation.data;
    const result = await this.service.processRefund(data);

    this.logRequest(req, 201, startTime);
    return res.status(201).json(result);
  }

  /**
   * POST - Cancelar pago pendiente
   */
  private async cancelPayment(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const { payment_id } = req.body;

    if (!payment_id || typeof payment_id !== "string") {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "payment_id es requerido",
      });
    }

    const payment = await this.service.cancelPayment(payment_id);

    this.logRequest(req, 200, startTime);
    return res.status(200).json(payment);
  }

  /**
   * GET - Obtener estadísticas de pagos
   */
  private async getStats(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const { service_point_id, user_id, start_date, end_date } = req.query;

    const stats = await this.service.getStats(
      service_point_id && typeof service_point_id === "string"
        ? service_point_id
        : undefined,
      user_id && typeof user_id === "string" ? user_id : undefined,
      start_date && typeof start_date === "string" ? start_date : undefined,
      end_date && typeof end_date === "string" ? end_date : undefined
    );

    this.logRequest(req, 200, startTime);
    return res.status(200).json(stats);
  }

  /**
   * POST - Webhook de Stripe
   */
  private async handleWebhook(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const signature = req.headers["stripe-signature"];

    if (!signature || typeof signature !== "string") {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Firma de webhook no proporcionada",
      });
    }

    try {
      // Obtener el body raw (debe ser string o Buffer)
      const payload =
        typeof req.body === "string" ? req.body : JSON.stringify(req.body);

      // Verificar firma
      const event = this.service.verifyWebhookSignature(payload, signature);

      // Procesar evento
      await this.service.handleWebhook(event as StripeWebhookEvent);

      this.logRequest(req, 200, startTime);
      return res.status(200).json({ received: true });
    } catch (error) {
      console.error("[Webhook Error]:", error);
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: error instanceof Error ? error.message : "Webhook error",
      });
    }
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(
    error: unknown,
    res: NextApiResponse,
    startTime: number
  ): void {
    console.error("[PaymentController Error]:", error);

    const duration = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] ERROR - Duration: ${duration}ms - ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }

      if (
        error.message.includes("validación") ||
        error.message.includes("validation") ||
        error.message.includes("required")
      ) {
        return res.status(400).json({ error: error.message });
      }

      if (error.message.includes("Stripe")) {
        return res.status(402).json({ error: error.message });
      }
    }

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }

  /**
   * Logger de requests
   */
  private logRequest(
    req: NextApiRequest,
    statusCode: number,
    startTime: number
  ): void {
    const duration = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${
        req.url
      } - ${statusCode} - ${duration}ms`
    );
  }
}
