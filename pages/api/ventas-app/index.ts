// Endpoint para operaciones de ventas app
import type { NextApiRequest, NextApiResponse } from "next";
import { VentaAppController } from "@/controllers/venta_app.controller";

/**
 * @swagger
 * /api/ventas-app:
 *   get:
 *     summary: Listar ventas con filtros
 *     description: Obtiene lista de ventas de la app con filtros opcionales
 *     tags: [Ventas App]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por usuario
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [reservada, pagada, retirada, cancelada, expirada]
 *         description: Filtrar por estado de la venta
 *       - in: query
 *         name: slot_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por slot de vending machine
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Registros por página
 *     responses:
 *       200:
 *         description: Lista de ventas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 *   post:
 *     summary: Crear nueva venta
 *     description: Crea una nueva venta reservando stock del slot
 *     tags: [Ventas App]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - slot_id
 *               - cantidad
 *               - precio_unitario
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del usuario que realiza la compra
 *               slot_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del slot de vending machine
 *               cantidad:
 *                 type: integer
 *                 minimum: 1
 *                 description: Cantidad de productos a comprar
 *               precio_unitario:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Precio unitario del producto
 *     responses:
 *       201:
 *         description: Venta creada exitosamente
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
 *                       user_id:
 *                         type: string
 *                       slot_id:
 *                         type: string
 *                       cantidad:
 *                         type: integer
 *                       precio_total:
 *                         type: number
 *                       estado:
 *                         type: string
 *                         enum: [reservada, pagada, retirada, cancelada, expirada]
 *                       codigo_retiro:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Datos inválidos o stock insuficiente
 *       404:
 *         description: Usuario o slot no encontrado
 *       500:
 *         description: Error interno del servidor
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const controller = new VentaAppController();
  return controller.handle(req, res);
}

export default handler;
