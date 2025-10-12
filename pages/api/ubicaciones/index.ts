// Endpoint base para ubicaciones (locations) - Operaciones CRUD
import type { NextApiRequest, NextApiResponse } from "next";
import { LocationController } from "../../../src/controllers/location.controller";

/**
 * @swagger
 * /api/ubicaciones:
 *   get:
 *     summary: Listar ubicaciones
 *     description: Obtiene la lista completa de ubicaciones (locations) con filtros opcionales
 *     tags: [Ubicaciones]
 *     parameters:
 *       - in: query
 *         name: camino_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por camino
 *       - in: query
 *         name: province
 *         schema:
 *           type: string
 *         description: Filtrar por provincia
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filtrar por ciudad
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página para paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Resultados por página
 *     responses:
 *       200:
 *         description: Lista de ubicaciones obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Location'
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
 *                     hasMore:
 *                       type: boolean
 *       500:
 *         description: Error interno del servidor
 *   post:
 *     summary: Crear nueva ubicación
 *     description: Crea una nueva ubicación en el sistema
 *     tags: [Ubicaciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - city
 *               - province
 *             properties:
 *               city:
 *                 type: string
 *                 maxLength: 100
 *                 example: Santiago de Compostela
 *               province:
 *                 type: string
 *                 maxLength: 100
 *                 example: A Coruña
 *               camino_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del camino al que pertenece
 *               address:
 *                 type: string
 *                 maxLength: 200
 *                 example: Plaza del Obradoiro
 *               postal_code:
 *                 type: string
 *                 maxLength: 20
 *                 example: 15704
 *               latitude:
 *                 type: number
 *                 format: float
 *                 example: 42.8805
 *               longitude:
 *                 type: number
 *                 format: float
 *                 example: -8.5456
 *     responses:
 *       201:
 *         description: Ubicación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Location'
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error interno del servidor
 *   put:
 *     summary: Actualizar ubicación
 *     description: Actualiza los datos de una ubicación existente
 *     tags: [Ubicaciones]
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
 *               city:
 *                 type: string
 *                 maxLength: 100
 *               province:
 *                 type: string
 *                 maxLength: 100
 *               camino_id:
 *                 type: string
 *                 format: uuid
 *               address:
 *                 type: string
 *                 maxLength: 200
 *               postal_code:
 *                 type: string
 *                 maxLength: 20
 *               latitude:
 *                 type: number
 *                 format: float
 *               longitude:
 *                 type: number
 *                 format: float
 *     responses:
 *       200:
 *         description: Ubicación actualizada exitosamente
 *       400:
 *         description: ID faltante o datos inválidos
 *       404:
 *         description: Ubicación no encontrada
 *       500:
 *         description: Error interno del servidor
 *   delete:
 *     summary: Eliminar ubicación
 *     description: Elimina una ubicación del sistema
 *     tags: [Ubicaciones]
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
 *         description: Ubicación eliminada exitosamente
 *       400:
 *         description: ID faltante
 *       404:
 *         description: Ubicación no encontrada
 *       500:
 *         description: Error interno del servidor
 *
 * components:
 *   schemas:
 *     Location:
 *       type: object
 *       required:
 *         - id
 *         - city
 *         - province
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         city:
 *           type: string
 *         province:
 *           type: string
 *         camino_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         address:
 *           type: string
 *           nullable: true
 *         postal_code:
 *           type: string
 *           nullable: true
 *         latitude:
 *           type: number
 *           format: float
 *           nullable: true
 *         longitude:
 *           type: number
 *           format: float
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const controller = new LocationController();
  return controller.handle(req, res);
}

export default handler;
