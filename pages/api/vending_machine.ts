// CRUD endpoints para Vending Machine - Clean Architecture
import type { NextApiRequest, NextApiResponse } from "next";
import { VendingMachineController } from "../../src/controllers/vending_machine.controller";
import { asyncHandler } from "../../src/middlewares/error-handler";

/**
 * @swagger
 * /api/vending_machine:
 *   get:
 *     summary: Obtener todas las máquinas expendedoras
 *     tags: [VendingMachines]
 *     parameters:
 *       - in: query
 *         name: service_point_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [operational, maintenance, out_of_service, low_stock]
 *     responses:
 *       200:
 *         description: Lista de máquinas obtenida exitosamente
 *       500:
 *         description: Error del servidor
 *   post:
 *     summary: Crear nueva máquina expendedora
 *     tags: [VendingMachines]
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
 *               model:
 *                 type: string
 *               serial_number:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [operational, maintenance, out_of_service, low_stock]
 *               capacity:
 *                 type: integer
 *               current_stock:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Máquina creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 *   put:
 *     summary: Actualizar máquina expendedora
 *     tags: [VendingMachines]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               service_point_id:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               model:
 *                 type: string
 *               serial_number:
 *                 type: string
 *               status:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               current_stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Máquina actualizada exitosamente
 *       400:
 *         description: ID no proporcionado o inválido
 *       500:
 *         description: Error del servidor
 *   delete:
 *     summary: Eliminar máquina expendedora
 *     tags: [VendingMachines]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       204:
 *         description: Máquina eliminada exitosamente
 *       400:
 *         description: ID no proporcionado o inválido
 *       500:
 *         description: Error del servidor
 */
export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const controller = new VendingMachineController();
  return controller.handle(req, res);
});
