/**
 * @swagger
 * /api/stock-requests/stats:
 *   get:
 *     summary: Estadísticas de solicitudes de stock
 *     description: Retorna métricas agregadas de solicitudes de reposición
 *     tags: [Stock Requests]
 *     parameters:
 *       - in: query
 *         name: warehouse_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: service_point_id
 *         schema:
 *           type: string
 *           format: uuid
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
 *         description: Estadísticas de solicitudes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_requests:
 *                       type: integer
 *                     by_status:
 *                       type: object
 *                     by_priority:
 *                       type: object
 *                     average_delivery_time:
 *                       type: number
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { stockRequestController } from "@/api/controllers/stock-request.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";
import { ErrorMessages } from "@/shared/constants/error-messages";


export default asyncHandler(async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { method } = req;

  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
  }

  return stockRequestController.getStats(req, res);
});
