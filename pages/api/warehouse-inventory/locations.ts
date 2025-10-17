/**
 * @swagger
 * /api/warehouse-inventory/locations:
 *   get:
 *     summary: Inventario por ubicación
 *     description: Obtiene inventario agrupado por ubicación de almacén
 *     tags: [Warehouse Inventory]
 *     parameters:
 *       - in: query
 *         name: warehouse_id
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Inventario por ubicaciones
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
      return controller.getByLocation(req, res);

    default:
      res.setHeader("Allow", ["GET"]);
      return res.status(405).json({
        success: false,
        error: `Method ${method} Not Allowed`,
      });
  }
});
