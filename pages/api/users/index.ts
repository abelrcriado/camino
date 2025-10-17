import type { NextApiRequest, NextApiResponse } from "next";
import { UserController } from "@/api/controllers/user.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";

const controller = new UserController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  return controller.handle(req, res);
});
