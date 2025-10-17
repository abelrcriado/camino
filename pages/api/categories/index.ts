/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Listar categorías de productos
 *     description: Obtiene lista de categorías con opción de incluir subcategorías
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: include_subcategories
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir subcategorías anidadas
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       display_order:
 *                         type: integer
 *                       is_active:
 *                         type: boolean
 *                       subcategories:
 *                         type: array
 *                         description: Solo si include_subcategories=true
 *       500:
 *         description: Error interno
 *   post:
 *     summary: Crear categoría
 *     description: Crea una nueva categoría de productos
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               display_order:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno
 */
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
