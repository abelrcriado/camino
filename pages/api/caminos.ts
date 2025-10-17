// CRUD endpoints para Caminos - Clean Architecture
import type { NextApiRequest, NextApiResponse } from "next";
import { CaminoController } from "@/api/controllers/camino.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";

/**
 * @swagger
 * /api/caminos:
 *   get:
 *     summary: Listar caminos
 *     description: Obtiene la lista completa de caminos con filtros opcionales
 *     tags: [Caminos]
 *     parameters:
 *       - in: query
 *         name: codigo
 *         schema:
 *           type: string
 *         description: Filtrar por código de camino (ej. CSF, CN, CP)
 *       - in: query
 *         name: estado_operativo
 *         schema:
 *           type: string
 *           enum: [activo, inactivo, mantenimiento, planificado]
 *         description: Filtrar por estado operativo
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Filtrar por región geográfica
 *     responses:
 *       200:
 *         description: Lista de caminos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Camino'
 *       400:
 *         description: Parámetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     summary: Crear un nuevo camino
 *     description: Crea un nuevo camino en el sistema
 *     tags: [Caminos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - codigo
 *             properties:
 *               nombre:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 150
 *                 description: Nombre descriptivo del camino
 *                 example: Camino de Santiago Francés
 *               codigo:
 *                 type: string
 *                 pattern: '^[A-Z0-9_-]+$'
 *                 minLength: 2
 *                 maxLength: 10
 *                 description: Código único alfanumérico
 *                 example: CSF
 *               zona_operativa:
 *                 type: string
 *                 maxLength: 100
 *                 description: Zona geográfica de operación
 *                 example: Norte de España
 *               region:
 *                 type: string
 *                 maxLength: 100
 *                 description: Región administrativa
 *                 example: Galicia, Castilla y León
 *               estado_operativo:
 *                 type: string
 *                 enum: [activo, inactivo, mantenimiento, planificado]
 *                 default: activo
 *                 description: Estado operativo del camino
 *               descripcion:
 *                 type: string
 *                 description: Descripción detallada del camino
 *     responses:
 *       201:
 *         description: Camino creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Camino'
 *       400:
 *         description: Error de validación (código duplicado, datos inválidos)
 *       409:
 *         description: El código de camino ya existe
 *       500:
 *         description: Error interno del servidor
 *   put:
 *     summary: Actualizar camino
 *     description: Actualiza los datos de un camino existente
 *     tags: [Caminos]
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
 *                 description: ID del camino a actualizar
 *               nombre:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 150
 *               codigo:
 *                 type: string
 *                 pattern: '^[A-Z0-9_-]+$'
 *                 minLength: 2
 *                 maxLength: 10
 *               zona_operativa:
 *                 type: string
 *                 maxLength: 100
 *               region:
 *                 type: string
 *                 maxLength: 100
 *               estado_operativo:
 *                 type: string
 *                 enum: [activo, inactivo, mantenimiento, planificado]
 *               descripcion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Camino actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Camino'
 *       400:
 *         description: ID faltante o al menos un campo debe ser actualizado
 *       404:
 *         description: Camino no encontrado
 *       409:
 *         description: El código de camino ya existe
 *       500:
 *         description: Error interno del servidor
 *   delete:
 *     summary: Eliminar camino
 *     description: Elimina un camino del sistema
 *     tags: [Caminos]
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
 *                 description: ID del camino a eliminar
 *     responses:
 *       200:
 *         description: Camino eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Camino eliminado exitosamente
 *       400:
 *         description: ID de camino faltante
 *       404:
 *         description: Camino no encontrado
 *       500:
 *         description: Error interno del servidor
 *
 * components:
 *   schemas:
 *     Camino:
 *       type: object
 *       required:
 *         - id
 *         - nombre
 *         - codigo
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         nombre:
 *           type: string
 *         codigo:
 *           type: string
 *         zona_operativa:
 *           type: string
 *           nullable: true
 *         region:
 *           type: string
 *           nullable: true
 *         estado_operativo:
 *           type: string
 *           enum: [activo, inactivo, mantenimiento, planificado]
 *         descripcion:
 *           type: string
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Mensaje de error en español
 */
export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const controller = new CaminoController();
  return controller.handle(req, res);
});
