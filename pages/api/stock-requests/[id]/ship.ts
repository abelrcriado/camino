/**
 * @swagger
 * /api/stock-requests/{id}/ship:
 *   put:
 *     summary: Marcar solicitud como enviada
 *     description: Cambia el estado de la solicitud a in_transit (en tránsito)
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
 *               tracking_number:
 *                 type: string
 *               carrier:
 *                 type: string
 *               estimated_delivery:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Estado actualizado a in_transit
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

  return stockRequestController.ship(req, res);
});
