/**
 * @swagger
 * /api/warehouses/{id}:
 *   get:
 *     summary: Obtener almacén por ID
 *     description: Retorna información detallada de un almacén
 *     tags: [Warehouses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Información del almacén
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Almacén no encontrado
 *       500:
 *         description: Error interno
 *   put:
 *     summary: Actualizar almacén
 *     description: Actualiza información de un almacén
 *     tags: [Warehouses]
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
 *               capacity:
 *                 type: integer
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Almacén actualizado
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Almacén no encontrado
 *       500:
 *         description: Error interno
 *   delete:
 *     summary: Eliminar almacén
 *     description: Elimina un almacén (soft delete)
 *     tags: [Warehouses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Almacén eliminado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Almacén no encontrado
 *       500:
 *         description: Error interno
 *   patch:
 *     summary: Alternar estado del almacén
 *     description: Activa o desactiva un almacén
 *     tags: [Warehouses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Almacén no encontrado
 *       500:
 *         description: Error interno
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { WarehouseController } from "@/api/controllers/warehouse.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";
import { ErrorMessages } from "@/shared/constants/error-messages";

const controller = new WarehouseController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "GET":
      return controller.getById(req, res);

    case "PUT":
      return controller.update(req, res);

    case "DELETE":
      return controller.delete(req, res);

    case "PATCH":
      return controller.toggleStatus(req, res);

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE", "PATCH"]);
      return res.status(405).json({
        success: false,
        error: ErrorMessages.METHOD_NOT_ALLOWED,
      });
  }
});
