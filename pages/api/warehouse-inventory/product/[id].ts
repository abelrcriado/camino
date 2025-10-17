/**
 * @swagger
 * /api/warehouse-inventory/product/{id}:
 *   get:
 *     summary: Stock de un producto específico
 *     description: Obtiene inventario de un producto en todos los almacenes
 *     tags: [Warehouse Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Stock del producto por almacén
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
 *                       warehouse_id:
 *                         type: string
 *                         format: uuid
 *                       warehouse_name:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Producto no encontrado
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
      return controller.getProductStock(req, res);

    default:
      res.setHeader("Allow", ["GET"]);
      return res.status(405).json({
        success: false,
        error: `Method ${method} Not Allowed`,
      });
  }
});
