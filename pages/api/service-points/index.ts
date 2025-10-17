/**
 * API Route: /api/service-points
 * Gestiona CSP (Partner), CSS (Propio), CSH (Taller Aliado)
 * 
 * @swagger
 * /api/service-points:
 *   get:
 *     summary: Listar service points
 *     description: Obtiene lista paginada de puntos de servicio (CSP, CSS, CSH) con filtros
 *     tags: [Service Points]
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
 *         name: ubicacion_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ubicación
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [CSP, CSS, CSH]
 *         description: Tipo de service point
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, pending]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre o descripción
 *     responses:
 *       200:
 *         description: Lista de service points
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
 *                       ubicacion_id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [CSP, CSS, CSH]
 *                       status:
 *                         type: string
 *                       description:
 *                         type: string
 *                       contact_info:
 *                         type: object
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno
 *   post:
 *     summary: Crear service point
 *     description: Registra un nuevo punto de servicio (CSP/CSS/CSH)
 *     tags: [Service Points]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ubicacion_id
 *               - name
 *               - type
 *             properties:
 *               ubicacion_id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [CSP, CSS, CSH]
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 default: active
 *               contact_info:
 *                 type: object
 *     responses:
 *       201:
 *         description: Service point creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno
 */

import { NextApiRequest, NextApiResponse } from "next";
import { ServicePointController } from "@/api/controllers/service-point.controller";
import { ServicePointService } from "@/api/services/service-point.service";
import { ServicePointRepository } from "@/api/repositories/service-point.repository";
import { asyncHandler } from "@/api/middlewares/error-handler";

// Inicializar dependencias
const repository = new ServicePointRepository();
const service = new ServicePointService(repository);
const controller = new ServicePointController(service);

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  return await controller.handle(req, res);
});
