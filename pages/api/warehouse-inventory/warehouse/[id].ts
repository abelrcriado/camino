/**
 * @swagger
 * /api/warehouse-inventory/warehouse/{id}:
 *   get:
 *     summary: Inventario completo de un almacén
 *     description: Obtiene todo el inventario de un almacén específico
 *     tags: [Warehouse Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del almacén
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventario del almacén
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
 *                       product_id:
 *                         type: string
 *                         format: uuid
 *                       product_name:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                       min_stock:
 *                         type: integer
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Almacén no encontrado
 *       500:
 *         description: Error interno
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { WarehouseInventoryController } from "@/api/controllers/warehouse-inventory.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";


const controller = new WarehouseInventoryController();

export default asyncHandler(async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { method } = req;

  switch (method) {
    case "GET":
      return controller.getWarehouseStock(req, res);

    default:
      res.setHeader("Allow", ["GET"]);
      return res.status(405).json({
        success: false,
        error: `Method ${method} Not Allowed`,
      });
  }
});
