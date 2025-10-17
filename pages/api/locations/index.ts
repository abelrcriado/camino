import { NextApiRequest, NextApiResponse } from "next";
import { LocationController } from "@/api/controllers/location.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";

const controller = new LocationController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  await controller.handle(req, res);
});
