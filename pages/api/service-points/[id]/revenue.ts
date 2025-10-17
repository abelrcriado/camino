/**
 * API Route: /api/service-points/[id]/revenue
 * Revenue de un service point específico
 * 
 * @swagger
 * /api/service-points/{id}/revenue:
 *   get:
 *     summary: Obtener ingresos del service point
 *     description: Retorna estadísticas de revenue/ingresos del punto de servicio
 *     tags: [Service Points]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del service point
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha inicio del rango
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha fin del rango
 *       - in: query
 *         name: group_by
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *         description: Agrupar resultados por periodo
 *     responses:
 *       200:
 *         description: Estadísticas de revenue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_revenue:
 *                       type: number
 *                       description: Ingresos totales
 *                     bookings_count:
 *                       type: integer
 *                     average_revenue:
 *                       type: number
 *                     by_period:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: ID inválido o parámetros incorrectos
 *       404:
 *         description: Service point no encontrado
 *       500:
 *         description: Error interno
 */

import { NextApiRequest, NextApiResponse } from "next";
import { ServicePointController } from "@/api/controllers/service-point.controller";
import { ServicePointService } from "@/api/services/service-point.service";
import { ServicePointRepository } from "@/api/repositories/service-point.repository";
import { asyncHandler } from "@/api/middlewares/error-handler";

// Inicializar dependencias
const repository = new ServicePointRepository();
const service = new ServicePointService(repository);
const controller = new ServicePointController(service);

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  return await controller.handle(req, res);
});
