import { config } from "./app.config";

const appConfig = {
  supabaseUrl: config.supabase.url,
  supabaseKey: config.supabase.anonKey,
};

export default appConfig;
