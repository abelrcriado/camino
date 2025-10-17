/**
 * @swagger
 * /api/stock-requests/requiring-action:
 *   get:
 *     summary: Listar solicitudes que requieren acción
 *     description: Obtiene solicitudes pendientes o que necesitan atención
 *     tags: [Stock Requests]
 *     parameters:
 *       - in: query
 *         name: warehouse_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *     responses:
 *       200:
 *         description: Lista de solicitudes que requieren acción
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
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

  return stockRequestController.getRequiringAction(req, res);
});
