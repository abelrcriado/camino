// Controller para sincronización de transacciones offline

import { NextApiRequest, NextApiResponse } from 'next';
import { asyncHandler } from '@/api/middlewares/error-handler';
import { AppError } from '@/api/errors/custom-errors';
import { ErrorMessages } from '@/shared/constants/error-messages';
import { TransactionRepository } from '../repositories/transaction.repository';
import { UserRepository } from '../repositories/user.repository';
import logger from '@/config/logger';
import { syncTransactionSchema } from '@/api/schemas/qr.schema';
import type { SyncTransactionDto, Transaction } from '@/api/dto/qr.dto';

/**
 * Controller para sincronización de compras offline con el servidor
 */
export class QRSyncController {
  private transactionRepo: TransactionRepository;
  private userRepo: UserRepository;

  constructor(
    transactionRepo?: TransactionRepository,
    userRepo?: UserRepository
  ) {
    this.transactionRepo = transactionRepo || new TransactionRepository();
    this.userRepo = userRepo || new UserRepository();
  }
  /**
   * POST /api/transactions/sync
   * Sincroniza una transacción creada offline con el servidor
   */
  syncTransaction = asyncHandler(
    async (req: NextApiRequest, res: NextApiResponse<{ data: Transaction } | { error: string }>) => {
      // 1. Validar inputs
      const validatedData = syncTransactionSchema.parse(req.body) as SyncTransactionDto;
      const { transaction_id, user_id, items, total, created_at } = validatedData;

      logger.info('Sincronizando transacción offline', { transaction_id, user_id });

      // 2. Verificar que el usuario existe
      const { data: user, error: userError } = await this.userRepo.findById(user_id);

      if (userError || !user) {
        logger.warn('Usuario no encontrado para sync', { user_id });
        throw new AppError(ErrorMessages.USUARIO_NOT_FOUND, 404);
      }

      // 3. Verificar si la transacción ya existe
      const { data: existingTransaction } = await this.transactionRepo.findById(transaction_id);

      if (existingTransaction) {
        // Transacción ya existe - actualizar si está en pending_sync
        if (existingTransaction.status === 'pending_sync') {
          logger.info('Actualizando transacción pending_sync', { transaction_id });

          const { data: updated, error: updateError } = await this.transactionRepo.upsert({
            id: transaction_id,
            items,
            total,
            synced_at: new Date().toISOString(),
            status: existingTransaction.qr_used ? 'completed' : 'pending_sync',
          });

          if (updateError) {
            logger.error('Error al actualizar transacción', { error: updateError });
            throw new AppError('Error al sincronizar transacción', 500);
          }

          logger.info('Transacción actualizada exitosamente', { transaction_id });
          return res.status(200).json({ data: updated as Transaction });
        } else {
          // Transacción ya sincronizada previamente
          logger.info('Transacción ya sincronizada', {
            transaction_id,
            status: existingTransaction.status,
          });
          return res.status(200).json({ data: existingTransaction as Transaction });
        }
      }

      // Crear nueva transacción
      logger.info('Creando nueva transacción desde sync', { transaction_id });

      const { data: newTransactionArray, error: createError } = await this.transactionRepo.create({
        id: transaction_id,
        user_id,
        items,
        total,
        status: 'pending_sync',
        created_at,
        synced_at: new Date().toISOString(),
        qr_used: false,
        qr_invalidated: false,
      });

      if (createError) {
        // Check si es error de duplicado (race condition)
        if (createError.code === '23505') {
          logger.warn('Race condition detectada en sync, reintentando lectura', {
            transaction_id,
          });

          const { data: raceTransaction } = await this.transactionRepo.findById(transaction_id);

          if (raceTransaction) {
            return res.status(200).json({ data: raceTransaction as Transaction });
          }
        }

        logger.error('Error al crear transacción', { error: createError });
        throw new AppError('Error al sincronizar transacción', 500);
      }

      logger.info('Transacción sincronizada exitosamente', {
        transaction_id,
        total,
        items_count: items.length,
      });

      return res.status(201).json({ data: newTransactionArray });
    }
  );
}
