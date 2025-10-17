/**
 * @swagger
 * /api/vending-machines:
 *   get:
 *     summary: Listar vending machines
 *     description: Obtiene lista paginada de máquinas expendedoras con filtros
 *     tags: [Vending Machines]
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
 *         description: Filtrar por punto de servicio
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, maintenance, out_of_service]
 *         description: Filtrar por estado
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Búsqueda por ubicación
 *     responses:
 *       200:
 *         description: Lista de vending machines
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       service_point_id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       location:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [active, inactive, maintenance, out_of_service]
 *                       model:
 *                         type: string
 *                       serial_number:
 *                         type: string
 *                       capacity:
 *                         type: integer
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno
 *   post:
 *     summary: Crear vending machine
 *     description: Registra una nueva máquina expendedora
 *     tags: [Vending Machines]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - service_point_id
 *               - name
 *               - location
 *             properties:
 *               service_point_id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, maintenance, out_of_service]
 *                 default: active
 *               model:
 *                 type: string
 *               serial_number:
 *                 type: string
 *               capacity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Vending machine creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno
 */
import { NextApiRequest, NextApiResponse } from "next";
import { VendingMachineController } from "@/api/controllers/vending-machine.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";

const controller = new VendingMachineController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  await controller.handle(req, res);
});
