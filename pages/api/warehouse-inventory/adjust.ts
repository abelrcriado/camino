/**
 * @swagger
 * /api/warehouse-inventory/adjust:
 *   post:
 *     summary: Ajustar inventario de almacén
 *     description: Realiza ajustes manuales en el inventario (incremento/decremento)
 *     tags: [Warehouse Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - warehouse_id
 *               - product_id
 *               - quantity
 *               - adjustment_type
 *             properties:
 *               warehouse_id:
 *                 type: string
 *                 format: uuid
 *               product_id:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *               adjustment_type:
 *                 type: string
 *                 enum: [increase, decrease, correction]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inventario ajustado exitosamente
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
      return controller.adjust(req, res);

    default:
      res.setHeader("Allow", ["POST"]);
      return res.status(405).json({
        success: false,
        error: `Method ${method} Not Allowed`,
      });
  }
});
