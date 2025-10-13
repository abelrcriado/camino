import { NextRequest } from "next/server";
import { AvailabilityController } from "@/controllers/availability.controller";


const controller = new AvailabilityController();

/**
 * @swagger
 * /api/csp/{id}/availability/opening-hours:
 *   get:
 *     tags:
 *       - Availability
 *     summary: Obtener horarios de apertura de un CSP
 *     description: Retorna los horarios regulares de apertura para cada día de la semana
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del CSP
 *     responses:
 *       200:
 *         description: Horarios de apertura del CSP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 csp_id:
 *                   type: string
 *                   format: uuid
 *                 opening_hours:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OpeningHours'
 *       500:
 *         description: Error del servidor
 *
 *   post:
 *     tags:
 *       - Availability
 *     summary: Establecer horarios de apertura
 *     description: Configura los horarios regulares de apertura para un CSP (reemplaza horarios existentes)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del CSP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - opening_hours
 *             properties:
 *               opening_hours:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 7
 *                 items:
 *                   $ref: '#/components/schemas/OpeningHours'
 *                 description: Array de horarios (1-7 días)
 *           example:
 *             opening_hours:
 *               - day_of_week: 1
 *                 open_time: "09:00:00"
 *                 close_time: "18:00:00"
 *                 is_closed: false
 *               - day_of_week: 2
 *                 open_time: "09:00:00"
 *                 close_time: "18:00:00"
 *                 is_closed: false
 *     responses:
 *       201:
 *         description: Horarios creados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 csp_id:
 *                   type: string
 *                   format: uuid
 *                 opening_hours:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OpeningHours'
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return controller.getOpeningHours(req, context);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return controller.setOpeningHours(req, context);
}

export default GET;
