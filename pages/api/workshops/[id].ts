/**
 * @swagger
 * /api/workshops/{id}:
 *   get:
 *     summary: Obtener taller por ID
 *     description: Retorna información detallada de un taller
 *     tags: [Workshops]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Información del taller
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Taller no encontrado
 *       500:
 *         description: Error interno
 *   put:
 *     summary: Actualizar taller
 *     description: Actualiza información de un taller
 *     tags: [Workshops]
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
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Taller actualizado
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Taller no encontrado
 *       500:
 *         description: Error interno
 *   delete:
 *     summary: Eliminar taller
 *     description: Elimina un taller (soft delete)
 *     tags: [Workshops]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Taller eliminado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Taller no encontrado
 *       500:
 *         description: Error interno
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { WorkshopController } from "@/api/controllers/workshop.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";

const controller = new WorkshopController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // Extract id from URL params and add to query
  const { id } = req.query;
  req.query.id = id;

  return controller.handle(req, res);
});
