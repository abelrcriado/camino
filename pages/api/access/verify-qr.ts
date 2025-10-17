/**
 * @swagger
 * /api/access/verify-qr:
 *   post:
 *     summary: Verificar QR code escaneado en punto de servicio
 *     description: |
 *       Valida un código QR generado offline por la app móvil.
 *       
 *       **Validaciones que realiza:**
 *       - Verifica firma HMAC-SHA256 (anti-falsificación)
 *       - Comprueba expiración (24 horas)
 *       - Valida uso único (no permitir re-escaneos)
 *       - Verifica que QR no esté invalidado (por devolución)
 *       - Registra log de auditoría
 *       
 *       **Flujo:**
 *       1. Usuario compra producto/servicio offline
 *       2. App genera QR firmado con HMAC
 *       3. CSP escanea QR en ubicación
 *       4. Backend valida y registra acceso
 *       5. Retorna items comprados y total
 *     tags:
 *       - Access Control
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qr_data
 *               - location_id
 *             properties:
 *               qr_data:
 *                 type: string
 *                 description: Contenido del QR en base64 (payload JSON firmado)
 *                 example: "eyJ0cmFuc2FjdGlvbl9pZCI6IjEyMy00NTYiLCJ1c2VyX2lkIjoiNzg5LTAxMiIsIml0ZW1zIjpbeyJ0eXBlIjoicHJvZHVjdCIsImlkIjoicHJvZC0xIiwibmFtZSI6IkJvY2FkaWxsbyIsInF1YW50aXR5IjoxLCJwcmljZSI6My41fV0sInRpbWVzdGFtcCI6MTcwOTg1NDgwMDAwMCwic2lnbmF0dXJlIjoiYWJjMTIzLi4uIiwidmVyc2lvbiI6IjEuMCJ9"
 *               location_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la ubicación (refugio/albergue) donde se escanea
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               scanned_by:
 *                 type: string
 *                 format: uuid
 *                 description: (Opcional) ID del hospitalero/CSP que escanea el QR
 *                 example: "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
 *     responses:
 *       200:
 *         description: QR válido - Acceso autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 transaction:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: ID de la transacción
 *                     items:
 *                       type: array
 *                       description: Productos/servicios comprados
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             enum: [product, service]
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *                           quantity:
 *                             type: integer
 *                           price:
 *                             type: number
 *                             format: float
 *                     total:
 *                       type: number
 *                       format: float
 *                       description: Total de la compra
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                       description: ID del usuario
 *                 message:
 *                   type: string
 *                   example: "QR válido - Acceso autorizado"
 *       400:
 *         description: QR inválido o corrupto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "QR inválido o corrupto"
 *       403:
 *         description: QR falsificado (firma HMAC inválida)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "QR falsificado o manipulado"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Usuario no encontrado"
 *       409:
 *         description: QR ya utilizado anteriormente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "QR ya utilizado anteriormente"
 *       410:
 *         description: QR expirado o invalidado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   examples:
 *                     expired:
 *                       value: "QR expirado"
 *                     invalidated:
 *                       value: "QR invalidado: devolución"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al procesar QR"
 */

import { QRValidationController } from '@/api/controllers/qr-validation.controller';
import { TransactionRepository } from '@/api/repositories/transaction.repository';
import { AccessLogRepository } from '@/api/repositories/access_log.repository';
import { UserRepository } from '@/api/repositories/user.repository';

// Instanciar repositorios con DI pattern
const transactionRepo = new TransactionRepository();
const accessLogRepo = new AccessLogRepository();
const userRepo = new UserRepository();

// Instanciar controller con repositorios inyectados
const controller = new QRValidationController(transactionRepo, accessLogRepo, userRepo);

export default controller.verifyQR;
