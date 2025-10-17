import { AuthController } from "@/api/controllers/auth.controller";

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     description: Crea una cuenta nueva con email y contraseña. Envía email de confirmación.
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
 *               - nombre
 *               - apellidos
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nuevo@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 pattern: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$
 *                 example: Password123
 *                 description: Mínimo 6 caracteres, debe incluir mayúscula, minúscula y número
 *               nombre:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: Juan
 *               apellidos:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: Pérez García
 *               telefono:
 *                 type: string
 *                 pattern: ^\+?[0-9]{9,15}$
 *                 example: "+34600123456"
 *                 description: Formato E.164 recomendado
 *               rol:
 *                 type: string
 *                 enum: [peregrino, gestor_punto]
 *                 default: peregrino
 *                 description: Admin solo asignable por otros admins
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente. Email de confirmación enviado.
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
 *                     session:
 *                       type: object
 *                       nullable: true
 *                       description: Null hasta confirmar email
 *                 message:
 *                   type: string
 *                   example: "Usuario registrado. Verifica tu email para activar la cuenta."
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "La contraseña debe contener al menos una mayúscula, minúscula y número"
 *       409:
 *         description: Email ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: El email ya está registrado
 *       405:
 *         description: Método no permitido
 */

const controller = new AuthController();
export default controller.handleRegister;
