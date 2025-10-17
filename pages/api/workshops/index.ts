import type { NextApiRequest, NextApiResponse } from "next";
import { WorkshopController } from "@/api/controllers/workshop.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";

const controller = new WorkshopController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  return controller.handle(req, res);
});
