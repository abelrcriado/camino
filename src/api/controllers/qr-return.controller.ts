// Controller para procesamiento de devoluciones (returns)

import { NextApiRequest, NextApiResponse } from 'next';
import { asyncHandler } from '@/api/middlewares/error-handler';
import { AppError } from '@/api/errors/custom-errors';
import { supabase } from '@/api/services/supabase';
import { logger } from '@/config/logger';
import { createReturnSchema } from '@/api/schemas/qr.schema';
import type { CreateReturnDto, Return } from '@/api/dto/qr.dto';

/**
 * Controller para procesamiento de devoluciones de productos/servicios
 */
export class QRReturnController {
  /**
   * POST /api/transactions/return
   * Procesa una devolución de producto/servicio
   * Invalida QR original y genera nueva transacción con monto ajustado
   */
  processReturn = asyncHandler(
    async (req: NextApiRequest, res: NextApiResponse<{ data: Return } | { error: string }>) => {
      // 1. Validar inputs
      const validatedData = createReturnSchema.parse(req.body) as CreateReturnDto;
      const { original_transaction_id, returned_items, refund_amount, reason } = validatedData;

      logger.info('Procesando devolución', {
        original_transaction_id,
        refund_amount,
        items_count: returned_items.length,
      });

      // 2. Buscar transacción original
      const { data: originalTransaction, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', original_transaction_id)
        .single();

      if (txError || !originalTransaction) {
        logger.warn('Transacción no encontrada para devolución', { original_transaction_id });
        throw new AppError('Transacción no encontrada', 404);
      }

      // 3. Verificar que la transacción esté completada (QR usado)
      if (!originalTransaction.qr_used) {
        logger.warn('Intento de devolución de transacción no usada', {
          original_transaction_id,
        });
        throw new AppError('No se puede devolver una transacción que no ha sido usada', 400);
      }

      // 4. Verificar que no esté ya invalidada
      if (originalTransaction.qr_invalidated) {
        logger.warn('Intento de devolución de transacción ya invalidada', {
          original_transaction_id,
        });
        throw new AppError('Esta transacción ya fue invalidada previamente', 409);
      }

      // 5. Validar que los items devueltos existan en la transacción original
      const originalItems = originalTransaction.items as Array<{
        type: string;
        id: string;
        name: string;
        quantity: number;
        price: number;
      }>;

      for (const returnedItem of returned_items) {
        const originalItem = originalItems.find((item) => item.id === returnedItem.item_id);

        if (!originalItem) {
          throw new AppError(
            `Item ${returnedItem.item_id} no existe en la transacción original`,
            400
          );
        }

        if (returnedItem.quantity > originalItem.quantity) {
          throw new AppError(
            `Cantidad devuelta (${returnedItem.quantity}) excede cantidad original (${originalItem.quantity})`,
            400
          );
        }
      }

      // 6. Calcular items restantes después de la devolución
      const remainingItems = originalItems.map((item) => {
        const returnedItem = returned_items.find((ri) => ri.item_id === item.id);
        
        if (!returnedItem) {
          return item; // No devuelto, mantener completo
        }

        const remainingQuantity = item.quantity - returnedItem.quantity;
        
        if (remainingQuantity === 0) {
          return null; // Item completamente devuelto
        }

        return {
          ...item,
          quantity: remainingQuantity,
        };
      }).filter((item) => item !== null);

      const newTotal = parseFloat(originalTransaction.total.toString()) - (refund_amount ?? 0);

      // 7. Invalidar transacción original
      const { error: invalidateError } = await supabase
        .from('transactions')
        .update({
          qr_invalidated: true,
          qr_invalidated_at: new Date().toISOString(),
          qr_invalidated_reason: reason || 'devolución',
        })
        .eq('id', original_transaction_id);

      if (invalidateError) {
        logger.error('Error al invalidar transacción original', { error: invalidateError });
        throw new AppError('Error al procesar devolución', 500);
      }

      // 8. Crear nueva transacción con items restantes (si hay)
      let newTransactionId: string | null = null;

      if (remainingItems.length > 0 && newTotal > 0) {
        const { data: newTransaction, error: createError } = await supabase
          .from('transactions')
          .insert({
            user_id: originalTransaction.user_id,
            items: remainingItems,
            total: newTotal,
            status: 'pending', // Nuevo QR sin usar aún
            parent_transaction_id: original_transaction_id,
            created_at: new Date().toISOString(),
            qr_used: false,
            qr_invalidated: false,
          })
          .select('id')
          .single();

        if (createError) {
          logger.error('Error al crear nueva transacción', { error: createError });
          throw new AppError('Error al crear nueva transacción', 500);
        }

        newTransactionId = newTransaction.id;

        logger.info('Nueva transacción creada tras devolución', {
          new_transaction_id: newTransactionId,
          new_total: newTotal,
        });
      } else {
        logger.info('Devolución completa - sin nueva transacción', {
          original_transaction_id,
        });
      }

      // 9. Registrar devolución en tabla returns
      const { data: returnRecord, error: returnError } = await supabase
        .from('returns')
        .insert({
          original_transaction_id,
          new_transaction_id: newTransactionId,
          returned_items,
          refund_amount,
          reason: reason || null,
          processed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (returnError) {
        logger.error('Error al registrar devolución', { error: returnError });
        throw new AppError('Error al registrar devolución', 500);
      }

      logger.info('Devolución procesada exitosamente', {
        return_id: returnRecord.id,
        original_transaction_id,
        new_transaction_id: newTransactionId,
        refund_amount,
      });

      return res.status(201).json({ data: returnRecord as Return });
    }
  );
}
