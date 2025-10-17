/**
 * @swagger
 * /api/subcategories/{id}:
 *   get:
 *     summary: Obtener subcategoría por ID
 *     description: Retorna información detallada de una subcategoría
 *     tags: [Subcategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Información de la subcategoría
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
 *                     category_id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     is_active:
 *                       type: boolean
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Subcategoría no encontrada
 *       500:
 *         description: Error interno
 *   put:
 *     summary: Actualizar subcategoría
 *     description: Actualiza información de una subcategoría
 *     tags: [Subcategories]
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
 *               category_id:
 *                 type: string
 *                 format: uuid
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Subcategoría actualizada
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Subcategoría no encontrada
 *       500:
 *         description: Error interno
 *   delete:
 *     summary: Eliminar subcategoría
 *     description: Elimina una subcategoría (soft delete)
 *     tags: [Subcategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Subcategoría eliminada
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Subcategoría no encontrada
 *       500:
 *         description: Error interno
 *   patch:
 *     summary: Alternar estado activo
 *     description: Activa o desactiva una subcategoría
 *     tags: [Subcategories]
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
 *         description: Subcategoría no encontrada
 *       500:
 *         description: Error interno
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { ProductSubcategoryController } from "@/api/controllers/product-subcategory.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";
import { ErrorMessages } from "@/shared/constants/error-messages";

const controller = new ProductSubcategoryController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      return controller.getById(req, res);

    case "PUT":
      return controller.update(req, res);

    case "DELETE":
      return controller.delete(req, res);

    case "PATCH":
      return controller.toggleActive(req, res);

    default:
      return res.status(405).json({
        success: false,
        error: ErrorMessages.METHOD_NOT_ALLOWED,
      });
  }
});
