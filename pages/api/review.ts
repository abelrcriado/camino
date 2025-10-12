// CRUD endpoints para Review - Clean Architecture
import type { NextApiRequest, NextApiResponse } from "next";
import { ReviewController } from "../../src/controllers/review.controller";

/**
 * @swagger
 * /api/review:
 *   get:
 *     summary: Obtener todas las reseñas
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar reseñas por usuario
 *       - in: query
 *         name: service_point_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar reseñas por punto de servicio
 *       - in: query
 *         name: workshop_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar reseñas por taller
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filtrar reseñas por calificación
 *     responses:
 *       200:
 *         description: Lista de reseñas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error del servidor
 *   post:
 *     summary: Crear nueva reseña
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - rating
 *               - comment
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *               service_point_id:
 *                 type: string
 *                 format: uuid
 *               workshop_id:
 *                 type: string
 *                 format: uuid
 *               booking_id:
 *                 type: string
 *                 format: uuid
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       201:
 *         description: Reseña creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 *   put:
 *     summary: Actualizar reseña existente
 *     tags: [Reviews]
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
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Reseña actualizada exitosamente
 *       400:
 *         description: ID no proporcionado o inválido
 *       500:
 *         description: Error del servidor
 *   delete:
 *     summary: Eliminar reseña
 *     tags: [Reviews]
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
 *         description: Reseña eliminada exitosamente
 *       400:
 *         description: ID no proporcionado o inválido
 *       500:
 *         description: Error del servidor
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const controller = new ReviewController();
  return controller.handle(req, res);
}

export default handler;
