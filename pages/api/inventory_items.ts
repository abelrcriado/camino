// CRUD endpoints para Inventory Items - Clean Architecture
import type { NextApiRequest, NextApiResponse } from "next";
import { InventoryItemController } from "../../src/controllers/inventory_item.controller";

/**
 * @swagger
 * /api/inventory_items:
 *   get:
 *     summary: Obtener todos los items de inventario
 *     tags: [InventoryItems]
 *     parameters:
 *       - in: query
 *         name: inventory_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [spare_part, tool, accessory, consumable, other]
 *     responses:
 *       200:
 *         description: Lista de items obtenida exitosamente
 *       500:
 *         description: Error del servidor
 *   post:
 *     summary: Crear nuevo item de inventario
 *     tags: [InventoryItems]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inventory_id
 *               - name
 *               - quantity
 *             properties:
 *               inventory_id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               sku:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [spare_part, tool, accessory, consumable, other]
 *     responses:
 *       201:
 *         description: Item creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 *   put:
 *     summary: Actualizar item de inventario
 *     tags: [InventoryItems]
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
 *               inventory_id:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               sku:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item actualizado exitosamente
 *       400:
 *         description: ID no proporcionado o inválido
 *       500:
 *         description: Error del servidor
 *   delete:
 *     summary: Eliminar item de inventario
 *     tags: [InventoryItems]
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
 *         description: Item eliminado exitosamente
 *       400:
 *         description: ID no proporcionado o inválido
 *       500:
 *         description: Error del servidor
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const controller = new InventoryItemController();
  return controller.handle(req, res);
}

export default handler;
