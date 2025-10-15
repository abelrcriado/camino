// Endpoint para operaciones de transacciones de vending machines
import type { NextApiRequest, NextApiResponse } from "next";
import { VendingTransactionController } from "@/controllers/vending_transaction.controller";
import { asyncHandler } from "@/middlewares/error-handler";

/**
 * @swagger
 * /api/vending-transactions:
 *   get:
 *     summary: Listar transacciones de vending machines
 *     description: Obtiene lista de transacciones con filtros opcionales
 *     tags: [Vending Transactions]
 *     parameters:
 *       - in: query
 *         name: machine_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por máquina
 *       - in: query
 *         name: slot_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por slot
 *       - in: query
 *         name: producto_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por producto
 *       - in: query
 *         name: metodo_pago
 *         schema:
 *           type: string
 *           enum: [efectivo, tarjeta, qr, app, unknown]
 *         description: Filtrar por método de pago
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha inicio (ISO 8601)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha fin (ISO 8601)
 *       - in: query
 *         name: precio_min
 *         schema:
 *           type: integer
 *         description: Precio mínimo en céntimos
 *       - in: query
 *         name: precio_max
 *         schema:
 *           type: integer
 *         description: Precio máximo en céntimos
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
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [stats, stats-by-period]
 *         description: Acción especial (stats, stats-by-period)
 *     responses:
 *       200:
 *         description: Lista de transacciones o estadísticas
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           slot_id:
 *                             type: string
 *                             format: uuid
 *                           machine_id:
 *                             type: string
 *                             format: uuid
 *                           producto_id:
 *                             type: string
 *                             format: uuid
 *                           cantidad:
 *                             type: integer
 *                           precio_unitario:
 *                             type: integer
 *                             description: Precio en céntimos
 *                           precio_total:
 *                             type: integer
 *                             description: Precio total en céntimos
 *                           metodo_pago:
 *                             type: string
 *                             enum: [efectivo, tarjeta, qr, app, unknown]
 *                           stock_antes:
 *                             type: integer
 *                           stock_despues:
 *                             type: integer
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       description: Estadísticas de ventas
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 *   post:
 *     summary: Crear nueva transacción
 *     description: Registra manualmente una transacción de venta
 *     tags: [Vending Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slot_id
 *               - machine_id
 *               - producto_id
 *               - cantidad
 *               - precio_unitario
 *               - precio_total
 *               - metodo_pago
 *             properties:
 *               slot_id:
 *                 type: string
 *                 format: uuid
 *               machine_id:
 *                 type: string
 *                 format: uuid
 *               producto_id:
 *                 type: string
 *                 format: uuid
 *               cantidad:
 *                 type: integer
 *                 minimum: 1
 *               precio_unitario:
 *                 type: integer
 *                 minimum: 1
 *                 description: Precio en céntimos
 *               precio_total:
 *                 type: integer
 *                 minimum: 1
 *                 description: Precio total en céntimos
 *               metodo_pago:
 *                 type: string
 *                 enum: [efectivo, tarjeta, qr, app, unknown]
 *               stock_antes:
 *                 type: integer
 *               stock_despues:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Transacción creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 *   put:
 *     summary: Actualizar transacción
 *     description: Actualiza el método de pago de una transacción
 *     tags: [Vending Transactions]
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
 *               metodo_pago:
 *                 type: string
 *                 enum: [efectivo, tarjeta, qr, app, unknown]
 *     responses:
 *       200:
 *         description: Transacción actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Transacción no encontrada
 *       500:
 *         description: Error interno del servidor
 *   delete:
 *     summary: Eliminar transacción
 *     description: Elimina una transacción (solo para correcciones)
 *     tags: [Vending Transactions]
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
 *       200:
 *         description: Transacción eliminada exitosamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Transacción no encontrada
 *       500:
 *         description: Error interno del servidor
 */
export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const controller = new VendingTransactionController();
  return controller.handle(req, res);
});
