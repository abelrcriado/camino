/**
 * @swagger
 * /api/warehouse-inventory/summary:
 *   get:
 *     summary: Resumen de inventario
 *     description: Obtiene resumen general del inventario de almacén
 *     tags: [Warehouse Inventory]
 *     parameters:
 *       - in: query
 *         name: warehouse_id
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Resumen de inventario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_products:
 *                       type: integer
 *                     total_quantity:
 *                       type: integer
 *                     low_stock_items:
 *                       type: integer
 *                     out_of_stock_items:
 *                       type: integer
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { WarehouseInventoryController } from "@/api/controllers/warehouse-inventory.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";

const controller = new WarehouseInventoryController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "GET":
      return controller.getSummary(req, res);

    default:
      res.setHeader("Allow", ["GET"]);
      return res.status(405).json({
        success: false,
        error: `Method ${method} Not Allowed`,
      });
  }
});
