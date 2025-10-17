/**
 * @swagger
 * /api/services/{id}/schedule-maintenance:
 *   post:
 *     summary: Programar mantenimiento
 *     description: Agenda una fecha para mantenimiento del servicio
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
 *               - scheduled_date
 *             properties:
 *               scheduled_date:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mantenimiento programado
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

  return controller.scheduleMaintenance(req, res);
});
