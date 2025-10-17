import { NextRequest } from "next/server";
import { AvailabilityController } from "@/api/controllers/availability.controller";


const controller = new AvailabilityController();

/**
 * @swagger
 * /api/csp/{id}/availability/is-open:
 *   get:
 *     tags:
 *       - Availability
 *     summary: Verificar si un CSP está abierto
 *     description: Verifica si un CSP está actualmente abierto o lo estará en un momento específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del CSP
 *       - in: query
 *         name: check_time
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Momento a verificar (default: ahora)
 *     responses:
 *       200:
 *         description: Estado de apertura del CSP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 csp_id:
 *                   type: string
 *                   format: uuid
 *                 is_open:
 *                   type: boolean
 *                   example: true
 *                 checked_at:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Error del servidor
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return controller.checkIfCSPIsOpen(req, context);
}

export default GET;
