import type { NextApiRequest, NextApiResponse } from "next";
import { ProductCategoryController } from "@/controllers/product-category.controller";
import { asyncHandler } from "@/middlewares/error-handler";

const controller = new ProductCategoryController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "GET":
      // GET /api/categories/:id - Obtener una categoría
      return controller.getById(req, res);

    case "PUT":
      // PUT /api/categories/:id - Actualizar categoría
      return controller.update(req, res);

    case "DELETE":
      // DELETE /api/categories/:id - Eliminar categoría
      return controller.delete(req, res);

    case "PATCH":
      // PATCH /api/categories/:id - Toggle active status
      return controller.toggleActive(req, res);

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE", "PATCH"]);
      return res.status(405).json({
        success: false,
        error: `Method ${method} Not Allowed`,
      });
  }
});
