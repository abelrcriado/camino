/**
 * API Route: /api/service-points/stats
 * Estadísticas de toda la red
 * 
 * @swagger
 * /api/service-points/stats:
 *   get:
 *     summary: Estadísticas de la red de service points
 *     description: Retorna métricas agregadas de todos los puntos de servicio
 *     tags: [Service Points]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [CSP, CSS, CSH]
 *         description: Filtrar por tipo
 *       - in: query
 *         name: ubicacion_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ubicación
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Estadísticas de la red
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_service_points:
 *                       type: integer
 *                     by_type:
 *                       type: object
 *                       properties:
 *                         CSP:
 *                           type: integer
 *                         CSS:
 *                           type: integer
 *                         CSH:
 *                           type: integer
 *                     by_status:
 *                       type: object
 *                     total_revenue:
 *                       type: number
 *                     total_bookings:
 *                       type: integer
 *       400:
 *         description: Parámetros inválidos
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
