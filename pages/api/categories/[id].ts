/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Obtener categoría por ID
 *     description: Retorna información detallada de una categoría
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Información de la categoría
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
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     display_order:
 *                       type: integer
 *                     is_active:
 *                       type: boolean
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Categoría no encontrada
 *       500:
 *         description: Error interno
 *   put:
 *     summary: Actualizar categoría
 *     description: Actualiza información de una categoría
 *     tags: [Categories]
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
 *               display_order:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Categoría no encontrada
 *       500:
 *         description: Error interno
 *   delete:
 *     summary: Eliminar categoría
 *     description: Elimina una categoría (soft delete)
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Categoría eliminada
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Categoría no encontrada
 *       500:
 *         description: Error interno
 *   patch:
 *     summary: Alternar estado activo
 *     description: Activa o desactiva una categoría
 *     tags: [Categories]
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
 *         description: Categoría no encontrada
 *       500:
 *         description: Error interno
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { ProductCategoryController } from "@/api/controllers/product-category.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";

const controller = new ProductCategoryController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "GET":
      // GET /api/categories/:id - Obtener una categoría
      return controller.getById(req, res);

    case "PUT":
      // PUT /api/categories/:id - Actualizar categoría
      return controller.update(req, res);

    case "DELETE":
      // DELETE /api/categories/:id - Eliminar categoría
      return controller.delete(req, res);

    case "PATCH":
      // PATCH /api/categories/:id - Toggle active status
      return controller.toggleActive(req, res);

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE", "PATCH"]);
      return res.status(405).json({
        success: false,
        error: `Method ${method} Not Allowed`,
      });
  }
});
