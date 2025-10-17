import type { NextApiRequest, NextApiResponse } from "next";
import { ProductSubcategoryController } from "@/api/controllers/product-subcategory.controller";

const controller = new ProductSubcategoryController();

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
