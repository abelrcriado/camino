import { createClient } from "@supabase/supabase-js";
import { asyncHandler } from "@/api/middlewares/error-handler";

/**
 * @swagger
 * /api/network/configuration:
 *   get:
 *     summary: Obtener configuración de red
 *     description: Recupera la configuración completa de la red de puntos de servicio, ordenada por provincia y ciudad
 *     tags: [Network]
 *     responses:
 *       200:
 *         description: Configuración de red obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       province:
 *                         type: string
 *                         description: Nombre de la provincia
 *                       city:
 *                         type: string
 *                         description: Nombre de la ciudad
 *                       total_service_points:
 *                         type: integer
 *                         description: Total de puntos de servicio
 *                       active_machines:
 *                         type: integer
 *                         description: Máquinas activas en operación
 *       405:
 *         description: Método no permitido (solo GET)
 *       500:
 *         description: Error interno del servidor
 */

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
