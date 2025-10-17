// Repository para gestión de transacciones QR
import { BaseRepository } from "./base.repository";
import { supabase } from "@/api/services/supabase";
import type { Transaction, CreateTransactionDto } from "@/api/dto/qr.dto";
import type { SupabaseClient } from "@supabase/supabase-js";

export class TransactionRepository extends BaseRepository<Transaction> {
  constructor(db?: SupabaseClient) {
    super(db || supabase, "transactions");
  }

  /**
   * Busca transacción por ID
   */
  async findById(id: string) {
    return this.db.from(this.tableName).select("*").eq("id", id).single();
  }

  /**
   * Busca transacciones por user_id
   */
  async findByUserId(userId: string) {
    return this.db
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
  }

  /**
   * Marca QR como usado (validación exitosa)
   */
  async markQRAsUsed(
    transactionId: string,
    locationId: string,
    scannedBy?: string
  ) {
    return this.db
      .from(this.tableName)
      .update({
        qr_used: true,
        qr_used_at: new Date().toISOString(),
        qr_used_location: locationId,
        qr_used_by: scannedBy || null,
        status: "completed",
        synced_at: new Date().toISOString(),
      })
      .eq("id", transactionId);
  }

  /**
   * Invalida QR por devolución
   */
  async invalidateQR(transactionId: string, reason: string) {
    return this.db
      .from(this.tableName)
      .update({
        qr_invalidated: true,
        qr_invalidated_reason: reason,
        qr_invalidated_at: new Date().toISOString(),
      })
      .eq("id", transactionId);
  }

  /**
   * Crea o actualiza transacción (idempotencia para sync)
   * Usa upsert para manejar race conditions
   */
  async upsert(transaction: Partial<Transaction>) {
    return this.db
      .from(this.tableName)
      .upsert(transaction, { onConflict: "id" })
      .select()
      .single();
  }

  /**
   * Crea transacción desde payload QR
   */
  async createFromQRPayload(data: CreateTransactionDto) {
    const transaction = {
      id: data.id,
      user_id: data.user_id,
      items: data.items,
      total: data.total,
      status: "pending_sync",
      qr_used: false,
      qr_invalidated: false,
      created_at: data.created_at || new Date().toISOString(),
      parent_transaction_id: data.parent_transaction_id || null,
    };

    return this.db.from(this.tableName).insert(transaction).select().single();
  }

  /**
   * Actualiza estado de transacción
   */
  async updateStatus(
    transactionId: string,
    status: "completed" | "pending_sync" | "cancelled"
  ) {
    return this.db
      .from(this.tableName)
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", transactionId);
  }
}
