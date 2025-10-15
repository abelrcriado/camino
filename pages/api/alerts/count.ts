/**
 * API Route: /api/alerts/count
 * 
 * @swagger
 * /api/alerts/count:
 *   get:
 *     summary: Obtener estadísticas de alertas
 *     description: Obtiene contadores y estadísticas de alertas del sistema
 *     tags: [Alerts]
 *     responses:
 *       200:
 *         description: Estadísticas de alertas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total de alertas
 *                 no_leidas:
 *                   type: integer
 *                   description: Alertas no leídas
 *                 por_severidad:
 *                   type: object
 *                   properties:
 *                     info:
 *                       type: integer
 *                     warning:
 *                       type: integer
 *                     critical:
 *                       type: integer
 *                 por_tipo:
 *                   type: object
 *                   properties:
 *                     low_stock_vending:
 *                       type: integer
 *                     low_stock_warehouse:
 *                       type: integer
 *                     machine_offline:
 *                       type: integer
 *                     machine_maintenance:
 *                       type: integer
 *                     stock_critical:
 *                       type: integer
 *                     restock_needed:
 *                       type: integer
 *       500:
 *         description: Error del servidor
 */

import { NextApiRequest, NextApiResponse } from "next";
import { AlertService } from "@/services/alert.service";
import { asyncHandler } from "@/middlewares/error-handler";
import logger from "@/config/logger";

const service = new AlertService();

export default asyncHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const startTime = Date.now();

    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).json({
        error: "Método no permitido",
      });
    }

    try {
      const stats = await service.getStats();

      const duration = Date.now() - startTime;
      logger.info(
        `[AlertsCount] GET ${req.url} - 200 (${duration}ms) - ${stats.no_leidas} unread alerts`
      );

      return res.status(200).json(stats);
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";

      logger.error(`[AlertsCount Error]:`, { error: errorMessage });
      logger.info(`[AlertsCount] ERROR - Duration: ${duration}ms - ${errorMessage}`);

      return res.status(500).json({
        error: "Error al obtener estadísticas de alertas",
      });
    }
  }
);
