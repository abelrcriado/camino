/**
 * @swagger
 * /api/products/sku/{sku}:
 *   get:
 *     summary: Buscar producto por SKU
 *     description: Obtiene un producto usando su código SKU único
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         schema:
 *           type: string
 *         description: Código SKU del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
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
 *                     sku:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                     category_id:
 *                       type: string
 *                       format: uuid
 *                     subcategory_id:
 *                       type: string
 *                       format: uuid
 *                     brand:
 *                       type: string
 *                     is_active:
 *                       type: boolean
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: SKU inválido
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error interno
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { ServiceProductController } from "@/api/controllers/service-product.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";
import { ErrorMessages } from "@/shared/constants/error-messages";

const controller = new ServiceProductController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: ErrorMessages.METHOD_NOT_ALLOWED,
    });
  }

  return controller.getBySku(req, res);
});
