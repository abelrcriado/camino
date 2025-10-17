/**
 * @swagger
 * /api/services/by-status:
 *   get:
 *     summary: Listar servicios por estado
 *     description: Filtra servicios por su estado operativo
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [active, inactive, maintenance, pending]
 *     responses:
 *       200:
 *         description: Lista de servicios filtrados
 *       400:
 *         description: Parámetros inválidos
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { ServiceController } from "@/api/controllers/service.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";


const controller = new ServiceController();

export default asyncHandler(async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`,
    });
  }

  return controller.getByStatus(req, res);
});
