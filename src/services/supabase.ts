// Supabase client setup
import { createClient } from "@supabase/supabase-js";
import { config } from "@/config/app.config";

const supabaseUrl = config.supabase.url;
const supabaseKey = config.supabase.serviceRoleKey;

export const supabase = createClient(supabaseUrl, supabaseKey);
