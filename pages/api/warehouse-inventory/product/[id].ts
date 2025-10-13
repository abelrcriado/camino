import type { NextApiRequest, NextApiResponse } from "next";
import { WarehouseInventoryController } from "@/controllers/warehouse-inventory.controller";
import { asyncHandler } from "@/middlewares/error-handler";


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
