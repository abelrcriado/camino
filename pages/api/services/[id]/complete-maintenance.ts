import type { NextApiRequest, NextApiResponse } from "next";
import { ServiceController } from "@/controllers/service.controller";
import { asyncHandler } from "@/middlewares/error-handler";


const controller = new ServiceController();

export default asyncHandler(async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`,
    });
  }

  return controller.completeMaintenance(req, res);
});
