import type { NextApiRequest, NextApiResponse } from "next";
import { ServiceProductController } from "@/controllers/service-product.controller";

const controller = new ServiceProductController();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      return controller.list(req, res);

    case "POST":
      return controller.create(req, res);

    default:
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} not allowed`,
      });
  }
}
