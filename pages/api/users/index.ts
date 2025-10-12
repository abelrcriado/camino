import type { NextApiRequest, NextApiResponse } from "next";
import { UserController } from "@/controllers/user.controller";

const controller = new UserController();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return controller.handle(req, res);
}
