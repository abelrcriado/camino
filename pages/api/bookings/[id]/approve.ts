import type { NextApiRequest, NextApiResponse } from "next";
import { BookingController } from "@/api/controllers/booking.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";
import { ErrorMessages } from "@/shared/constants/error-messages";

/**
 * @swagger
 * /api/bookings/{id}/approve:
 *   put:
 *     summary: Aprobar/confirmar reserva
 *     description: Cambia el estado de una reserva a "confirmada"
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la reserva a aprobar
 *     responses:
 *       200:
 *         description: Reserva aprobada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *                   example: "Reserva confirmada exitosamente"
 *       400:
 *         description: ID inválido o reserva no puede ser confirmada
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

  // Redirect to main controller with action=confirm
  req.query.action = "confirm";
  req.body = { ...req.body, id };

  return controller.handle(req, res);
});
