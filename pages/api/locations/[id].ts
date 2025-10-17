/**
 * @swagger
 * /api/locations/{id}:
 *   get:
 *     summary: Obtener ubicación por ID
 *     description: Retorna información detallada de una ubicación
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Información de la ubicación
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
 *                     camino_id:
 *                       type: string
 *                       format: uuid
 *                     nombre:
 *                       type: string
 *                     descripcion:
 *                       type: string
 *                     coordinates:
 *                       type: object
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Ubicación no encontrada
 *       500:
 *         description: Error interno
 *   put:
 *     summary: Actualizar ubicación
 *     description: Actualiza información de una ubicación
 *     tags: [Locations]
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
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               coordinates:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *     responses:
 *       200:
 *         description: Ubicación actualizada
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Ubicación no encontrada
 *       500:
 *         description: Error interno
 *   delete:
 *     summary: Eliminar ubicación
 *     description: Elimina una ubicación (soft delete)
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Ubicación eliminada
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Ubicación no encontrada
 *       500:
 *         description: Error interno
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { LocationController } from "@/api/controllers/location.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";

const controller = new LocationController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // Extract id from URL params and add to query
  const { id } = req.query;
  req.query.id = id;

  return controller.handle(req, res);
});
