import { NextApiRequest, NextApiResponse } from "next";
import { LocationController } from "@/controllers/location.controller";
import { asyncHandler } from "@/middlewares/error-handler";

const controller = new LocationController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  await controller.handle(req, res);
});
