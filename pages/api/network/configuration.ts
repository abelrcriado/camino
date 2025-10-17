import { createClient } from "@supabase/supabase-js";
import { asyncHandler } from "@/api/middlewares/error-handler";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default asyncHandler(async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: `Método ${req.method} no permitido`,
    });
  }

  const { data, error } = await supabase
    .from("v_network_configuration")
    .select("*")
    .order("province", { ascending: true })
    .order("city", { ascending: true });

  if (error) throw error;

  return res.status(200).json({
    success: true,
    data: data || [],
  });
});
