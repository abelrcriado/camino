import { AuthController } from "@/api/controllers/auth.controller";
import { requireAuth } from "@/api/middlewares/auth.middleware";

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener usuario actual
 *     description: Retorna los datos del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario actual
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                     full_name:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [peregrino, gestor_punto, admin]
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: No autenticado
 *       405:
 *         description: Método no permitido
 *   put:
 *     summary: Actualizar perfil del usuario
 *     description: Actualiza los datos del usuario autenticado (nombre, teléfono)
 *     tags: [Autenticación]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               apellidos:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               telefono:
 *                 type: string
 *                 pattern: ^\+?[0-9]{9,15}$
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     full_name:
 *                       type: string
 *                     phone:
 *                       type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       405:
 *         description: Método no permitido
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

const controller = new AuthController();
export default requireAuth(controller.handleMe);
