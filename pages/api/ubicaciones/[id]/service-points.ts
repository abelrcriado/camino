// Endpoint para listar service points de una ubicación específica
import type { NextApiRequest, NextApiResponse } from "next";
import { ServicePointService } from "../../../../src/services/service-point.service";
import { ServicePointRepository } from "../../../../src/repositories/service-point.repository";
import { asyncHandler } from "@/middlewares/error-handler";

/**
 * @swagger
 * /api/ubicaciones/{id}/service-points:
 *   get:
 *     summary: Obtener service points de una ubicación
 *     description: Retorna todos los service points (CSP, CSS, CSH) asociados a una ubicación específica
 *     tags: [Ubicaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único de la ubicación
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [CSP, CSS, CSH]
 *         description: Filtrar por tipo de service point
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, maintenance]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de service points obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [CSP, CSS, CSH]
 *                       location_id:
 *                         type: string
 *                         format: uuid
 *                       status:
 *                         type: string
 *                       latitude:
 *                         type: number
 *                         format: float
 *                       longitude:
 *                         type: number
 *                         format: float
 *                       has_workshop:
 *                         type: boolean
 *                       has_vending_machine:
 *                         type: boolean
 *                 total:
 *                   type: integer
 *                 location:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     city:
 *                       type: string
 *                     province:
 *                       type: string
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Ubicación no encontrada
 *       500:
 *         description: Error interno del servidor
 */
export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { id, type, status } = req.query;

  // Validar ID de ubicación
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "ID de ubicación es requerido" });
  }

  // Validar formato UUID
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({ error: "ID de ubicación inválido" });
  }

  // Obtener service points
  const repository = new ServicePointRepository();
  const service = new ServicePointService(repository);

  // Obtener service points de la ubicación
  let servicePoints = await service.getByLocation(id);

  // Aplicar filtros adicionales si existen
  if (type && typeof type === "string") {
    servicePoints = servicePoints.filter((sp) => sp.type === type);
  }
  if (status && typeof status === "string") {
    servicePoints = servicePoints.filter((sp) => sp.status === status);
  }

  return res.status(200).json({
    data: servicePoints,
    total: servicePoints.length,
    location: {
      id,
    },
  });
});
