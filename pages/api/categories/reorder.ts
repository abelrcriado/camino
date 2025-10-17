/**
 * @swagger
 * /api/categories/reorder:
 *   post:
 *     summary: Reordenar categorías
 *     description: Actualiza el orden de visualización de múltiples categorías
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categories
 *             properties:
 *               categories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - display_order
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     display_order:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Categorías reordenadas exitosamente
 *       400:
 *         description: Datos inválidos
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
    case "POST":
      // POST /api/categories/reorder - Reordenar categorías
      return controller.reorder(req, res);

    default:
      res.setHeader("Allow", ["POST"]);
      return res.status(405).json({
        success: false,
        error: `Method ${method} Not Allowed`,
      });
  }
});
