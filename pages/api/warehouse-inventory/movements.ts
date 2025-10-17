/**
 * @swagger
 * /api/warehouse-inventory/movements:
 *   get:
 *     summary: Listar movimientos de inventario
 *     description: Obtiene historial de movimientos de almacén (entradas, salidas, ajustes)
 *     tags: [Warehouse Inventory]
 *     parameters:
 *       - in: query
 *         name: warehouse_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: product_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: movement_type
 *         schema:
 *           type: string
 *           enum: [purchase, transfer, adjustment, stock_request]
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista de movimientos
 *       400:
 *         description: Parámetros inválidos
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
      return controller.getMovements(req, res);

    default:
      res.setHeader("Allow", ["GET"]);
      return res.status(405).json({
        success: false,
        error: `Method ${method} Not Allowed`,
      });
  }
});
