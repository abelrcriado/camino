/**
 * @swagger
 * /api/precios:
 *   get:
 *     summary: Obtiene precios con filtros y paginación
 *     tags: [Precios]
 *     parameters:
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [vigentes, aplicable, stats]
 *         description: Acción especial (vigentes, aplicable, stats)
 *       - in: query
 *         name: nivel
 *         schema:
 *           type: string
 *           enum: [base, ubicacion, service_point]
 *         description: Filtrar por nivel de precio
 *       - in: query
 *         name: entidad_tipo
 *         schema:
 *           type: string
 *           enum: [producto, servicio]
 *         description: Tipo de entidad
 *       - in: query
 *         name: entidad_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la entidad
 *       - in: query
 *         name: ubicacion_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la ubicación
 *       - in: query
 *         name: service_point_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del service point
 *       - in: query
 *         name: vigente
 *         schema:
 *           type: boolean
 *         description: Solo precios vigentes
 *       - in: query
 *         name: fecha
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha para validar vigencia (YYYY-MM-DD)
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
 *           maximum: 100
 *         description: Resultados por página
 *       - in: query
 *         name: order_by
 *         schema:
 *           type: string
 *           enum: [precio, fecha_inicio, created_at]
 *         description: Campo para ordenar
 *       - in: query
 *         name: order_direction
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Dirección del ordenamiento
 *     responses:
 *       200:
 *         description: Lista de precios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Precio'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *             examples:
 *               precios:
 *                 summary: Ejemplo de respuesta de precios
 *                 value:
 *                   data:
 *                     - id: "550e8400-e29b-41d4-a716-446655440000"
 *                       nivel: "base"
 *                       entidad_tipo: "producto"
 *                       entidad_id: "650e8400-e29b-41d4-a716-446655440001"
 *                       precio: 250
 *                       fecha_inicio: "2025-01-01"
 *                       fecha_fin: null
 *                       ubicacion_id: null
 *                       service_point_id: null
 *                       notas: "Precio base de 2.50€"
 *                       created_at: "2025-10-11T10:00:00Z"
 *                       updated_at: "2025-10-11T10:00:00Z"
 *                   pagination:
 *                     page: 1
 *                     limit: 20
 *                     total: 50
 *                     totalPages: 3
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error del servidor
 * 
 *   post:
 *     summary: Crea un nuevo precio
 *     tags: [Precios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nivel
 *               - entidad_tipo
 *               - entidad_id
 *               - precio
 *             properties:
 *               nivel:
 *                 type: string
 *                 enum: [base, ubicacion, service_point]
 *                 description: Nivel jerárquico del precio
 *               entidad_tipo:
 *                 type: string
 *                 enum: [producto, servicio]
 *                 description: Tipo de entidad
 *               entidad_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la entidad (producto_id o service_id)
 *               precio:
 *                 type: integer
 *                 minimum: 1
 *                 description: Precio en céntimos (ej 250 = 2.50€)
 *               ubicacion_id:
 *                 type: string
 *                 format: uuid
 *                 description: Requerido para niveles ubicacion y service_point
 *               service_point_id:
 *                 type: string
 *                 format: uuid
 *                 description: Requerido solo para nivel service_point
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio de vigencia (por defecto HOY)
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *                 description: Fecha de fin de vigencia (null = indefinido)
 *               notas:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Notas adicionales
 *           examples:
 *             precioBase:
 *               summary: Precio BASE global
 *               value:
 *                 nivel: "base"
 *                 entidad_tipo: "producto"
 *                 entidad_id: "650e8400-e29b-41d4-a716-446655440001"
 *                 precio: 250
 *                 notas: "Precio base de Coca-Cola 2.50€"
 *             precioUbicacion:
 *               summary: Precio UBICACION override
 *               value:
 *                 nivel: "ubicacion"
 *                 entidad_tipo: "producto"
 *                 entidad_id: "650e8400-e29b-41d4-a716-446655440001"
 *                 ubicacion_id: "750e8400-e29b-41d4-a716-446655440002"
 *                 precio: 300
 *                 notas: "Precio para Madrid 3.00€"
 *             precioServicePoint:
 *               summary: Precio SERVICE_POINT override
 *               value:
 *                 nivel: "service_point"
 *                 entidad_tipo: "producto"
 *                 entidad_id: "650e8400-e29b-41d4-a716-446655440001"
 *                 ubicacion_id: "750e8400-e29b-41d4-a716-446655440002"
 *                 service_point_id: "850e8400-e29b-41d4-a716-446655440003"
 *                 precio: 350
 *                 fecha_inicio: "2025-11-01"
 *                 fecha_fin: "2025-12-31"
 *                 notas: "Promoción navideña 3.50€"
 *     responses:
 *       201:
 *         description: Precio creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Precio'
 *       400:
 *         description: Datos inválidos o precio duplicado
 *       500:
 *         description: Error del servidor
 * 
 *   put:
 *     summary: Actualiza un precio existente
 *     tags: [Precios]
 *     description: Solo permite actualizar precio, fechas y notas. Para cambiar nivel/entidad, crear un nuevo precio.
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
 *               precio:
 *                 type: integer
 *                 minimum: 1
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *               notas:
 *                 type: string
 *                 maxLength: 1000
 *           example:
 *             id: "550e8400-e29b-41d4-a716-446655440000"
 *             precio: 275
 *             notas: "Precio actualizado a 2.75€"
 *     responses:
 *       200:
 *         description: Precio actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Precio'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Precio no encontrado
 *       500:
 *         description: Error del servidor
 * 
 *   delete:
 *     summary: Elimina un precio
 *     tags: [Precios]
 *     description: Por defecto hace soft delete (establece fecha_fin). Usar ?soft=false para hard delete.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del precio a eliminar
 *       - in: query
 *         name: soft
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Si es true, hace soft delete (establece fecha_fin)
 *     responses:
 *       200:
 *         description: Precio eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Precio eliminado exitosamente"
 *       404:
 *         description: Precio no encontrado
 *       500:
 *         description: Error del servidor
 * 
 * components:
 *   schemas:
 *     Precio:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         nivel:
 *           type: string
 *           enum: [base, ubicacion, service_point]
 *         entidad_tipo:
 *           type: string
 *           enum: [producto, servicio]
 *         entidad_id:
 *           type: string
 *           format: uuid
 *         precio:
 *           type: integer
 *           description: Precio en céntimos
 *         ubicacion_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         service_point_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         fecha_inicio:
 *           type: string
 *           format: date
 *         fecha_fin:
 *           type: string
 *           format: date
 *           nullable: true
 *         notas:
 *           type: string
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     
 *     PaginationMeta:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *         limit:
 *           type: integer
 *         total:
 *           type: integer
 *         totalPages:
 *           type: integer
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { PrecioController } from "@/controllers/precio.controller";

const controller = new PrecioController();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return controller.handleRequest(req, res);
}
