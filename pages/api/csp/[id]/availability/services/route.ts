import { NextRequest } from "next/server";
import { AvailabilityController } from "@/controllers/availability.controller";


const controller = new AvailabilityController();

/**
 * @swagger
 * /api/csp/{id}/availability/services:
 *   get:
 *     tags:
 *       - Availability
 *     summary: Obtener disponibilidad de servicios
 *     description: Retorna el estado de disponibilidad de todos los servicios de un CSP
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
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de servicio específico
 *         example: workshop
 *     responses:
 *       200:
 *         description: Lista de disponibilidad de servicios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 csp_id:
 *                   type: string
 *                   format: uuid
 *                 services:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ServiceAvailability'
 *       500:
 *         description: Error del servidor
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return controller.getServiceAvailability(req, context);
}

export default GET;
