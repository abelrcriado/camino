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
    const marcas = await productoService.getMarcas();
    return res.status(200).json({ data: marcas });
  } catch (error) {
    console.error("Error fetching marcas:", error);
    return res.status(500).json({
      message: "Error al obtener las marcas",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}
