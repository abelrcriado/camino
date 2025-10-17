import { AuthController } from "@/api/controllers/auth.controller";

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Solicitar restablecimiento de contraseña
 *     description: Envía un email con enlace para restablecer contraseña
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@example.com
 *                 description: Email de la cuenta a recuperar
 *     responses:
 *       200:
 *         description: Email enviado (siempre retorna 200 por seguridad)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Si el email existe, recibirás instrucciones para restablecer tu contraseña
 *       400:
 *         description: Email inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Email inválido
 *       405:
 *         description: Método no permitido
 */

const controller = new AuthController();
export default controller.handleResetPassword;
