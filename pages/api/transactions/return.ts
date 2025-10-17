/**
 * @swagger
 * /api/transactions/return:
 *   post:
 *     summary: Procesar devolución de productos/servicios
 *     description: |
 *       Procesa una devolución parcial o total de una compra.
 *       
 *       **Flujo de devolución:**
 *       1. Verifica que la transacción original exista y esté usada
 *       2. Valida que los items devueltos pertenezcan a la compra
 *       3. Invalida el QR de la transacción original
 *       4. Calcula items restantes después de devolución
 *       5. Si hay items restantes, crea nueva transacción con nuevo QR
 *       6. Registra la devolución para auditoría
 *       
 *       **Casos de uso:**
 *       - Devolución parcial: Usuario devuelve algunos productos
 *       - Devolución total: Usuario devuelve todo (no se crea nueva transacción)
 *       - Reducción de cantidad: Usuario devuelve 2 de 3 unidades de un producto
 *       
 *       **QR handling:**
 *       - QR original → INVALIDADO (no se puede volver a usar)
 *       - Nuevo QR → GENERADO por app móvil con items restantes
 *     tags:
 *       - Transactions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - original_transaction_id
 *               - returned_items
 *             properties:
 *               original_transaction_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la transacción original que se devuelve
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               returned_items:
 *                 type: array
 *                 description: Lista de items devueltos con cantidades
 *                 items:
 *                   type: object
 *                   required:
 *                     - item_id
 *                     - quantity
 *                   properties:
 *                     item_id:
 *                       type: string
 *                       format: uuid
 *                       description: ID del producto/servicio devuelto
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       description: Cantidad devuelta (no puede exceder cantidad original)
 *               refund_amount:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: (Opcional) Monto del reembolso - Se calcula automáticamente si no se especifica
 *                 example: 7.50
 *               reason:
 *                 type: string
 *                 description: (Opcional) Razón de la devolución
 *                 example: "Producto defectuoso"
 *     responses:
 *       201:
 *         description: Devolución procesada exitosamente
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
 *                       description: ID del registro de devolución
 *                     original_transaction_id:
 *                       type: string
 *                       format: uuid
 *                       description: ID de la transacción original (ahora invalidada)
 *                     new_transaction_id:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *                       description: ID de la nueva transacción (null si devolución total)
 *                     returned_items:
 *                       type: array
 *                       description: Items devueltos
 *                       items:
 *                         type: object
 *                         properties:
 *                           item_id:
 *                             type: string
 *                             format: uuid
 *                           quantity:
 *                             type: integer
 *                     refund_amount:
 *                       type: number
 *                       format: float
 *                       description: Monto reembolsado
 *                     reason:
 *                       type: string
 *                       nullable: true
 *                       description: Razón de la devolución
 *                     processed_at:
 *                       type: string
 *                       format: date-time
 *                       description: Timestamp de procesamiento
 *       400:
 *         description: Datos inválidos o reglas de negocio violadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   examples:
 *                     not_used:
 *                       value: "No se puede devolver una transacción que no ha sido usada"
 *                     invalid_item:
 *                       value: "Item abc-123 no existe en la transacción original"
 *                     invalid_quantity:
 *                       value: "Cantidad devuelta (5) excede cantidad original (3)"
 *       404:
 *         description: Transacción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Transacción no encontrada"
 *       409:
 *         description: Transacción ya invalidada previamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Esta transacción ya fue invalidada previamente"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   examples:
 *                     general:
 *                       value: "Error al procesar devolución"
 *                     create:
 *                       value: "Error al crear nueva transacción"
 */

import { QRReturnController } from '@/api/controllers/qr-return.controller';
import { TransactionRepository } from '@/api/repositories/transaction.repository';
import { ReturnRepository } from '@/api/repositories/return.repository';

// Instanciar repositorios con DI pattern
const transactionRepo = new TransactionRepository();
const returnRepo = new ReturnRepository();

// Instanciar controller con repositorios inyectados
const controller = new QRReturnController(transactionRepo, returnRepo);

export default controller.processReturn;
