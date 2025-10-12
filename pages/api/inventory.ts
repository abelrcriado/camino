// CRUD endpoints para Inventory - Clean Architecture
import type { NextApiRequest, NextApiResponse } from "next";
import { InventoryController } from "../../src/controllers/inventory.controller";

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Obtener todos los inventarios
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: service_point_id
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de inventarios obtenida exitosamente
 *       500:
 *         description: Error del servidor
 *   post:
 *     summary: Crear nuevo inventario
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - service_point_id
 *               - name
 *               - quantity
 *             properties:
 *               service_point_id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               min_stock:
 *                 type: integer
 *               max_stock:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Inventario creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 *   put:
 *     summary: Actualizar inventario
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               service_point_id:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               min_stock:
 *                 type: integer
 *               max_stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Inventario actualizado exitosamente
 *       400:
 *         description: ID no proporcionado o inválido
 *       500:
 *         description: Error del servidor
 *   delete:
 *     summary: Eliminar inventario
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       204:
 *         description: Inventario eliminado exitosamente
 *       400:
 *         description: ID no proporcionado o inválido
 *       500:
 *         description: Error del servidor
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const controller = new InventoryController();
  return controller.handle(req, res);
}

export default handler;
