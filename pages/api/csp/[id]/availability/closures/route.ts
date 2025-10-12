import { NextRequest } from "next/server";
import { AvailabilityController } from "@/controllers/availability.controller";

const controller = new AvailabilityController();

/**
 * @swagger
 * /api/csp/{id}/availability/closures:
 *   get:
 *     tags:
 *       - Availability
 *     summary: Obtener cierres especiales de un CSP
 *     description: Retorna la lista de cierres especiales (vacaciones, mantenimiento, etc.)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del CSP
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar desde esta fecha (YYYY-MM-DD)
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar hasta esta fecha (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de cierres especiales
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 csp_id:
 *                   type: string
 *                   format: uuid
 *                 closures:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SpecialClosure'
 *       500:
 *         description: Error del servidor
 *
 *   post:
 *     tags:
 *       - Availability
 *     summary: Crear un cierre especial
 *     description: Crea un nuevo cierre especial para un CSP (vacaciones, mantenimiento, eventos, etc.)
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
 *               - start_date
 *               - end_date
 *               - reason
 *             properties:
 *               start_date:
 *                 type: string
 *                 format: date
 *                 pattern: '^\d{4}-\d{2}-\d{2}$'
 *                 description: Fecha de inicio del cierre (YYYY-MM-DD)
 *                 example: "2025-12-25"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 pattern: '^\d{4}-\d{2}-\d{2}$'
 *                 description: Fecha de fin del cierre (YYYY-MM-DD)
 *                 example: "2025-12-26"
 *               reason:
 *                 type: string
 *                 minLength: 1
 *                 description: Razón del cierre
 *                 example: "Vacaciones de Navidad"
 *     responses:
 *       201:
 *         description: Cierre especial creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SpecialClosure'
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return controller.getSpecialClosures(req, context);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return controller.createSpecialClosure(req, context);
}

export default GET;
