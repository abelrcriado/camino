// CRUD endpoints para CSP
import type { NextApiRequest, NextApiResponse} from "next";
import { CSPController } from "../../src/controllers/csp.controller";
import { withCorrelationId } from "../../src/middlewares/correlationId";
import { asyncHandler } from "../../src/middlewares/error-handler";

/**
 * @swagger
 * /api/csp:
 *   get:
 *     summary: Listar Camino Service Points
 *     description: Obtiene la lista completa de puntos de servicio (CSPs) con filtros opcionales
 *     tags: [CSPs]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filtrar por ciudad
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filtrar por país
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, maintenance]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de CSPs obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CSP'
 *       400:
 *         description: Parámetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *   post:
 *     summary: Crear un nuevo CSP
 *     description: Crea un nuevo punto de servicio en el sistema
 *     tags: [CSPs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location_lat
 *               - location_lng
 *               - city
 *             properties:
 *               name:
 *                 type: string
 *               location_lat:
 *                 type: number
 *               location_lng:
 *                 type: number
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, maintenance]
 *               capacity:
 *                 type: integer
 *               services_offered:
 *                 type: array
 *                 items:
 *                   type: string
 *               opening_hours:
 *                 type: object
 *               contact_email:
 *                 type: string
 *               contact_phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: CSP creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CSP'
 *       500:
 *         description: Error interno del servidor
 *   put:
 *     summary: Actualizar un CSP
 *     description: Actualiza los datos de un punto de servicio existente
 *     tags: [CSPs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               location_lat:
 *                 type: number
 *               location_lng:
 *                 type: number
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, maintenance]
 *               capacity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: CSP actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CSP'
 *       400:
 *         description: ID de CSP faltante
 *       500:
 *         description: Error interno del servidor
 *   delete:
 *     summary: Eliminar un CSP
 *     description: Elimina un punto de servicio del sistema
 *     tags: [CSPs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       204:
 *         description: CSP eliminado exitosamente
 *       400:
 *         description: ID de CSP faltante
 *       500:
 *         description: Error interno del servidor
 */
const handler = asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const controller = new CSPController();
  return controller.handle(req, res);
});

export default withCorrelationId(handler);
