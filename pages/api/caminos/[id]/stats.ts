// Endpoint para obtener estadísticas de un camino específico
import type { NextApiRequest, NextApiResponse } from "next";
import { CaminoService } from "@/api/services/camino.service";
import { CaminoRepository } from "@/api/repositories/camino.repository";
import { asyncHandler } from "@/api/middlewares/error-handler";
import { ErrorMessages } from "@/shared/constants/error-messages";
import { validateUUID } from "@/api/middlewares/validate-uuid";

/**
 * @swagger
 * /api/caminos/{id}/stats:
 *   get:
 *     summary: Obtener estadísticas de un camino
 *     description: Retorna estadísticas completas de un camino específico (número de ubicaciones, service points, talleres, etc.)
 *     tags: [Caminos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del camino
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 camino_id:
 *                   type: string
 *                   format: uuid
 *                 camino_nombre:
 *                   type: string
 *                   example: Camino de Santiago Francés
 *                 total_ubicaciones:
 *                   type: integer
 *                   example: 25
 *                 total_service_points:
 *                   type: integer
 *                   example: 42
 *                 service_points_por_tipo:
 *                   type: object
 *                   properties:
 *                     CSP:
 *                       type: integer
 *                       example: 15
 *                     CSS:
 *                       type: integer
 *                       example: 20
 *                     CSH:
 *                       type: integer
 *                       example: 7
 *                 total_talleres:
 *                   type: integer
 *                   example: 12
 *                 total_vending_machines:
 *                   type: integer
 *                   example: 18
 *                 cobertura_km:
 *                   type: number
 *                   format: float
 *                   example: 780.5
 *                   description: Kilómetros totales cubiertos
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: ID de camino inválido
 *       404:
 *         description: Camino no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Camino no encontrado
 *       500:
 *         description: Error interno del servidor
 */
export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
  }

  const { id } = req.query;

  // Validar UUID usando utilidad centralizada
  const validationError = validateUUID(id, "camino");
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  // Obtener estadísticas
  const repository = new CaminoRepository();
  const service = new CaminoService(repository);
  const stats = await service.getStats(id as string);

  return res.status(200).json(stats);
});
