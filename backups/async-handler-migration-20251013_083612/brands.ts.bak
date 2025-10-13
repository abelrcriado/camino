import type { NextApiRequest, NextApiResponse } from "next";
import { ServiceProductController } from "@/controllers/service-product.controller";

const controller = new ServiceProductController();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`,
    });
  }

  return controller.getBrands(req, res);
}
