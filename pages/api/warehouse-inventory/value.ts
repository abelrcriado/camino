/**
 * @swagger
 * /api/warehouse-inventory/value:
 *   get:
 *     summary: Valor monetario del inventario
 *     description: Calcula el valor total del inventario en almacén
 *     tags: [Warehouse Inventory]
 *     parameters:
 *       - in: query
 *         name: warehouse_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Valor del inventario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_value:
 *                       type: number
 *                       description: Valor total en moneda local
 *                     by_category:
 *                       type: object
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
      return controller.getInventoryValue(req, res);

    default:
      res.setHeader("Allow", ["GET"]);
      return res.status(405).json({
        success: false,
        error: `Method ${method} Not Allowed`,
      });
  }
});
