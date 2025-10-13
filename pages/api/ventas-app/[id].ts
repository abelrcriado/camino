// Endpoint para obtener detalle de una venta específica
import type { NextApiRequest, NextApiResponse } from "next";
import { VentaAppController } from "@/controllers/venta_app.controller";
import { asyncHandler } from "@/middlewares/error-handler";
import { validateUUID } from "@/middlewares/validate-uuid";
import { ErrorMessages } from "@/constants/error-messages";

/**
 * @swagger
 * /api/ventas-app/{id}:
 *   get:
 *     summary: Obtener detalle de venta
 *     description: Obtiene información completa de una venta específica por ID
 *     tags: [Ventas App]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la venta
 *     responses:
 *       200:
 *         description: Detalle de la venta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 user_id:
 *                   type: string
 *                   format: uuid
 *                 slot_id:
 *                   type: string
 *                   format: uuid
 *                 cantidad:
 *                   type: integer
 *                 precio_unitario:
 *                   type: number
 *                 precio_total:
 *                   type: number
 *                 estado:
 *                   type: string
 *                   enum: [reservada, pagada, retirada, cancelada, expirada]
 *                 codigo_retiro:
 *                   type: string
 *                 fecha_reserva:
 *                   type: string
 *                   format: date-time
 *                 fecha_pago:
 *                   type: string
 *                   format: date-time
 *                 fecha_retiro:
 *                   type: string
 *                   format: date-time
 *                 fecha_expiracion:
 *                   type: string
 *                   format: date-time
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Venta no encontrada
 *       405:
 *         description: Método no permitido
 *       500:
 *         description: Error interno del servidor
 */
export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
  }

  const { id } = req.query;

  // Validar UUID usando utilidad centralizada
  const validationError = validateUUID(id, "venta");
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  // Delegar al controller con ID inyectado
  req.query = { ...req.query, id };
  const controller = new VentaAppController();
  return controller.handle(req, res);
});
