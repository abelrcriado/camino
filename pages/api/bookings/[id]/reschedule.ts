import type { NextApiRequest, NextApiResponse } from "next";
import { BookingController } from "@/api/controllers/booking.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";
import { ErrorMessages } from "@/shared/constants/error-messages";

/**
 * @swagger
 * /api/bookings/{id}/reschedule:
 *   put:
 *     summary: Reprogramar reserva
 *     description: Cambia la fecha/hora de una reserva existente
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la reserva a reprogramar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - booking_date
 *               - time_slot
 *             properties:
 *               booking_date:
 *                 type: string
 *                 format: date-time
 *                 description: Nueva fecha de la reserva
 *               time_slot:
 *                 type: string
 *                 description: Nuevo horario/slot
 *               start_time:
 *                 type: string
 *                 format: time
 *                 description: Hora de inicio (HH:mm)
 *               end_time:
 *                 type: string
 *                 format: time
 *                 description: Hora de fin (HH:mm)
 *     responses:
 *       200:
 *         description: Reserva reprogramada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *                   example: "Reserva reprogramada exitosamente"
 *       400:
 *         description: Datos inválidos o nueva fecha no disponible
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

  // Extract booking ID and new times from request
  const { id } = req.query;
  const { start_time, end_time } = req.body;

  // Send to main controller as a regular update
  req.body = { ...req.body, id, start_time, end_time };

  return controller.handle(req, res);
});
