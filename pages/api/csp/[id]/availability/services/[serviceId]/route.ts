import { NextRequest } from "next/server";
import { AvailabilityController } from "@/controllers/availability.controller";

const controller = new AvailabilityController();

/**
 * @swagger
 * /api/csp/{id}/availability/services/{serviceId}:
 *   patch:
 *     tags:
 *       - Availability
 *     summary: Actualizar disponibilidad de un servicio
 *     description: Actualiza el estado de disponibilidad de un servicio específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del CSP
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del servicio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_available:
 *                 type: boolean
 *                 description: Si el servicio está disponible
 *                 example: true
 *               available_slots:
 *                 type: integer
 *                 minimum: 0
 *                 description: Número de slots disponibles
 *                 example: 3
 *               next_available:
 *                 type: string
 *                 format: date-time
 *                 description: Próxima fecha/hora disponible
 *                 example: "2025-01-20T10:00:00Z"
 *               unavailable_reason:
 *                 type: string
 *                 description: Razón de no disponibilidad
 *                 example: "Fully booked"
 *           example:
 *             is_available: false
 *             available_slots: 0
 *             next_available: "2025-01-21T09:00:00Z"
 *             unavailable_reason: "Fully booked for today"
 *     responses:
 *       200:
 *         description: Disponibilidad actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceAvailability'
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string; serviceId: string }> }
) {
  return controller.updateServiceAvailability(req, context);
}

export default PATCH;
