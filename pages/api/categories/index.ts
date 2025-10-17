import type { NextApiRequest, NextApiResponse } from "next";
import { ProductCategoryController } from "@/api/controllers/product-category.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";

const controller = new ProductCategoryController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "GET":
      // GET /api/categories - Listar categorías
      return controller.list(req, res);

    case "POST":
      // POST /api/categories - Crear categoría
      return controller.create(req, res);

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).json({
        success: false,
        error: `Method ${method} Not Allowed`,
      });
  }
});
