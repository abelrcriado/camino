/**
 * @swagger
 * /api/workshops:
 *   get:
 *     summary: Listar talleres
 *     description: Obtiene lista paginada de talleres (CSH) con filtros
 *     tags: [Workshops]
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
 *           enum: [active, inactive]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de talleres
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno
 *   post:
 *     summary: Crear taller
 *     description: Registra un nuevo taller (CSH)
 *     tags: [Workshops]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - service_point_id
 *               - name
 *             properties:
 *               service_point_id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 default: active
 *     responses:
 *       201:
 *         description: Taller creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { WorkshopController } from "@/api/controllers/workshop.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";

const controller = new WorkshopController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  return controller.handle(req, res);
});
