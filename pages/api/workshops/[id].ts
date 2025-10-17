import type { NextApiRequest, NextApiResponse } from "next";
import { WorkshopController } from "@/api/controllers/workshop.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";

const controller = new WorkshopController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // Extract id from URL params and add to query
  const { id } = req.query;
  req.query.id = id;

  return controller.handle(req, res);
});
