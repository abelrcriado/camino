import type { NextApiRequest, NextApiResponse } from "next";
import { ServiceController } from "@/controllers/service.controller";
import { asyncHandler } from "@/middlewares/error-handler";

const controller = new ServiceController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      return controller.list(req, res);

    case "POST":
      return controller.create(req, res);

    default:
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} not allowed`,
      });
  }
});
