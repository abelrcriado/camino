// CRUD endpoints para Service Assignments - Clean Architecture
import type { NextApiRequest, NextApiResponse } from "next";
import { ServiceAssignmentController } from "../../src/controllers/service_assignment.controller";
import { asyncHandler } from "@/middlewares/error-handler";

/**
 * @swagger
 * /api/service-assignments:
 *   get:
 *     summary: Listar asignaciones servicio-service_point
 *     description: Obtiene la lista de asignaciones N:M entre servicios y service points con filtros opcionales
 *     tags: [Service Assignments]
 *     parameters:
 *       - in: query
 *         name: service_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de servicio
 *       - in: query
 *         name: service_point_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de service point
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filtrar por estado activo/inactivo
 *       - in: query
 *         name: priority_min
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Filtrar por prioridad mínima
 *       - in: query
 *         name: priority_max
 *         schema:
 *           type: integer
 *           maximum: 100
 *         description: Filtrar por prioridad máxima
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
 *           default: 50
 *         description: Cantidad de resultados por página
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [priority, created_at, updated_at]
 *           default: priority
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden ascendente o descendente
 *     responses:
 *       200:
 *         description: Lista de asignaciones obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ServiceAssignment'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 *   post:
 *     summary: Crear nueva asignación
 *     description: Asigna un servicio a un service point (relación N:M)
 *     tags: [Service Assignments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - service_id
 *               - service_point_id
 *             properties:
 *               service_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del servicio a asignar
 *               service_point_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del service point donde estará disponible
 *               is_active:
 *                 type: boolean
 *                 default: true
 *                 description: Estado activo de la asignación
 *               priority:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 default: 0
 *                 description: Prioridad de visualización (0-100, mayor = más prioridad)
 *               configuracion:
 *                 type: object
 *                 description: Configuración específica JSON para esta asignación
 *                 example: {"max_concurrent": 5, "pricing_override": 1500}
 *     responses:
 *       201:
 *         description: Asignación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ServiceAssignment'
 *       400:
 *         description: Error de validación (datos inválidos)
 *       409:
 *         description: La asignación ya existe (unique constraint)
 *       500:
 *         description: Error interno del servidor
 *   put:
 *     summary: Actualizar asignación
 *     description: Actualiza los datos de una asignación existente
 *     tags: [Service Assignments]
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
 *                 description: ID de la asignación a actualizar
 *               service_id:
 *                 type: string
 *                 format: uuid
 *                 description: Nuevo ID de servicio (opcional)
 *               service_point_id:
 *                 type: string
 *                 format: uuid
 *                 description: Nuevo ID de service point (opcional)
 *               is_active:
 *                 type: boolean
 *                 description: Actualizar estado activo/inactivo
 *               priority:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Actualizar prioridad
 *               configuracion:
 *                 type: object
 *                 description: Actualizar configuración JSON
 *     responses:
 *       200:
 *         description: Asignación actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ServiceAssignment'
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Asignación no encontrada
 *       409:
 *         description: Conflicto - nueva combinación ya existe
 *       500:
 *         description: Error interno del servidor
 *   delete:
 *     summary: Eliminar asignación (soft delete)
 *     description: Marca una asignación como inactiva (soft delete)
 *     tags: [Service Assignments]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la asignación a eliminar
 *     responses:
 *       200:
 *         description: Asignación marcada como inactiva exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Asignación con id 123e4567-e89b-12d3-a456-426614174000 marcada como inactiva exitosamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Asignación no encontrada
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ServiceAssignment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único de la asignación
 *         service_id:
 *           type: string
 *           format: uuid
 *           description: ID del servicio asignado
 *         service_point_id:
 *           type: string
 *           format: uuid
 *           description: ID del service point donde está disponible
 *         is_active:
 *           type: boolean
 *           description: Estado activo/inactivo de la asignación
 *         priority:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           description: Prioridad de visualización
 *         configuracion:
 *           type: object
 *           description: Configuración específica en formato JSON
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *       required:
 *         - id
 *         - service_id
 *         - service_point_id
 *         - is_active
 *         - priority
 */

const controller = new ServiceAssignmentController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  return controller.handle(req, res);
});
