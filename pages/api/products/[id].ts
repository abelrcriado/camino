import type { NextApiRequest, NextApiResponse } from "next";
import { ServiceProductController } from "@/api/controllers/service-product.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";
import { ErrorMessages } from "@/shared/constants/error-messages";

const controller = new ServiceProductController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      return controller.getById(req, res);

    case "PUT":
      return controller.update(req, res);

    case "DELETE":
      return controller.delete(req, res);

    case "PATCH":
      return controller.toggleActive(req, res);

    default:
      return res.status(405).json({
        success: false,
        error: ErrorMessages.METHOD_NOT_ALLOWED,
      });
  }
});
