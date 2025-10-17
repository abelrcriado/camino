/**
 * @swagger
 * /api/warehouse-inventory/transfer:
 *   post:
 *     summary: Transferir inventario entre almacenes
 *     description: Registra transferencia de productos entre almacenes
 *     tags: [Warehouse Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - from_warehouse_id
 *               - to_warehouse_id
 *               - items
 *             properties:
 *               from_warehouse_id:
 *                 type: string
 *                 format: uuid
 *               to_warehouse_id:
 *                 type: string
 *                 format: uuid
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transferencia registrada exitosamente
 *       400:
 *         description: Datos inválidos o stock insuficiente
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
    case "POST":
      return controller.transfer(req, res);

    default:
      res.setHeader("Allow", ["POST"]);
      return res.status(405).json({
        success: false,
        error: `Method ${method} Not Allowed`,
      });
  }
});
