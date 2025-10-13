/**
 * @swagger
 * /api/productos/categorias:
 *   get:
 *     summary: Obtener categorías únicas de productos activos
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Categorías obtenidas correctamente
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
 *                       category_id:
 *                         type: string
 *                       category_name:
 *                         type: string
 *       500:
 *         description: Error interno del servidor
 */

import { ProductoService } from "@/services/producto.service";
import { asyncHandler } from "@/middlewares/error-handler";
import { ErrorMessages } from "@/constants/error-messages";

const productoService = new ProductoService();

export default asyncHandler(async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
  }

  const categorias = await productoService.getCategorias();
  return res.status(200).json({ data: categorias });
});
