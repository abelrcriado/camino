import { AuthController } from "@/api/controllers/auth.controller";

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renovar access token
 *     description: Genera un nuevo access_token usando el refresh_token
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 description: Refresh token obtenido en login o registro
 *     responses:
 *       200:
 *         description: Tokens renovados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     session:
 *                       type: object
 *                       properties:
 *                         access_token:
 *                           type: string
 *                           description: Nuevo JWT access token
 *                         refresh_token:
 *                           type: string
 *                           description: Nuevo refresh token
 *                         expires_at:
 *                           type: integer
 *                           description: Timestamp de expiración del access_token
 *       400:
 *         description: Refresh token inválido o falta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Refresh token requerido
 *       401:
 *         description: Refresh token expirado o revocado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Refresh token inválido o expirado
 *       405:
 *         description: Método no permitido
 */

const controller = new AuthController();
export default controller.handleRefresh;
