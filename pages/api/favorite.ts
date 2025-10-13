// CRUD endpoints para Favorite - Clean Architecture
import type { NextApiRequest, NextApiResponse } from "next";
import { FavoriteController } from "../../src/controllers/favorite.controller";
import { asyncHandler } from "../../src/middlewares/error-handler";

/**
 * @swagger
 * /api/favorite:
 *   get:
 *     summary: Obtener todos los favoritos
 *     tags: [Favorites]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar favoritos por usuario
 *       - in: query
 *         name: service_point_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar favoritos por punto de servicio
 *     responses:
 *       200:
 *         description: Lista de favoritos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Favorite'
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error del servidor
 *   post:
 *     summary: Agregar punto de servicio a favoritos
 *     tags: [Favorites]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - service_point_id
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
 *     responses:
 *       201:
 *         description: Favorito agregado exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 *   put:
 *     summary: Actualizar favorito
 *     tags: [Favorites]
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
 *               service_point_id:
 *                 type: string
 *                 format: uuid
 *               workshop_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Favorito actualizado exitosamente
 *       400:
 *         description: ID no proporcionado o inválido
 *       500:
 *         description: Error del servidor
 *   delete:
 *     summary: Eliminar favorito
 *     tags: [Favorites]
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
 *         description: Favorito eliminado exitosamente
 *       400:
 *         description: ID no proporcionado o inválido
 *       500:
 *         description: Error del servidor
 */
export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const controller = new FavoriteController();
  return controller.handle(req, res);
});
