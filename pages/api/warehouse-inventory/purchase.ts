/**
 * @swagger
 * /api/warehouse-inventory/purchase:
 *   post:
 *     summary: Registrar compra de inventario
 *     description: Registra entrada de inventario por compra a proveedores
 *     tags: [Warehouse Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - warehouse_id
 *               - items
 *             properties:
 *               warehouse_id:
 *                 type: string
 *                 format: uuid
 *               supplier:
 *                 type: string
 *               purchase_order:
 *                 type: string
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
 *                     unit_cost:
 *                       type: number
 *     responses:
 *       201:
 *         description: Compra registrada exitosamente
 *       400:
 *         description: Datos inválidos
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
    case "POST":
      return controller.registerPurchase(req, res);

    default:
      res.setHeader("Allow", ["POST"]);
      return res.status(405).json({
        success: false,
        error: `Method ${method} Not Allowed`,
      });
  }
});
