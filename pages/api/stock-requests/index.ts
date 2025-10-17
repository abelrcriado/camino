/**
 * @swagger
 * /api/stock-requests:
 *   get:
 *     summary: Listar solicitudes de stock
 *     description: Obtiene lista paginada de solicitudes de reposición de inventario
 *     tags: [Stock Requests]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: service_point_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: warehouse_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, preparing, in_transit, delivered, cancelled]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Lista de solicitudes de stock
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno
 *   post:
 *     summary: Crear solicitud de stock
 *     description: Crea una nueva solicitud de reposición de inventario
 *     tags: [Stock Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - service_point_id
 *               - warehouse_id
 *               - items
 *             properties:
 *               service_point_id:
 *                 type: string
 *                 format: uuid
 *               warehouse_id:
 *                 type: string
 *                 format: uuid
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Solicitud creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { stockRequestController } from "@/api/controllers/stock-request.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";
import { ErrorMessages } from "@/shared/constants/error-messages";


export default asyncHandler(async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { method } = req;

  switch (method) {
    case "GET":
      return stockRequestController.list(req, res);

    case "POST":
      return stockRequestController.create(req, res);

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
  }
});
