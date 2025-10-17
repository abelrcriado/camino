/**
 * @swagger
 * /api/services/{id}/complete-maintenance:
 *   post:
 *     summary: Completar mantenimiento
 *     description: Marca el mantenimiento como completado
 *     tags: [Services]
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
 *               completion_notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mantenimiento completado
 *       404:
 *         description: Servicio no encontrado
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { ServiceController } from "@/api/controllers/service.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";


const controller = new ServiceController();

export default asyncHandler(async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`,
    });
  }

  return controller.completeMaintenance(req, res);
});
