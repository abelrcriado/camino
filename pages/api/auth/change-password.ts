import { AuthController } from "@/api/controllers/auth.controller";
import { requireAuth } from "@/api/middlewares/auth.middleware";

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Cambiar contraseña del usuario autenticado
 *     description: Cambia la contraseña verificando primero la contraseña actual
 *     tags: [Autenticación]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: PasswordActual123
 *                 description: Contraseña actual para verificar identidad
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 pattern: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$
 *                 example: NuevaPassword456
 *                 description: Nueva contraseña (mínimo 6 caracteres, con mayúscula, minúscula y número)
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Contraseña actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: La nueva contraseña debe contener al menos una mayúscula, minúscula y número
 *       401:
 *         description: No autenticado o contraseña actual incorrecta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: La contraseña actual es incorrecta
 *       405:
 *         description: Método no permitido
 */

const controller = new AuthController();
export default requireAuth(controller.handleChangePassword);
