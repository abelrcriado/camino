// Test de conexión a Supabase
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { config } from "@/config/app.config";
import logger from "@/config/logger";

const supabaseUrl = config.supabase.url;
const supabaseKey = config.supabase.anonKey;
const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  const { data, error } = await supabase.from("profiles").select("*").limit(1);
  if (error) {
    logger.error("Error de conexión a Supabase:", { error: error.message });
  } else {
    logger.info("Conexión exitosa. Primer perfil:", { data });
  }
})();
