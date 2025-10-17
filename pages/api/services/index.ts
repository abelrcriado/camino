/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Listar servicios técnicos
 *     description: Obtiene lista de servicios de mantenimiento y soporte técnico
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: service_point_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, maintenance, pending]
 *       - in: query
 *         name: service_type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de servicios
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno
 *   post:
 *     summary: Crear servicio técnico
 *     description: Registra un nuevo servicio de mantenimiento
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - service_point_id
 *               - service_type
 *               - name
 *             properties:
 *               service_point_id:
 *                 type: string
 *                 format: uuid
 *               service_type:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Servicio creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { ServiceController } from "@/api/controllers/service.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";

const controller = new ServiceController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      return controller.list(req, res);

    case "POST":
      return controller.create(req, res);

    default:
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} not allowed`,
      });
  }
});
