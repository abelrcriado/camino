// CRUD endpoints para Taller Manager - Clean Architecture
import type { NextApiRequest, NextApiResponse } from "next";
import { TallerManagerController } from "../../src/controllers/taller_manager.controller";

/**
 * @swagger
 * /api/taller_manager:
 *   get:
 *     summary: Obtener todos los gestores de taller
 *     tags: [Operations]
 *     parameters:
 *       - in: query
 *         name: workshop_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar gestores por taller
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar gestores por usuario
 *     responses:
 *       200:
 *         description: Lista de gestores obtenida exitosamente
 *       500:
 *         description: Error del servidor
 *   post:
 *     summary: Crear nuevo gestor de taller
 *     tags: [Operations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workshop_id
 *               - user_id
 *               - name
 *               - email
 *               - phone
 *             properties:
 *               workshop_id:
 *                 type: string
 *                 format: uuid
 *               user_id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Gestor creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 *   put:
 *     summary: Actualizar gestor de taller
 *     tags: [Operations]
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
 *               workshop_id:
 *                 type: string
 *                 format: uuid
 *               user_id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Gestor actualizado exitosamente
 *       400:
 *         description: ID no proporcionado o inválido
 *       500:
 *         description: Error del servidor
 *   delete:
 *     summary: Eliminar gestor de taller
 *     tags: [Operations]
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
 *         description: Gestor eliminado exitosamente
 *       400:
 *         description: ID no proporcionado o inválido
 *       500:
 *         description: Error del servidor
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const controller = new TallerManagerController();
  return controller.handle(req, res);
}

export default handler;
