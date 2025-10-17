/**
 * API Route: /api/payments/stats
 * Method: GET (get payment statistics)
 * 
 * @swagger
 * /api/payments/stats:
 *   get:
 *     summary: Obtener estadísticas de pagos
 *     description: Retorna métricas y estadísticas agregadas de pagos
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha inicio del rango
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha fin del rango
 *       - in: query
 *         name: group_by
 *         schema:
 *           type: string
 *           enum: [day, week, month, status, payment_method]
 *         description: Agrupar resultados por
 *     responses:
 *       200:
 *         description: Estadísticas de pagos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_amount:
 *                       type: number
 *                       description: Monto total en céntimos
 *                     total_count:
 *                       type: integer
 *                       description: Número total de pagos
 *                     successful_count:
 *                       type: integer
 *                     failed_count:
 *                       type: integer
 *                     refunded_count:
 *                       type: integer
 *                     by_status:
 *                       type: object
 *                     by_payment_method:
 *                       type: object
 *       400:
 *         description: Parámetros inválidos
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
