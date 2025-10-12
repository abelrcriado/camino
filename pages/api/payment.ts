// CRUD endpoints para Payment - Clean Architecture
import type { NextApiRequest, NextApiResponse } from "next";
import { PaymentController } from "../../src/controllers/payment.controller";

/**
 * @swagger
 * /api/payment:
 *   get:
 *     summary: Obtener todos los pagos
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar pagos por usuario
 *       - in: query
 *         name: booking_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar pagos por reserva
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, refunded, cancelled]
 *         description: Filtrar por estado del pago
 *     responses:
 *       200:
 *         description: Lista de pagos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error del servidor
 *   post:
 *     summary: Crear nuevo pago
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
 *               - payment_method
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *               booking_id:
 *                 type: string
 *                 format: uuid
 *               amount:
 *                 type: number
 *                 format: decimal
 *               currency:
 *                 type: string
 *                 default: EUR
 *               payment_method:
 *                 type: string
 *                 enum: [credit_card, debit_card, paypal, bank_transfer, cash]
 *               status:
 *                 type: string
 *                 enum: [pending, completed, failed, refunded, cancelled]
 *               transaction_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pago creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 *   put:
 *     summary: Actualizar pago existente
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               status:
 *                 type: string
 *                 enum: [pending, completed, failed, refunded, cancelled]
 *               transaction_id:
 *                 type: string
 *               completed_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Pago actualizado exitosamente
 *       400:
 *         description: ID no proporcionado o inválido
 *       500:
 *         description: Error del servidor
 *   delete:
 *     summary: Eliminar pago
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       204:
 *         description: Pago eliminado exitosamente
 *       400:
 *         description: ID no proporcionado o inválido
 *       500:
 *         description: Error del servidor
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const controller = new PaymentController();
  return controller.handle(req, res);
}

export default handler;
