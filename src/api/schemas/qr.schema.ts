// Schemas de validación Zod para el sistema de QR

import { z } from 'zod';

/**
 * Schema para un item de transacción
 */
export const transactionItemSchema = z.object({
  type: z.enum(['product', 'service'], {
    message: 'Tipo debe ser "product" o "service"',
  }),
  id: z.string().uuid('ID del item debe ser un UUID válido'),
  name: z.string().min(1, 'Nombre del item es requerido').max(200),
  quantity: z.number().int().min(1, 'Cantidad debe ser al menos 1'),
  price: z.number().min(0, 'Precio no puede ser negativo'),
});

/**
 * Schema para verificar un QR
 */
export const verifyQRSchema = z.object({
  qr_data: z.string().min(1, 'qr_data es requerido'),
  location_id: z.string().uuid('location_id debe ser un UUID válido'),
  scanned_by: z.string().uuid('scanned_by debe ser un UUID válido').optional(),
});

/**
 * Schema para el payload interno del QR
 */
export const qrPayloadSchema = z.object({
  transaction_id: z.string().uuid('transaction_id debe ser un UUID válido'),
  user_id: z.string().uuid('user_id debe ser un UUID válido'),
  items: z.array(transactionItemSchema).min(1, 'Debe haber al menos un item'),
  timestamp: z.number().int().positive('timestamp debe ser positivo'),
  signature: z.string().min(1, 'signature es requerida'),
  version: z.string().min(1, 'version es requerida'),
});

/**
 * Schema para crear una transacción
 */
export const createTransactionSchema = z.object({
  id: z.string().uuid('ID de transacción debe ser un UUID válido'),
  user_id: z.string().uuid('user_id debe ser un UUID válido'),
  items: z.array(transactionItemSchema).min(1, 'Debe haber al menos un item'),
  total: z.number().min(0, 'Total no puede ser negativo'),
  created_at: z.string().datetime('created_at debe ser ISO 8601').optional(),
  parent_transaction_id: z.string().uuid('parent_transaction_id debe ser un UUID válido').optional(),
});

/**
 * Schema para sincronizar transacción
 */
export const syncTransactionSchema = z.object({
  transaction_id: z.string().uuid('transaction_id debe ser un UUID válido'),
  user_id: z.string().uuid('user_id debe ser un UUID válido'),
  items: z.array(transactionItemSchema).min(1, 'Debe haber al menos un item'),
  total: z.number().min(0, 'Total no puede ser negativo'),
  created_at: z.string().datetime('created_at debe ser ISO 8601'),
  parent_transaction_id: z.string().uuid('parent_transaction_id debe ser un UUID válido').optional(),
});

/**
 * Schema para item devuelto
 */
export const returnedItemSchema = z.object({
  item_id: z.string().uuid('item_id debe ser un UUID válido'),
  quantity: z.number().int().min(1, 'Cantidad debe ser al menos 1'),
});

/**
 * Schema para crear una devolución
 */
export const createReturnSchema = z.object({
  original_transaction_id: z.string().uuid('original_transaction_id debe ser un UUID válido'),
  new_transaction_id: z.string().uuid('new_transaction_id debe ser un UUID válido').optional(),
  returned_items: z.array(returnedItemSchema).min(1, 'Debe haber al menos un item devuelto'),
  reason: z.string().max(500, 'Razón no puede exceder 500 caracteres').optional(),
  refund_amount: z.number().min(0, 'Monto de reembolso no puede ser negativo').optional(),
});

/**
 * Schema para consultar logs de acceso
 */
export const queryAccessLogsSchema = z.object({
  user_id: z.string().uuid('user_id debe ser un UUID válido').optional(),
  location_id: z.string().uuid('location_id debe ser un UUID válido').optional(),
  transaction_id: z.string().uuid('transaction_id debe ser un UUID válido').optional(),
  validation_result: z.enum(['valid', 'invalid', 'expired', 'already_used', 'falsified']).optional(),
  from: z.string().datetime('from debe ser ISO 8601').optional(),
  to: z.string().datetime('to debe ser ISO 8601').optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Type inference exports
 */
export type VerifyQRInput = z.infer<typeof verifyQRSchema>;
export type QRPayloadInput = z.infer<typeof qrPayloadSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type SyncTransactionInput = z.infer<typeof syncTransactionSchema>;
export type CreateReturnInput = z.infer<typeof createReturnSchema>;
export type QueryAccessLogsInput = z.infer<typeof queryAccessLogsSchema>;
