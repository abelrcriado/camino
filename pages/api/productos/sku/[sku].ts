// Endpoint para buscar producto por SKU
import type { NextApiRequest, NextApiResponse } from "next";
import { ProductoService } from "../../../../src/services/producto.service";
import { ProductoRepository } from "../../../../src/repositories/producto.repository";
import { asyncHandler } from "@/middlewares/error-handler";
import { ErrorMessages } from "@/constants/error-messages";

/**
 * @swagger
 * /api/productos/sku/{sku}:
 *   get:
 *     summary: Obtener producto por SKU
 *     description: Retorna un producto específico buscando por su SKU único
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         schema:
 *           type: string
 *         description: SKU único del producto
 *         example: BIKE-PUMP-001
 *     responses:
 *       200:
 *         description: Producto encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 nombre:
 *                   type: string
 *                 sku:
 *                   type: string
 *                 category_id:
 *                   type: string
 *                   format: uuid
 *                 subcategory_id:
 *                   type: string
 *                   format: uuid
 *                   nullable: true
 *                 descripcion:
 *                   type: string
 *                   nullable: true
 *                 marca:
 *                   type: string
 *                   nullable: true
 *                 modelo:
 *                   type: string
 *                   nullable: true
 *                 precio_base:
 *                   type: number
 *                   format: float
 *                 is_active:
 *                   type: boolean
 *                 perecedero:
 *                   type: boolean
 *                 imagen_url:
 *                   type: string
 *                   nullable: true
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: SKU inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: SKU es requerido
 *       404:
 *         description: Producto con ese SKU no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Producto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
  }

  const { sku } = req.query;

  // Validar SKU
  if (!sku || typeof sku !== "string") {
    return res.status(400).json({ error: "SKU es requerido" });
  }

  if (sku.trim().length === 0) {
    return res.status(400).json({ error: "SKU no puede estar vacío" });
  }

  // Buscar producto por SKU
  const repository = new ProductoRepository();
  const service = new ProductoService(repository);
  const producto = await service.findBySku(sku);

  if (!producto) {
    return res.status(404).json({ error: ErrorMessages.PRODUCTO_NOT_FOUND });
  }

  return res.status(200).json(producto);
});
