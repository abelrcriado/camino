/**
 * @swagger
 * /api/transactions/sync:
 *   post:
 *     summary: Sincronizar transacción offline con el servidor
 *     description: |
 *       Sincroniza una compra realizada offline (sin conexión) con el servidor.
 *       
 *       **Flujo offline-first:**
 *       1. Usuario compra producto/servicio SIN internet
 *       2. App almacena transacción en IndexedDB local
 *       3. Genera QR firmado para uso inmediato
 *       4. Cuando hay conexión, envía transacción a este endpoint
 *       5. Backend crea/actualiza registro en BD
 *       
 *       **Casos manejados:**
 *       - Transacción nueva: Crea registro en BD
 *       - Transacción pending_sync: Actualiza con datos completos
 *       - Transacción ya sincronizada: Retorna existente (idempotente)
 *       - Race condition: Maneja duplicados con código 23505
 *     tags:
 *       - Transactions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transaction_id
 *               - user_id
 *               - items
 *               - total
 *               - created_at
 *             properties:
 *               transaction_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID único de la transacción (generado offline)
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               user_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del usuario que realizó la compra
 *                 example: "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
 *               items:
 *                 type: array
 *                 description: Lista de productos/servicios comprados
 *                 items:
 *                   type: object
 *                   required:
 *                     - type
 *                     - id
 *                     - name
 *                     - quantity
 *                     - price
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [product, service]
 *                       description: Tipo de item
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: ID del producto o servicio
 *                     name:
 *                       type: string
 *                       description: Nombre del item
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       description: Cantidad comprada
 *                     price:
 *                       type: number
 *                       format: float
 *                       minimum: 0
 *                       description: Precio unitario
 *               total:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Total de la compra (suma de items)
 *                 example: 15.50
 *               created_at:
 *                 type: string
 *                 format: date-time
 *                 description: Timestamp de cuando se creó offline (ISO 8601)
 *                 example: "2025-10-17T10:30:00.000Z"
 *     responses:
 *       200:
 *         description: Transacción ya existía (idempotente)
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
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                     total:
 *                       type: number
 *                       format: float
 *                     status:
 *                       type: string
 *                       enum: [pending, pending_sync, completed, refunded]
 *                     qr_used:
 *                       type: boolean
 *                     qr_invalidated:
 *                       type: boolean
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     synced_at:
 *                       type: string
 *                       format: date-time
 *       201:
 *         description: Transacción sincronizada exitosamente (nueva)
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
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                     total:
 *                       type: number
 *                       format: float
 *                     status:
 *                       type: string
 *                       example: "pending"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     synced_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Datos de transacción inválidos"
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
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al sincronizar transacción"
 */

import { QRSyncController } from '@/api/controllers/qr-sync.controller';
import { TransactionRepository } from '@/api/repositories/transaction.repository';
import { UserRepository } from '@/api/repositories/user.repository';

// Instanciar repositorios con DI pattern
const transactionRepo = new TransactionRepository();
const userRepo = new UserRepository();

// Instanciar controller con repositorios inyectados
const controller = new QRSyncController(transactionRepo, userRepo);

export default controller.syncTransaction;
