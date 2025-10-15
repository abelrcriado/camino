/**
 * API Route: /api/alerts
 * 
 * @swagger
 * /api/alerts:
 *   get:
 *     summary: Obtener alertas del sistema
 *     description: Obtiene lista de alertas con filtros y paginación
 *     tags: [Alerts]
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [low_stock_vending, low_stock_warehouse, machine_offline, machine_maintenance, stock_critical, restock_needed]
 *         description: Filtrar por tipo de alerta
 *       - in: query
 *         name: severidad
 *         schema:
 *           type: string
 *           enum: [info, warning, critical]
 *         description: Filtrar por severidad
 *       - in: query
 *         name: leida
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado leída/no leída
 *       - in: query
 *         name: accion_requerida
 *         schema:
 *           type: boolean
 *         description: Filtrar alertas que requieren acción
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
 *         description: Alertas por página
 *     responses:
 *       200:
 *         description: Lista de alertas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Alert'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Parámetros inválidos
 *   post:
 *     summary: Crear nueva alerta
 *     description: Crea una nueva alerta en el sistema
 *     tags: [Alerts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo
 *               - severidad
 *               - mensaje
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [low_stock_vending, low_stock_warehouse, machine_offline, machine_maintenance, stock_critical, restock_needed]
 *               severidad:
 *                 type: string
 *                 enum: [info, warning, critical]
 *               mensaje:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *               entidad_tipo:
 *                 type: string
 *                 maxLength: 50
 *               entidad_id:
 *                 type: string
 *                 format: uuid
 *               accion_requerida:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Alerta creada exitosamente
 *       400:
 *         description: Datos inválidos
 *   put:
 *     summary: Actualizar alerta
 *     description: Actualiza una alerta existente
 *     tags: [Alerts]
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
 *               leida:
 *                 type: boolean
 *               mensaje:
 *                 type: string
 *               severidad:
 *                 type: string
 *                 enum: [info, warning, critical]
 *     responses:
 *       200:
 *         description: Alerta actualizada
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Alerta no encontrada
 *   delete:
 *     summary: Eliminar alerta
 *     description: Elimina una alerta del sistema
 *     tags: [Alerts]
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
 *         description: Alerta eliminada
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Alerta no encontrada
 *
 * components:
 *   schemas:
 *     Alert:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         tipo:
 *           type: string
 *           enum: [low_stock_vending, low_stock_warehouse, machine_offline, machine_maintenance, stock_critical, restock_needed]
 *         severidad:
 *           type: string
 *           enum: [info, warning, critical]
 *         mensaje:
 *           type: string
 *         entidad_tipo:
 *           type: string
 *         entidad_id:
 *           type: string
 *           format: uuid
 *         leida:
 *           type: boolean
 *         accion_requerida:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

import { NextApiRequest, NextApiResponse } from "next";
import { AlertController } from "@/controllers/alert.controller";
import { asyncHandler } from "@/middlewares/error-handler";

const controller = new AlertController();

export default asyncHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    return await controller.handle(req, res);
  }
);
