// DTOs para el sistema de QR offline-first

/**
 * Item de una transacción (producto o servicio)
 */
export interface TransactionItem {
  type: 'product' | 'service';
  id: string;
  name: string;
  quantity: number;
  price: number;
}

/**
 * Transacción de compra
 */
export interface Transaction {
  id: string;
  user_id: string;
  items: TransactionItem[];
  total: number;
  status: 'completed' | 'pending_sync' | 'cancelled';
  
  // QR tracking
  qr_used: boolean;
  qr_used_at?: string;
  qr_used_location?: string;
  qr_used_by?: string;
  
  qr_invalidated: boolean;
  qr_invalidated_at?: string;
  qr_invalidated_reason?: string;
  
  // Tracking
  parent_transaction_id?: string;
  created_at: string;
  updated_at: string;
  synced_at?: string;
}

/**
 * DTO para crear una transacción
 */
export interface CreateTransactionDto {
  id: string;                    // UUID generado offline
  user_id: string;
  items: TransactionItem[];
  total: number;
  created_at?: string;           // Timestamp de creación (puede ser pasado)
  parent_transaction_id?: string;
}

/**
 * Payload del QR code (lo que se codifica en el QR)
 */
export interface QRPayload {
  transaction_id: string;
  user_id: string;
  items: TransactionItem[];
  timestamp: number;             // Unix timestamp
  signature: string;             // HMAC-SHA256
  version: string;               // Versión del QR (para retrocompatibilidad)
}

/**
 * DTO para verificar un QR
 */
export interface VerifyQRDto {
  qr_data: string;               // Payload Base64 del QR
  location_id: string;           // ID del CSP/CSS/CSH donde se escanea
  scanned_by?: string;           // ID del empleado que escanea (opcional)
}

/**
 * Log de acceso (escaneo de QR)
 */
export interface AccessLog {
  id: string;
  transaction_id: string;
  user_id: string;
  location_id: string;
  qr_data?: string;
  validation_result: 'valid' | 'invalid' | 'expired' | 'already_used' | 'falsified';
  scanned_by?: string;
  timestamp: string;
}

/**
 * Filtros para consultar logs de acceso
 */
export interface AccessLogFilters {
  user_id?: string;
  location_id?: string;
  transaction_id?: string;
  validation_result?: string;
  from?: string;                 // Fecha inicio (ISO 8601)
  to?: string;                   // Fecha fin (ISO 8601)
  page?: number;
  limit?: number;
}

/**
 * Devolución de productos/servicios
 */
export interface Return {
  id: string;
  original_transaction_id: string;
  new_transaction_id?: string;
  returned_items: Array<{
    item_id: string;
    quantity: number;
  }>;
  reason?: string;
  refund_amount?: number;
  timestamp: string;
}

/**
 * DTO para crear una devolución
 */
export interface CreateReturnDto {
  original_transaction_id: string;
  new_transaction_id?: string;
  returned_items: Array<{
    item_id: string;
    quantity: number;
  }>;
  reason?: string;
  refund_amount?: number;
}

/**
 * DTO para sincronizar transacción desde offline
 */
export interface SyncTransactionDto {
  transaction_id: string;
  user_id: string;
  items: TransactionItem[];
  total: number;
  created_at: string;
  parent_transaction_id?: string;
}

/**
 * Response de verificación de QR
 */
export interface VerifyQRResponse {
  valid: boolean;
  transaction: {
    id: string;
    items: TransactionItem[];
    total: number;
    user_id: string;
  };
  message: string;
}
