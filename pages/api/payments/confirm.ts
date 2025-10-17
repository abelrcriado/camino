/**
 * API Route: /api/payments/confirm
 * Method: POST (confirm payment after Stripe success)
 * 
 * @swagger
 * /api/payments/confirm:
 *   post:
 *     summary: Confirmar pago exitoso
 *     description: Confirma un pago después de recibir confirmación de Stripe
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payment_id
 *               - payment_intent_id
 *             properties:
 *               payment_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del pago en BD
 *               payment_intent_id:
 *                 type: string
 *                 description: ID del payment intent de Stripe
 *               transaction_id:
 *                 type: string
 *                 description: ID de transacción
 *     responses:
 *       200:
 *         description: Pago confirmado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Pago no encontrado
 *       500:
 *         description: Error interno
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { PaymentController } from "@/api/controllers/payment.controller";
import { PaymentService } from "@/api/services/payment.service";
import { PaymentRepository } from "@/api/repositories/payment.repository";
import { createClient } from "@supabase/supabase-js";
import { asyncHandler } from "@/api/middlewares/error-handler";

// Inicializar Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Inicializar dependencias
const repository = new PaymentRepository(supabase);
const service = new PaymentService(repository);
const controller = new PaymentController(service);

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  return controller.handle(req, res);
});
