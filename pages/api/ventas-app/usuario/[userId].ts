// Endpoint para obtener ventas de un usuario específico
import type { NextApiRequest, NextApiResponse } from "next";
import { VentaAppService } from "@/services/venta_app.service";
import { VentaAppRepository } from "@/repositories/venta_app.repository";
import type { VentaAppFilters } from "@/dto/venta_app.dto";
import { asyncHandler } from "@/middlewares/error-handler";

/**
 * @swagger
 * /api/ventas-app/usuario/{userId}:
 *   get:
 *     summary: Obtener ventas de un usuario
 *     description: Lista todas las ventas realizadas por un usuario específico
 *     tags: [Ventas App]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del usuario
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [reservada, pagada, retirada, cancelada, expirada]
 *         description: Filtrar por estado de la venta
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Registros por página
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [created_at, fecha_pago, fecha_retiro, precio_total]
 *           default: created_at
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden de clasificación
 *     responses:
 *       200:
 *         description: Lista de ventas del usuario
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
 *                       user_id:
 *                         type: string
 *                       slot_id:
 *                         type: string
 *                       cantidad:
 *                         type: integer
 *                       precio_total:
 *                         type: number
 *                       estado:
 *                         type: string
 *                       codigo_retiro:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *       400:
 *         description: ID de usuario inválido
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { userId } = req.query;
  const { estado, page, limit } = req.query;

  // Validar userId
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "ID de usuario es requerido" });
  }

  // Validar formato UUID
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    return res.status(400).json({ error: "ID de usuario inválido" });
  }

  // Preparar filtros
  const filters: VentaAppFilters = {
    user_id: userId,
  };

  if (estado && typeof estado === "string") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filters.estado = estado as any;
  }

  // Preparar paginación
  const pageNum = page ? parseInt(page as string, 10) : 1;
  const limitNum = limit ? parseInt(limit as string, 10) : 10;

  if (pageNum < 1) {
    return res
      .status(400)
      .json({ error: "El número de página debe ser mayor a 0" });
  }

  if (limitNum < 1 || limitNum > 100) {
    return res
      .status(400)
      .json({ error: "El límite debe estar entre 1 y 100" });
  }

  const repository = new VentaAppRepository();
  const service = new VentaAppService(repository);

  // Obtener ventas
  const result = await service.getVentas(filters);

  // Calcular paginación manual
  const total = result.count;
  const totalPages = Math.ceil(total / limitNum);

  return res.status(200).json({
    data: result.data,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    },
    user: {
      id: userId,
    },
  });
});
