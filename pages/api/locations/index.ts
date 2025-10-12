import { NextApiRequest, NextApiResponse } from "next";
import { LocationController } from "@/controllers/location.controller";

const controller = new LocationController();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await controller.handle(req, res);
}
