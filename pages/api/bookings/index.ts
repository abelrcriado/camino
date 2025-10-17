import type { NextApiRequest, NextApiResponse } from "next";
import { BookingController } from "@/api/controllers/booking.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Obtener listado de reservas
 *     description: Obtiene reservas con filtros, paginación y acciones especiales (upcoming, active, user-status)
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Resultados por página
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de usuario
 *       - in: query
 *         name: service_point_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por punto de servicio
 *       - in: query
 *         name: workshop_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por taller
 *       - in: query
 *         name: service_type
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de servicio
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pendiente, confirmada, cancelada, completada]
 *         description: Filtrar por estado
 *       - in: query
 *         name: payment_status
 *         schema:
 *           type: string
 *           enum: [pendiente, pagado, reembolsado]
 *         description: Filtrar por estado de pago
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha inicio rango
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha fin rango
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [upcoming, active, user-status]
 *         description: Acción especial (upcoming=próximas X días, active=activas ahora, user-status=por usuario y estado)
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Días futuros para action=upcoming
 *     responses:
 *       200:
 *         description: Lista de reservas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 *   post:
 *     summary: Crear nueva reserva
 *     description: Crea una reserva para un servicio en un taller o punto de servicio
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - service_point_id
 *               - service_type
 *               - booking_date
 *               - time_slot
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *               service_point_id:
 *                 type: string
 *                 format: uuid
 *               workshop_id:
 *                 type: string
 *                 format: uuid
 *               service_type:
 *                 type: string
 *               booking_date:
 *                 type: string
 *                 format: date-time
 *               time_slot:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pendiente, confirmada, cancelada, completada]
 *                 default: pendiente
 *               payment_status:
 *                 type: string
 *                 enum: [pendiente, pagado, reembolsado]
 *                 default: pendiente
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 *   put:
 *     summary: Actualizar reserva existente
 *     description: Actualiza los datos de una reserva por ID
 *     tags: [Bookings]
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
 *               booking_date:
 *                 type: string
 *                 format: date-time
 *               time_slot:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pendiente, confirmada, cancelada, completada]
 *               payment_status:
 *                 type: string
 *                 enum: [pendiente, pagado, reembolsado]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reserva actualizada
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Reserva no encontrada
 *       500:
 *         description: Error interno del servidor
 *   delete:
 *     summary: Eliminar reserva
 *     description: Elimina una reserva por ID (soft delete)
 *     tags: [Bookings]
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
 *       200:
 *         description: Reserva eliminada
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Reserva no encontrada
 *       500:
 *         description: Error interno del servidor
 */

const controller = new BookingController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  return controller.handle(req, res);
});
