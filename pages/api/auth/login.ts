import { AuthController } from "@/api/controllers/auth.controller";

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica un usuario con email y contraseña, retorna tokens JWT
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@example.com
 *                 description: Email del usuario
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: MiPassword123
 *                 description: Contraseña del usuario (mínimo 6 caracteres)
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         email:
 *                           type: string
 *                         full_name:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         role:
 *                           type: string
 *                           enum: [peregrino, gestor_punto, admin]
 *                     session:
 *                       type: object
 *                       properties:
 *                         access_token:
 *                           type: string
 *                           description: JWT para autenticar requests
 *                         refresh_token:
 *                           type: string
 *                           description: Token para renovar access_token
 *                         expires_at:
 *                           type: integer
 *                           description: Timestamp de expiración del access_token
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Email inválido
 *       401:
 *         description: Credenciales incorrectas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Email o contraseña incorrectos
 *       405:
 *         description: Método no permitido
 */

const controller = new AuthController();
export default controller.handleLogin;
