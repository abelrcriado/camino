// Endpoint dinámico para operaciones sobre un producto específico
import type { NextApiRequest, NextApiResponse } from "next";
import { ProductoController } from "../../../src/controllers/producto.controller";
import { validateUUID } from "@/middlewares/validate-uuid";
import { ErrorMessages } from "@/constants/error-messages";

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     description: Retorna los detalles completos de un producto específico
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del producto
 *     responses:
 *       200:
 *         description: Producto encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error interno del servidor
 *   put:
 *     summary: Actualizar producto específico
 *     description: Actualiza los datos de un producto usando su ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 maxLength: 150
 *               sku:
 *                 type: string
 *                 maxLength: 50
 *               category_id:
 *                 type: string
 *                 format: uuid
 *               subcategory_id:
 *                 type: string
 *                 format: uuid
 *               descripcion:
 *                 type: string
 *               marca:
 *                 type: string
 *               modelo:
 *                 type: string
 *               precio_base:
 *                 type: number
 *                 format: float
 *               is_active:
 *                 type: boolean
 *               perecedero:
 *                 type: boolean
 *               imagen_url:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Producto no encontrado
 *       409:
 *         description: SKU duplicado
 *       500:
 *         description: Error interno del servidor
 *   delete:
 *     summary: Eliminar producto específico
 *     description: Elimina un producto del sistema
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const controller = new ProductoController();
  const { id } = req.query;

  // Validar UUID usando middleware centralizado
  const validationError = validateUUID(id, "producto");
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  switch (req.method) {
    case "GET":
      req.query = { ...req.query, id };
      return controller.handle(req, res);

    case "PUT":
      req.body = { ...req.body, id };
      return controller.handle(req, res);

    case "DELETE":
      req.body = { id };
      return controller.handle(req, res);

    default:
      return res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
  }
}

export default handler;
