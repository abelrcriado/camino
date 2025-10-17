/**
 * API Route: /api/webhook/stripe
 * Method: POST (receive Stripe webhook events)
 *
 * IMPORTANT: This endpoint must have raw body parsing enabled
 * for Stripe signature verification to work
 *
 * @swagger
 * /api/webhook/stripe:
 *   post:
 *     summary: Webhook de Stripe
 *     description: |
 *       Recibe eventos de webhooks de Stripe para procesar pagos, reembolsos y actualizaciones de estado.
 *       Este endpoint verifica la firma de Stripe para garantizar autenticidad de los eventos.
 *
 *       **Eventos soportados:**
 *       - payment_intent.succeeded - Pago completado exitosamente
 *       - payment_intent.payment_failed - Pago fallido
 *       - charge.refunded - Reembolso procesado
 *       - payment_intent.canceled - Pago cancelado
 *
 *       **Importante:** Este endpoint desactiva el bodyParser predeterminado de Next.js
 *       para permitir la verificación de firma de Stripe con el raw body.
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Evento de Stripe (formato interno de Stripe)
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID del evento de Stripe
 *               type:
 *                 type: string
 *                 enum:
 *                   - payment_intent.succeeded
 *                   - payment_intent.payment_failed
 *                   - charge.refunded
 *                   - payment_intent.canceled
 *                 description: Tipo de evento
 *               data:
 *                 type: object
 *                 description: Datos del evento (PaymentIntent, Charge, etc.)
 *     responses:
 *       200:
 *         description: Evento procesado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Firma de Stripe inválida o datos malformados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Webhook signature verification failed"
 *       405:
 *         description: Método no permitido (solo POST)
 *       500:
 *         description: Error interno al procesar el evento
 *     security:
 *       - StripeSignature: []
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     StripeSignature:
 *       type: apiKey
 *       in: header
 *       name: stripe-signature
 *       description: Firma HMAC de Stripe para verificar autenticidad del webhook
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { PaymentController } from "@/api/controllers/payment.controller";
import { PaymentService } from "@/api/services/payment.service";
import { PaymentRepository } from "@/api/repositories/payment.repository";
import { createClient } from "@supabase/supabase-js";
import { buffer } from "micro";
import { asyncHandler } from "@/api/middlewares/error-handler";
import { ErrorMessages } from "@/shared/constants/error-messages";

// Disable default body parsing so we can get raw body for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Inicializar Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Inicializar dependencias
const repository = new PaymentRepository(supabase);
const service = new PaymentService(repository);
const controller = new PaymentController(service);

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
  }

  // Get raw body as buffer for Stripe signature verification
  const buf = await buffer(req);
  const rawBody = buf.toString("utf8");

  // Replace req.body with the raw string
  (req as NextApiRequest & { body: string }).body = rawBody;

  return controller.handle(req, res);
});
