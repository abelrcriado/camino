/**
 * Supabase Client Helper
 * Re-exports the supabase client from services
 */

import { supabase } from "../services/supabase";

export const createClient = () => supabase;
