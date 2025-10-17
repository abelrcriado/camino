import { AuthController } from "@/api/controllers/auth.controller";

/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     summary: Verificar email del usuario
 *     description: Callback para confirmar email a través del enlace enviado por Supabase
 *     tags: [Autenticación]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de verificación enviado por email
 *     responses:
 *       200:
 *         description: Email verificado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email verificado exitosamente
 *       400:
 *         description: Token inválido o falta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Token de verificación requerido
 *       401:
 *         description: Token expirado o ya usado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Token de verificación inválido o expirado
 *       405:
 *         description: Método no permitido
 */

const controller = new AuthController();
export default controller.handleVerifyEmail;
