/**
 * @swagger
 * /api/productos/marcas:
 *   get:
 *     summary: Obtener marcas únicas de productos activos
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Marcas obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
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

  const marcas = await productoService.getMarcas();
  return res.status(200).json({ data: marcas });
});
