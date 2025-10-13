import type { NextApiRequest, NextApiResponse } from "next";
import { UserController } from "@/controllers/user.controller";
import { asyncHandler } from "@/middlewares/error-handler";

const controller = new UserController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // Extract id from URL params and add to query
  const { id } = req.query;
  req.query.id = id;

  return controller.handle(req, res);
});
