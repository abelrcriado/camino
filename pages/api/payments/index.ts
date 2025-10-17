/**
 * API Route: /api/payments
 * Methods: GET (list/filter), POST (create payment intent)
 * 
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Obtener listado de pagos
 *     description: Lista pagos con filtros y paginación
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: booking_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pendiente, procesando, exitoso, fallido, reembolsado]
 *       - in: query
 *         name: payment_method
 *         schema:
 *           type: string
 *           enum: [card, bank_transfer, cash]
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Lista de pagos
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno
 *   post:
 *     summary: Crear intención de pago
 *     description: Crea un payment intent con Stripe
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - amount
 *               - currency
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *               booking_id:
 *                 type: string
 *                 format: uuid
 *               amount:
 *                 type: number
 *                 description: Monto en céntimos
 *               currency:
 *                 type: string
 *                 default: "eur"
 *               payment_method:
 *                 type: string
 *                 enum: [card, bank_transfer, cash]
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Payment intent creado
 *       400:
 *         description: Datos inválidos
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
