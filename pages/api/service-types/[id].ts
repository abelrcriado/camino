import type { NextApiRequest, NextApiResponse } from "next";
import { ServiceTypeController } from "@/api/controllers/service-type.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";
import { ErrorMessages } from "@/shared/constants/error-messages";

/**
 * @swagger
 * /api/service-types/{id}:
 *   get:
 *     summary: Obtener tipo de servicio por ID
 *     description: Recupera la información detallada de un tipo de servicio específico
 *     tags: [Service Types]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del tipo de servicio
 *     responses:
 *       200:
 *         description: Tipo de servicio encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/ServiceType'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Tipo de servicio no encontrado
 *       500:
 *         description: Error interno del servidor
 */

const controller = new ServiceTypeController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      return controller.getById(req, res);

    default:
      return res.status(405).json({
        success: false,
        error: ErrorMessages.METHOD_NOT_ALLOWED,
      });
  }
});
