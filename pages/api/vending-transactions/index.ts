/**
 * @swagger
 * /api/vending-transactions:
 *   get:
 *     summary: Obtener transacciones de vending machines
 *     description: Lista todas las transacciones con filtros y paginación
 *     tags: [VendingTransactions]
 *     parameters:
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
 *           default: 20
 *         description: Resultados por página
 *       - in: query
 *         name: machine_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de máquina
 *       - in: query
 *         name: slot_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de slot
 *       - in: query
 *         name: producto_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de producto
 *       - in: query
 *         name: metodo_pago
 *         schema:
 *           type: string
 *           enum: [efectivo, tarjeta, qr, app, unknown]
 *         description: Filtrar por método de pago
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtrar desde esta fecha (ISO 8601)
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtrar hasta esta fecha (ISO 8601)
 *       - in: query
 *         name: precio_min
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Precio mínimo en euros
 *       - in: query
 *         name: precio_max
 *         schema:
 *           type: number
 *         description: Precio máximo en euros
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [created_at, precio_total, cantidad, metodo_pago, producto_nombre, machine_name]
 *           default: created_at
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden de clasificación
 *     responses:
 *       200:
 *         description: Lista de transacciones obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VendingTransactionFull'
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
 *         description: Error de validación
 *       500:
 *         description: Error interno del servidor
 *
 *   post:
 *     summary: Crear transacción manualmente
 *     description: Registra una transacción de venta manualmente (normalmente se crean automáticamente via trigger)
 *     tags: [VendingTransactions]
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
 *               - precio_unitario
 *             properties:
 *               slot_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del slot
 *               machine_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la máquina
 *               producto_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del producto
 *               cantidad:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 default: 1
 *                 description: Cantidad vendida
 *               precio_unitario:
 *                 type: number
 *                 minimum: 0.01
 *                 maximum: 10000
 *                 description: Precio unitario en euros
 *               metodo_pago:
 *                 type: string
 *                 enum: [efectivo, tarjeta, qr, app, unknown]
 *                 default: unknown
 *                 description: Método de pago usado
 *               stock_antes:
 *                 type: integer
 *                 minimum: 0
 *                 description: Stock antes de la venta
 *               stock_despues:
 *                 type: integer
 *                 minimum: 0
 *                 description: Stock después de la venta
 *     responses:
 *       201:
 *         description: Transacción creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VendingTransaction'
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error interno del servidor
 *
 * components:
 *   schemas:
 *     VendingTransaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         slot_id:
 *           type: string
 *           format: uuid
 *         machine_id:
 *           type: string
 *           format: uuid
 *         producto_id:
 *           type: string
 *           format: uuid
 *         cantidad:
 *           type: integer
 *         precio_unitario:
 *           type: number
 *         precio_total:
 *           type: number
 *         metodo_pago:
 *           type: string
 *           enum: [efectivo, tarjeta, qr, app, unknown]
 *         stock_antes:
 *           type: integer
 *           nullable: true
 *         stock_despues:
 *           type: integer
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     VendingTransactionFull:
 *       allOf:
 *         - $ref: '#/components/schemas/VendingTransaction'
 *         - type: object
 *           properties:
 *             slot_number:
 *               type: integer
 *             slot_activo:
 *               type: boolean
 *             machine_name:
 *               type: string
 *             machine_codigo:
 *               type: string
 *               nullable: true
 *             machine_ubicacion:
 *               type: string
 *               nullable: true
 *             service_point_id:
 *               type: string
 *               format: uuid
 *               nullable: true
 *             producto_nombre:
 *               type: string
 *             producto_sku:
 *               type: string
 *               nullable: true
 *             producto_categoria:
 *               type: string
 *               nullable: true
 */

import { NextApiRequest, NextApiResponse } from "next";
import { VendingTransactionController } from "@/controllers/vending_transaction.controller";

const controller = new VendingTransactionController();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await controller.handleRequest(req, res);
}
