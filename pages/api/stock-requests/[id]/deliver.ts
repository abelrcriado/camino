/**
 * @swagger
 * /api/stock-requests/{id}/deliver:
 *   put:
 *     summary: Marcar solicitud como entregada
 *     description: Cambia el estado de la solicitud a delivered (entregada)
 *     tags: [Stock Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               received_by:
 *                 type: string
 *               delivery_notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estado actualizado a delivered
 *       400:
 *         description: ID inválido o estado no válido
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

  if (method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
  }

  return stockRequestController.markAsDelivered(req, res);
});
