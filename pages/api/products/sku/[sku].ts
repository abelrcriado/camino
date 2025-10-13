import type { NextApiRequest, NextApiResponse } from "next";
import { ServiceProductController } from "@/controllers/service-product.controller";
import { asyncHandler } from "@/middlewares/error-handler";
import { ErrorMessages } from "@/constants/error-messages";

const controller = new ServiceProductController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: ErrorMessages.METHOD_NOT_ALLOWED,
    });
  }

  return controller.getBySku(req, res);
});
