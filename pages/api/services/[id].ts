import type { NextApiRequest, NextApiResponse } from "next";
import { ServiceController } from "@/api/controllers/service.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";


const controller = new ServiceController();

export default asyncHandler(async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
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
        error: `Method ${req.method} not allowed`,
      });
  }
});
