import type { NextApiRequest, NextApiResponse } from "next";
import { ServiceTypeController } from "@/api/controllers/service-type.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";
import { ErrorMessages } from "@/shared/constants/error-messages";

/**
 * @swagger
 * /api/service-types:
 *   get:
 *     summary: Listar tipos de servicios
 *     description: Obtiene la lista completa de tipos de servicios disponibles en el sistema (mantenimiento, técnico, limpieza, etc.)
 *     tags: [Service Types]
 *     responses:
 *       200:
 *         description: Lista de tipos de servicios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ServiceType'
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ServiceType:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único del tipo de servicio
 *         nombre:
 *           type: string
 *           description: Nombre del tipo de servicio
 *         descripcion:
 *           type: string
 *           description: Descripción detallada del tipo
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *       required:
 *         - id
 *         - nombre
 */

const controller = new ServiceTypeController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      return controller.list(req, res);

    default:
      return res.status(405).json({
        success: false,
        error: ErrorMessages.METHOD_NOT_ALLOWED,
      });
  }
});
