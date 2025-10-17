import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './base.repository';
import { supabase } from '@/api/services/supabase';
import type { Return } from '@/api/dto/qr.dto';

/**
 * Repository para operaciones de devoluciones (returns)
 */
export class ReturnRepository extends BaseRepository<Return> {
  constructor(db?: SupabaseClient) {
    super(db || supabase, 'returns');
  }

  /**
   * Buscar devolución por ID
   */
  async findById(id: string) {
    return this.db
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
  }

  /**
   * Buscar devoluciones por transacción original
   * Útil para verificar si una transacción ya tiene devoluciones
   */
  async findByOriginalTransaction(originalTransactionId: string) {
    return this.db
      .from(this.tableName)
      .select('*')
      .eq('original_transaction_id', originalTransactionId)
      .order('timestamp', { ascending: false });
  }

  /**
   * Buscar devoluciones por nueva transacción generada
   */
  async findByNewTransaction(newTransactionId: string) {
    return this.db
      .from(this.tableName)
      .select('*')
      .eq('new_transaction_id', newTransactionId)
      .single();
  }

  /**
   * Crear registro de devolución
   */
  async createReturn(returnData: {
    original_transaction_id: string;
    new_transaction_id?: string | null;
    returned_items: Array<{ item_id: string; quantity: number }>;
    refund_amount?: number;
    reason?: string | null;
  }) {
    return this.db
      .from(this.tableName)
      .insert({
        original_transaction_id: returnData.original_transaction_id,
        new_transaction_id: returnData.new_transaction_id,
        returned_items: returnData.returned_items,
        refund_amount: returnData.refund_amount,
        reason: returnData.reason,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();
  }
}
