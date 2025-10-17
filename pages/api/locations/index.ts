/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: Listar ubicaciones
 *     description: Obtiene lista de ubicaciones (ciudades/pueblos) en los caminos
 *     tags: [Locations]
 *     parameters:
 *       - in: query
 *         name: camino_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por camino
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre
 *     responses:
 *       200:
 *         description: Lista de ubicaciones
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
 *                       camino_id:
 *                         type: string
 *                         format: uuid
 *                       nombre:
 *                         type: string
 *                       descripcion:
 *                         type: string
 *                       coordinates:
 *                         type: object
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno
 *   post:
 *     summary: Crear ubicación
 *     description: Registra una nueva ubicación en un camino
 *     tags: [Locations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - camino_id
 *               - nombre
 *             properties:
 *               camino_id:
 *                 type: string
 *                 format: uuid
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               coordinates:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *     responses:
 *       201:
 *         description: Ubicación creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno
 */
import { NextApiRequest, NextApiResponse } from "next";
import { LocationController } from "@/api/controllers/location.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";

const controller = new LocationController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  await controller.handle(req, res);
});
