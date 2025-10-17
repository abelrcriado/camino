// Repository para User
import { BaseRepository } from "./base.repository";
import { supabase } from "../services/supabase";
import type { User } from "@/shared/dto/user.dto";
import { SupabaseClient } from "@supabase/supabase-js";

export class UserRepository extends BaseRepository<User> {
  constructor(db?: SupabaseClient) {
    super(db || supabase, "profiles");
  }

  /**
   * Buscar usuario por email
   */
  async findByEmail(email: string) {
    return this.db.from(this.tableName).select("*").eq("email", email).single();
  }

  /**
   * Buscar usuarios por rol
   */
  async findByRole(role: string) {
    return this.db.from(this.tableName).select("*").eq("role", role);
  }
}
