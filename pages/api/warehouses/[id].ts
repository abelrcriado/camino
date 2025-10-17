import type { NextApiRequest, NextApiResponse } from "next";
import { WarehouseController } from "@/api/controllers/warehouse.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";
import { ErrorMessages } from "@/shared/constants/error-messages";

const controller = new WarehouseController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "GET":
      return controller.getById(req, res);

    case "PUT":
      return controller.update(req, res);

    case "DELETE":
      return controller.delete(req, res);

    case "PATCH":
      return controller.toggleStatus(req, res);

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE", "PATCH"]);
      return res.status(405).json({
        success: false,
        error: ErrorMessages.METHOD_NOT_ALLOWED,
      });
  }
});
