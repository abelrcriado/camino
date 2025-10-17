import type { NextApiRequest, NextApiResponse } from "next";
import { ServiceTypeController } from "@/api/controllers/service-type.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";
import { ErrorMessages } from "@/shared/constants/error-messages";

const controller = new ServiceTypeController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      return controller.getById(req, res);

    default:
      return res.status(405).json({
        success: false,
        error: ErrorMessages.METHOD_NOT_ALLOWED,
      });
  }
});
