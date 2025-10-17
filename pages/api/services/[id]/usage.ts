/**
 * @swagger
 * /api/services/{id}/usage:
 *   post:
 *     summary: Registrar uso del servicio
 *     description: Actualiza estadísticas de uso del servicio
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usage_count
 *             properties:
 *               usage_count:
 *                 type: integer
 *               usage_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Uso registrado exitosamente
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

  return controller.updateUsage(req, res);
});
