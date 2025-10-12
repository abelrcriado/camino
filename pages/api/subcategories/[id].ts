import type { NextApiRequest, NextApiResponse } from "next";
import { ProductSubcategoryController } from "@/controllers/product-subcategory.controller";

const controller = new ProductSubcategoryController();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      return controller.getById(req, res);

    case "PUT":
      return controller.update(req, res);

    case "DELETE":
      return controller.delete(req, res);

    case "PATCH":
      return controller.toggleActive(req, res);

    default:
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} not allowed`,
      });
  }
}
