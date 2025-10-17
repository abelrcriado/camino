import { AuthController } from "@/api/controllers/auth.controller";
import { requireAuth } from "@/api/middlewares/auth.middleware";

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     description: Invalida la sesión actual del usuario. Requiere token válido.
 *     tags: [Autenticación]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sesión cerrada exitosamente
 *       401:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Token de autenticación requerido
 *       405:
 *         description: Método no permitido
 */

const controller = new AuthController();
export default requireAuth(controller.handleLogout);
