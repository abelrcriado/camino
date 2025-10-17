// CRUD endpoints para Booking - Clean Architecture
import type { NextApiRequest, NextApiResponse } from "next";
import { BookingController } from "@/api/controllers/booking.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";

/**
 * @swagger
 * /api/booking:
 *   get:
 *     summary: Listar bookings con paginación y filtros
 *     description: Obtiene una lista paginada de reservas con opciones de filtrado avanzado
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Cantidad de resultados por página
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
 *         description: Filtrar por ID de punto de servicio
 *       - in: query
 *         name: workshop_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de taller
 *       - in: query
 *         name: service_type
 *         schema:
 *           type: string
 *           enum: [maintenance, repair, wash, parking, other]
 *         description: Filtrar por tipo de servicio
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed]
 *         description: Filtrar por estado
 *       - in: query
 *         name: payment_status
 *         schema:
 *           type: string
 *           enum: [pending, paid, refunded]
 *         description: Filtrar por estado de pago
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtrar bookings desde esta fecha
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtrar bookings hasta esta fecha
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [upcoming, active, user-status]
 *         description: Acción especial (upcoming, active, user-status)
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Para action=upcoming, número de días hacia adelante
 *     responses:
 *       200:
 *         description: Lista de bookings obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 *       500:
 *         description: Error interno del servidor
 *   post:
 *     summary: Crear un nuevo booking
 *     description: Crea una nueva reserva de servicio con validaciones
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - start_time
 *               - end_time
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
 *                 enum: [maintenance, repair, wash, parking, other]
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled, completed]
 *               payment_status:
 *                 type: string
 *                 enum: [pending, paid, refunded]
 *               estimated_cost:
 *                 type: number
 *               actual_cost:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error interno del servidor
 *   put:
 *     summary: Actualizar un booking existente
 *     description: Actualiza los datos de una reserva existente
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [cancel, confirm, complete]
 *         description: Acción especial (cancel, confirm, complete)
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
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *               payment_status:
 *                 type: string
 *               estimated_cost:
 *                 type: number
 *               actual_cost:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Booking no encontrado
 *       500:
 *         description: Error interno del servidor
 *   delete:
 *     summary: Eliminar un booking
 *     description: Elimina una reserva existente
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
 *       204:
 *         description: Booking eliminado exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Booking no encontrado
 *       500:
 *         description: Error interno del servidor
 */
export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const controller = new BookingController();
  return controller.handle(req, res);
});
