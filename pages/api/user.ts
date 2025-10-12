// CRUD endpoints para User/Profile - Clean Architecture
import type { NextApiRequest, NextApiResponse } from "next";
import { UserController } from "../../src/controllers/user.controller";

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Listar perfiles de usuario
 *     description: Obtiene la lista completa de perfiles de usuario con filtros opcionales
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *           format: email
 *         description: Filtrar por email exacto
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filtrar por rol de usuario
 *     responses:
 *       200:
 *         description: Lista de perfiles obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Profile'
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
 *     summary: Crear un nuevo perfil de usuario
 *     description: Crea un nuevo perfil de usuario en el sistema
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - email
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               email:
 *                 type: string
 *                 format: email
 *               full_name:
 *                 type: string
 *               avatar_url:
 *                 type: string
 *               phone:
 *                 type: string
 *               preferred_language:
 *                 type: string
 *     responses:
 *       201:
 *         description: Perfil creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Profile'
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error interno del servidor
 *   put:
 *     summary: Actualizar perfil de usuario
 *     description: Actualiza los datos de un perfil existente
 *     tags: [Users]
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
 *               email:
 *                 type: string
 *                 format: email
 *               full_name:
 *                 type: string
 *               avatar_url:
 *                 type: string
 *               phone:
 *                 type: string
 *               preferred_language:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Profile'
 *       400:
 *         description: ID de usuario faltante
 *       500:
 *         description: Error interno del servidor
 *   delete:
 *     summary: Eliminar perfil de usuario
 *     description: Elimina un perfil de usuario del sistema
 *     tags: [Users]
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
 *         description: Perfil eliminado exitosamente
 *       400:
 *         description: ID de usuario faltante
 *       500:
 *         description: Error interno del servidor
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const controller = new UserController();
  return controller.handle(req, res);
}

export default handler;
