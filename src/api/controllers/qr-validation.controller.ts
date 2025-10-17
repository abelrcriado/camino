// Controller para verificación de QR codes

import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { asyncHandler } from '@/api/middlewares/error-handler';
import { AppError } from '@/api/errors/custom-errors';
import { ErrorMessages } from '@/shared/constants/error-messages';
import { TransactionRepository } from '../repositories/transaction.repository';
import { AccessLogRepository } from '../repositories/access_log.repository';
import { UserRepository } from '../repositories/user.repository';
import logger from '@/config/logger';
import { verifyQRSchema, qrPayloadSchema } from '@/api/schemas/qr.schema';
import type { QRPayload, VerifyQRDto, VerifyQRResponse } from '@/api/dto/qr.dto';

/**
 * Controller para validación de códigos QR en puntos de servicio
 */
export class QRValidationController {
  private transactionRepo: TransactionRepository;
  private accessLogRepo: AccessLogRepository;
  private userRepo: UserRepository;

  constructor(
    transactionRepo?: TransactionRepository,
    accessLogRepo?: AccessLogRepository,
    userRepo?: UserRepository
  ) {
    this.transactionRepo = transactionRepo || new TransactionRepository();
    this.accessLogRepo = accessLogRepo || new AccessLogRepository();
    this.userRepo = userRepo || new UserRepository();
  }
  /**
   * POST /api/access/verify-qr
   * Valida un código QR escaneado en un punto de servicio
   */
  verifyQR = asyncHandler(
    async (req: NextApiRequest, res: NextApiResponse<VerifyQRResponse | { error: string }>) => {
      // 1. Validar inputs
      const validatedData = verifyQRSchema.parse(req.body) as VerifyQRDto;
      const { qr_data, location_id, scanned_by } = validatedData;

      // 2. Decodificar payload del QR
      let payload: QRPayload;
      try {
        const jsonPayload = Buffer.from(qr_data, 'base64').toString('utf-8');
        payload = JSON.parse(jsonPayload);
        
        // Validar estructura del payload
        qrPayloadSchema.parse(payload);
      } catch (error) {
        logger.error('Error al decodificar QR', { error, qr_data: qr_data.substring(0, 50) });
        throw new AppError('QR inválido o corrupto', 400);
      }

      // 3. Verificar versión del QR (para retrocompatibilidad futura)
      if (payload.version !== '1.0') {
        throw new AppError(
          `Versión de QR no soportada: ${payload.version}`,
          400
        );
      }

      // 4. Obtener secret del usuario para verificar firma
      const { data: user, error: userError } = await this.userRepo.findById(payload.user_id);

      if (userError || !user) {
        logger.warn('Usuario no encontrado para QR', { user_id: payload.user_id });
        
        // Registrar intento fallido
        await this.logAccess(
          payload.transaction_id,
          payload.user_id,
          location_id,
          qr_data.substring(0, 100),
          'invalid',
          scanned_by
        );
        
        throw new AppError(ErrorMessages.USUARIO_NOT_FOUND, 404);
      }

      // Verificar que el usuario tenga qr_secret
      if (!user.qr_secret) {
        logger.warn('Usuario sin qr_secret', { user_id: payload.user_id });
        await this.logAccess(
          payload.transaction_id,
          payload.user_id,
          location_id,
          qr_data.substring(0, 100),
          'invalid',
          scanned_by
        );
        throw new AppError('Usuario no configurado para QR', 400);
      }

      // 5. Verificar firma HMAC (anti-falsificación)
      const isValidSignature = this.verifyHMACSignature(payload, user.qr_secret);
      
      if (!isValidSignature) {
        logger.warn('QR con firma inválida detectado', {
          user_id: payload.user_id,
          transaction_id: payload.transaction_id,
        });
        
        // Registrar intento de falsificación
        await this.logAccess(
          payload.transaction_id,
          payload.user_id,
          location_id,
          qr_data.substring(0, 100),
          'falsified',
          scanned_by
        );
        
        throw new AppError('QR falsificado o manipulado', 403);
      }

      // 6. Verificar expiración (24 horas por defecto)
      const QR_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 horas
      const now = Date.now();
      if (now - payload.timestamp > QR_EXPIRATION_MS) {
        logger.info('QR expirado detectado', {
          transaction_id: payload.transaction_id,
          timestamp: new Date(payload.timestamp).toISOString(),
        });
        
        // Registrar intento con QR expirado
        await this.logAccess(
          payload.transaction_id,
          payload.user_id,
          location_id,
          qr_data.substring(0, 100),
          'expired',
          scanned_by
        );
        
        throw new AppError('QR expirado', 410);
      }

      // 7. Buscar transacción en BD (puede no existir si aún no sincronizó)
      let { data: transaction } = await this.transactionRepo.findById(payload.transaction_id);

      // 8. Si no existe, crear transacción "pending_sync"
      if (!transaction) {
        logger.info('Transacción no encontrada, creando desde QR', {
          transaction_id: payload.transaction_id,
        });

        const { data: newTransaction, error: createError } = await this.transactionRepo.createFromQRPayload({
          id: payload.transaction_id,
          user_id: payload.user_id,
          items: payload.items,
          total: payload.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
          created_at: new Date(payload.timestamp).toISOString(),
        });

        if (createError) {
          logger.error('Error al crear transacción desde QR', { error: createError });
          throw new AppError('Error al procesar QR', 500);
        }

        transaction = newTransaction;
      }

      // 9. Verificar si QR ya fue usado
      if (transaction.qr_used) {
        logger.warn('QR ya utilizado', {
          transaction_id: payload.transaction_id,
          used_at: transaction.qr_used_at,
        });
        
        // Registrar intento con QR ya usado
        await this.logAccess(
          payload.transaction_id,
          payload.user_id,
          location_id,
          qr_data.substring(0, 100),
          'already_used',
          scanned_by
        );
        
        throw new AppError('QR ya utilizado anteriormente', 409);
      }

      // 10. Verificar si QR fue invalidado (por devolución)
      if (transaction.qr_invalidated) {
        logger.warn('QR invalidado', {
          transaction_id: payload.transaction_id,
          reason: transaction.qr_invalidated_reason,
        });
        
        // Registrar intento con QR invalidado
        await this.logAccess(
          payload.transaction_id,
          payload.user_id,
          location_id,
          qr_data.substring(0, 100),
          'invalid',
          scanned_by
        );
        
        throw new AppError(
          `QR invalidado: ${transaction.qr_invalidated_reason || 'devolución'}`,
          410
        );
      }

      // 11. Marcar QR como usado
      const { error: updateError } = await this.transactionRepo.markQRAsUsed(
        payload.transaction_id,
        location_id,
        scanned_by
      );

      if (updateError) {
        logger.error('Error al marcar QR como usado', { error: updateError });
        throw new AppError('Error al procesar QR', 500);
      }

      // 12. Registrar log de acceso exitoso (auditoría)
      await this.logAccess(
        payload.transaction_id,
        payload.user_id,
        location_id,
        qr_data.substring(0, 100),
        'valid',
        scanned_by
      );

      logger.info('QR validado exitosamente', {
        transaction_id: payload.transaction_id,
        user_id: payload.user_id,
        location_id,
      });

      // 13. Retornar resultado
      return res.status(200).json({
        valid: true,
        transaction: {
          id: transaction.id,
          items: transaction.items,
          total: parseFloat(transaction.total.toString()),
          user_id: transaction.user_id,
        },
        message: 'QR válido - Acceso autorizado',
      });
    }
  );

  /**
   * Verifica la firma HMAC del payload
   */
  private verifyHMACSignature(payload: QRPayload, userSecret: string): boolean {
    try {
      const dataToVerify = JSON.stringify({
        transaction_id: payload.transaction_id,
        user_id: payload.user_id,
        items: payload.items,
        timestamp: payload.timestamp,
      });

      const expectedSignature = crypto
        .createHmac('sha256', userSecret)
        .update(dataToVerify)
        .digest('hex');

      return payload.signature === expectedSignature;
    } catch (error) {
      logger.error('Error al verificar firma HMAC', { error });
      return false;
    }
  }

  /**
   * Registra un log de acceso (auditoría)
   */
  private async logAccess(
    transactionId: string,
    userId: string,
    locationId: string,
    qrData: string,
    result: 'valid' | 'invalid' | 'expired' | 'already_used' | 'falsified',
    scannedBy?: string
  ): Promise<void> {
    await this.accessLogRepo.logAccess({
      transaction_id: transactionId,
      user_id: userId,
      location_id: locationId,
      qr_data: qrData,
      validation_result: result,
      scanned_by: scannedBy,
    });
  }
}
