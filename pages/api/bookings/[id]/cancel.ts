import type { NextApiRequest, NextApiResponse } from "next";
import { BookingController } from "@/api/controllers/booking.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";
import { ErrorMessages } from "@/shared/constants/error-messages";

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   put:
 *     summary: Cancelar reserva
 *     description: Cambia el estado de una reserva a "cancelada"
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la reserva a cancelar
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancellation_reason:
 *                 type: string
 *                 description: Motivo de cancelación (opcional)
 *     responses:
 *       200:
 *         description: Reserva cancelada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *                   example: "Reserva cancelada exitosamente"
 *       400:
 *         description: ID inválido o reserva no puede ser cancelada
 *       404:
 *         description: Reserva no encontrada
 *       405:
 *         description: Método no permitido (solo PUT)
 *       500:
 *         description: Error interno del servidor
 */

const controller = new BookingController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({
      success: false,
      error: ErrorMessages.METHOD_NOT_ALLOWED,
    });
  }

  // Extract booking ID from query params
  const { id } = req.query;

  // Redirect to main controller with action=cancel
  req.query.action = "cancel";
  req.body = { ...req.body, id };

  return controller.handle(req, res);
});
