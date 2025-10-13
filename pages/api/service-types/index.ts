import type { NextApiRequest, NextApiResponse } from "next";
import { ServiceTypeController } from "@/controllers/service-type.controller";
import { asyncHandler } from "@/middlewares/error-handler";

const controller = new ServiceTypeController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      return controller.list(req, res);

    default:
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} not allowed`,
      });
  }
});
