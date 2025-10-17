/**
 * API Route: /api/service-points/[id]
 * GET/PUT/DELETE un service point específico
 * 
 * @swagger
 * /api/service-points/{id}:
 *   get:
 *     summary: Obtener service point por ID
 *     description: Retorna información detallada de un punto de servicio
 *     tags: [Service Points]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Información del service point
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     ubicacion_id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [CSP, CSS, CSH]
 *                     status:
 *                       type: string
 *                     description:
 *                       type: string
 *                     contact_info:
 *                       type: object
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Service point no encontrado
 *       500:
 *         description: Error interno
 *   put:
 *     summary: Actualizar service point
 *     description: Actualiza información de un punto de servicio
 *     tags: [Service Points]
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
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [CSP, CSS, CSH]
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               contact_info:
 *                 type: object
 *     responses:
 *       200:
 *         description: Service point actualizado
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Service point no encontrado
 *       500:
 *         description: Error interno
 *   delete:
 *     summary: Eliminar service point
 *     description: Elimina un punto de servicio (soft delete)
 *     tags: [Service Points]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Service point eliminado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Service point no encontrado
 *       500:
 *         description: Error interno
 */

import { NextApiRequest, NextApiResponse } from "next";
import { ServicePointController } from "@/api/controllers/service-point.controller";
import { ServicePointService } from "@/api/services/service-point.service";
import { ServicePointRepository } from "@/api/repositories/service-point.repository";
import { asyncHandler } from "@/api/middlewares/error-handler";

// Inicializar dependencias
const repository = new ServicePointRepository();
const service = new ServicePointService(repository);
const controller = new ServicePointController(service);

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  return await controller.handle(req, res);
});
