/**
 * @swagger
 * /api/access/logs:
 *   get:
 *     summary: Consultar logs de acceso (auditoría de QR)
 *     description: |
 *       Obtiene los registros de auditoría de todos los escaneos de QR realizados.
 *       
 *       **Información registrada:**
 *       - Qué QR se escaneó (transaction_id)
 *       - Quién lo escaneó (user_id, scanned_by)
 *       - Dónde se escaneó (location_id)
 *       - Cuándo se escaneó (timestamp)
 *       - Resultado de validación (valid, invalid, expired, already_used, falsified)
 *       
 *       **Casos de uso:**
 *       - Auditoría de accesos a refugios/albergues
 *       - Detección de intentos de falsificación
 *       - Análisis de patrones de uso
 *       - Compliance y trazabilidad
 *       
 *       **Filtros disponibles:**
 *       - Por usuario (user_id)
 *       - Por ubicación (location_id)
 *       - Por transacción específica (transaction_id)
 *       - Por resultado de validación (valid, invalid, etc.)
 *       - Por rango de fechas (from, to)
 *     tags:
 *       - Access Control
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items por página
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de usuario
 *       - in: query
 *         name: location_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de ubicación (refugio/albergue)
 *       - in: query
 *         name: transaction_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de transacción específica
 *       - in: query
 *         name: validation_result
 *         schema:
 *           type: string
 *           enum: [valid, invalid, expired, already_used, falsified]
 *         description: Filtrar por resultado de validación
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha/hora inicio (ISO 8601)
 *         example: "2025-10-01T00:00:00.000Z"
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha/hora fin (ISO 8601)
 *         example: "2025-10-17T23:59:59.999Z"
 *     responses:
 *       200:
 *         description: Logs consultados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         description: ID del log
 *                       transaction_id:
 *                         type: string
 *                         format: uuid
 *                         description: ID de la transacción escaneada
 *                       user_id:
 *                         type: string
 *                         format: uuid
 *                         description: ID del usuario dueño del QR
 *                       location_id:
 *                         type: string
 *                         format: uuid
 *                         description: Ubicación donde se escaneó
 *                       qr_data:
 *                         type: string
 *                         description: Primeros 100 caracteres del QR escaneado
 *                       validation_result:
 *                         type: string
 *                         enum: [valid, invalid, expired, already_used, falsified]
 *                         description: Resultado de la validación
 *                       scanned_by:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *                         description: ID del hospitalero/CSP que escaneó
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         description: Fecha/hora del escaneo
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       description: Página actual
 *                     limit:
 *                       type: integer
 *                       description: Items por página
 *                     total:
 *                       type: integer
 *                       description: Total de logs encontrados
 *                     totalPages:
 *                       type: integer
 *                       description: Total de páginas disponibles
 *       400:
 *         description: Parámetros de query inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "user_id debe ser un UUID válido"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al consultar logs"
 */

import { QRLogsController } from '@/api/controllers/qr-logs.controller';
import { AccessLogRepository } from '@/api/repositories/access_log.repository';

// Instanciar repositorio con DI pattern
const accessLogRepo = new AccessLogRepository();

// Instanciar controller con repositorio inyectado
const controller = new QRLogsController(accessLogRepo);

export default controller.getLogs;
