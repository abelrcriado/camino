/**
 * @swagger
 * /api/vending-machines/{id}:
 *   get:
 *     summary: Obtener vending machine por ID
 *     description: Retorna información detallada de una máquina expendedora
 *     tags: [Vending Machines]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Información de la vending machine
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
 *                     service_point_id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     location:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [active, inactive, maintenance, out_of_service]
 *                     model:
 *                       type: string
 *                     serial_number:
 *                       type: string
 *                     capacity:
 *                       type: integer
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Vending machine no encontrada
 *       500:
 *         description: Error interno
 *   put:
 *     summary: Actualizar vending machine
 *     description: Actualiza información de una máquina expendedora
 *     tags: [Vending Machines]
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
 *               location:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, maintenance, out_of_service]
 *               model:
 *                 type: string
 *               serial_number:
 *                 type: string
 *               capacity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Vending machine actualizada
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Vending machine no encontrada
 *       500:
 *         description: Error interno
 *   delete:
 *     summary: Eliminar vending machine
 *     description: Elimina una máquina expendedora (soft delete)
 *     tags: [Vending Machines]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Vending machine eliminada
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Vending machine no encontrada
 *       500:
 *         description: Error interno
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { VendingMachineController } from "@/api/controllers/vending-machine.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";

const controller = new VendingMachineController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // Extract id from URL params and add to query
  const { id } = req.query;
  req.query.id = id;

  return controller.handle(req, res);
});
