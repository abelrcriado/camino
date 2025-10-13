import { NextRequest } from "next/server";
import { AvailabilityController } from "@/controllers/availability.controller";


const controller = new AvailabilityController();

/**
 * @swagger
 * /api/csp/{id}/availability/check-slot:
 *   get:
 *     tags:
 *       - Availability
 *     summary: Verificar disponibilidad de un slot específico
 *     description: Verifica si un slot de tiempo específico está disponible para un servicio
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del CSP
 *       - in: query
 *         name: service_type
 *         required: true
 *         schema:
 *           type: string
 *         description: Tipo de servicio
 *         example: workshop
 *       - in: query
 *         name: slot_time
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha y hora del slot
 *         example: "2025-01-20T10:00:00Z"
 *       - in: query
 *         name: duration_minutes
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1440
 *           default: 60
 *         description: Duración del slot en minutos
 *         example: 60
 *     responses:
 *       200:
 *         description: Resultado de la verificación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 csp_id:
 *                   type: string
 *                   format: uuid
 *                 service_type:
 *                   type: string
 *                   example: workshop
 *                 slot_time:
 *                   type: string
 *                   format: date-time
 *                 duration_minutes:
 *                   type: integer
 *                   example: 60
 *                 is_available:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error del servidor
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return controller.checkSlotAvailability(req, context);
}

export default GET;
