import type { NextApiRequest, NextApiResponse } from "next";
import { WorkshopController } from "@/controllers/workshop.controller";

const controller = new WorkshopController();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return controller.handle(req, res);
}
