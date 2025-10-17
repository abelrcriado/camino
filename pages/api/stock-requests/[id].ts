/**
 * @swagger
 * /api/stock-requests/{id}:
 *   get:
 *     summary: Obtener solicitud de stock por ID
 *     description: Retorna información detallada de una solicitud de reposición
 *     tags: [Stock Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Información de la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     service_point_id:
 *                       type: string
 *                       format: uuid
 *                     warehouse_id:
 *                       type: string
 *                       format: uuid
 *                     status:
 *                       type: string
 *                       enum: [pending, preparing, in_transit, delivered, cancelled]
 *                     priority:
 *                       type: string
 *                       enum: [low, medium, high, urgent]
 *                     items:
 *                       type: array
 *                     notes:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Solicitud no encontrada
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

  switch (method) {
    case "GET":
      return stockRequestController.getById(req, res);

    default:
      res.setHeader("Allow", ["GET"]);
      return res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
  }
});
