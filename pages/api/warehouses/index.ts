import type { NextApiRequest, NextApiResponse } from "next";
import { WarehouseController } from "@/api/controllers/warehouse.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";
import { ErrorMessages } from "@/shared/constants/error-messages";

const controller = new WarehouseController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "GET":
      return controller.getAll(req, res);

    case "POST":
      return controller.create(req, res);

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).json({
        success: false,
        error: ErrorMessages.METHOD_NOT_ALLOWED,
      });
  }
});
