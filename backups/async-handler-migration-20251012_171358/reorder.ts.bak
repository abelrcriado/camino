import type { NextApiRequest, NextApiResponse } from "next";
import { ProductCategoryController } from "@/controllers/product-category.controller";

const controller = new ProductCategoryController();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "POST":
      // POST /api/categories/reorder - Reordenar categorías
      return controller.reorder(req, res);

    default:
      res.setHeader("Allow", ["POST"]);
      return res.status(405).json({
        success: false,
        error: `Method ${method} Not Allowed`,
      });
  }
}
