import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: `Método ${req.method} no permitido`,
    });
  }

  try {
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
  } catch (error: any) {
    console.error("Error fetching network configuration:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Error al obtener configuración de red",
    });
  }
}
