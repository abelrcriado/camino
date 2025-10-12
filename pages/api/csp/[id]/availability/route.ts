import { NextRequest } from "next/server";
import { AvailabilityController } from "@/controllers/availability.controller";

const controller = new AvailabilityController();

/**
 * @swagger
 * /api/csp/{id}/availability:
 *   get:
 *     tags:
 *       - Availability
 *     summary: Obtener estado de disponibilidad completo de un CSP
 *     description: Retorna el estado completo de disponibilidad incluyendo horarios, cierres y servicios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del CSP
 *         example: 00000000-0000-0000-0000-000000000100
 *       - in: query
 *         name: check_time
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Momento específico para verificar disponibilidad (default: ahora)
 *         example: 2025-01-20T15:30:00Z
 *     responses:
 *       200:
 *         description: Estado de disponibilidad del CSP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CSPAvailabilityStatus'
 *       400:
 *         description: Parámetros inválidos
 *       404:
 *         description: CSP no encontrado
 *       500:
 *         description: Error del servidor
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return controller.getCSPAvailability(req, context);
}

export default GET;
