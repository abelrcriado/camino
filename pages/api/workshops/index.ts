import type { NextApiRequest, NextApiResponse } from "next";
import { WorkshopController } from "@/controllers/workshop.controller";
import { asyncHandler } from "@/middlewares/error-handler";

const controller = new WorkshopController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  return controller.handle(req, res);
});
