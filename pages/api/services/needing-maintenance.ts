/**
 * @swagger
 * /api/services/needing-maintenance:
 *   get:
 *     summary: Servicios que requieren mantenimiento
 *     description: Obtiene lista de servicios que necesitan mantenimiento preventivo o correctivo
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Lista de servicios que necesitan mantenimiento
 */
import type { NextApiRequest, NextApiResponse} from "next";
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

  return controller.getNeedingMaintenance(req, res);
});
