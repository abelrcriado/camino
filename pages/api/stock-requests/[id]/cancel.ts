/**
 * @swagger
 * /api/stock-requests/{id}/cancel:
 *   put:
 *     summary: Cancelar solicitud de stock
 *     description: Cambia el estado de la solicitud a cancelled (cancelada)
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
 *               cancellation_reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Solicitud cancelada exitosamente
 *       400:
 *         description: ID inválido o no se puede cancelar
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

  return stockRequestController.cancel(req, res);
});
