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

import type { NextApiRequest, NextApiResponse } from "next";
import { ProductoService } from "@/services/producto.service";

const productoService = new ProductoService();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    const categorias = await productoService.getCategorias();
    return res.status(200).json({ data: categorias });
  } catch (error) {
    console.error("Error fetching categorias:", error);
    return res.status(500).json({
      message: "Error al obtener las categorías",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}
