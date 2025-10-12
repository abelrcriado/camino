/**
 * Sprint 3.2: Vending Machine Slots API
 * Endpoint principal para gestión de slots con Swagger documentation
 *
 * @swagger
 * tags:
 *   name: Vending Machine Slots
 *   description: API para gestión de slots en máquinas vending
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { VendingMachineSlotController } from "@/controllers/vending_machine_slot.controller";

/**
 * @swagger
 * /api/vending-machine-slots:
 *   get:
 *     summary: Obtener listado de slots
 *     description: Retorna lista de slots con filtros, paginación y ordenamiento
 *     tags: [Vending Machine Slots]
 *     parameters:
 *       - in: query
 *         name: machine_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de máquina vending
 *       - in: query
 *         name: slot_number
 *         schema:
 *           type: integer
 *         description: Filtrar por número de slot
 *       - in: query
 *         name: producto_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de producto asignado
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo/inactivo
 *       - in: query
 *         name: stock_bajo
 *         schema:
 *           type: boolean
 *         description: Filtrar slots con stock bajo (< 50% capacidad)
 *       - in: query
 *         name: sin_producto
 *         schema:
 *           type: boolean
 *         description: Filtrar slots sin producto asignado
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Cantidad de resultados por página
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [slot_number, stock_disponible, created_at]
 *           default: slot_number
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Orden ascendente o descendente
 *     responses:
 *       200:
 *         description: Lista de slots obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VendingMachineSlot'
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
 *         description: Parámetros de consulta inválidos
 *       500:
 *         description: Error interno del servidor
 *
 *   post:
 *     summary: Crear nuevo slot
 *     description: Crea un slot individual en una máquina vending
 *     tags: [Vending Machine Slots]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - machine_id
 *               - slot_number
 *             properties:
 *               machine_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la máquina vending
 *               slot_number:
 *                 type: integer
 *                 minimum: 1
 *                 description: Número de slot (único por máquina)
 *               producto_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: ID del producto asignado (opcional)
 *               capacidad_maxima:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 1000
 *                 default: 10
 *                 description: Capacidad máxima del slot
 *               stock_disponible:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *                 description: Stock disponible para venta
 *               stock_reservado:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *                 description: Stock reservado (bloqueado)
 *               precio_override:
 *                 type: integer
 *                 nullable: true
 *                 minimum: 1
 *                 description: Precio override en centavos (anula precio del producto)
 *               activo:
 *                 type: boolean
 *                 default: true
 *                 description: Estado del slot
 *               notas:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *                 description: Notas adicionales
 *     responses:
 *       201:
 *         description: Slot creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VendingMachineSlot'
 *       400:
 *         description: Datos de entrada inválidos
 *       409:
 *         description: Conflicto (slot_number ya existe en la máquina o stock excede capacidad)
 *       500:
 *         description: Error interno del servidor
 *
 *   put:
 *     summary: Actualizar slot
 *     description: Actualiza los datos de un slot existente
 *     tags: [Vending Machine Slots]
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
 *                 description: ID del slot a actualizar
 *               producto_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: ID del producto asignado
 *               capacidad_maxima:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 1000
 *                 description: Capacidad máxima del slot
 *               stock_disponible:
 *                 type: integer
 *                 minimum: 0
 *                 description: Stock disponible para venta
 *               stock_reservado:
 *                 type: integer
 *                 minimum: 0
 *                 description: Stock reservado
 *               precio_override:
 *                 type: integer
 *                 nullable: true
 *                 minimum: 1
 *                 description: Precio override en centavos
 *               activo:
 *                 type: boolean
 *                 description: Estado del slot
 *               notas:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *                 description: Notas adicionales
 *     responses:
 *       200:
 *         description: Slot actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VendingMachineSlot'
 *       400:
 *         description: Datos de entrada inválidos o stock total excede capacidad
 *       404:
 *         description: Slot no encontrado
 *       500:
 *         description: Error interno del servidor
 *
 *   delete:
 *     summary: Eliminar slot
 *     description: Elimina un slot de la máquina vending
 *     tags: [Vending Machine Slots]
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
 *                 description: ID del slot a eliminar
 *     responses:
 *       200:
 *         description: Slot eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Slot {id} eliminado exitosamente"
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Slot no encontrado
 *       500:
 *         description: Error interno del servidor
 */

const controller = new VendingMachineSlotController();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return controller.handle(req, res);
}
