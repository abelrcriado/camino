// Endpoint dinámico para operaciones sobre una ubicación específica
import type { NextApiRequest, NextApiResponse } from "next";
import { LocationController } from "../../../src/controllers/location.controller";
import { asyncHandler } from "../../../src/middlewares/error-handler";
import { ErrorMessages } from "@/constants/error-messages";
import { validateUUID } from "@/middlewares/validate-uuid";

/**
 * @swagger
 * /api/ubicaciones/{id}:
 *   get:
 *     summary: Obtener ubicación por ID
 *     description: Retorna los detalles completos de una ubicación específica
 *     tags: [Ubicaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único de la ubicación
 *     responses:
 *       200:
 *         description: Ubicación encontrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Ubicación no encontrada
 *       500:
 *         description: Error interno del servidor
 *   put:
 *     summary: Actualizar ubicación específica
 *     description: Actualiza los datos de una ubicación usando su ID como parámetro de ruta
 *     tags: [Ubicaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               city:
 *                 type: string
 *                 maxLength: 100
 *               province:
 *                 type: string
 *                 maxLength: 100
 *               camino_id:
 *                 type: string
 *                 format: uuid
 *               address:
 *                 type: string
 *                 maxLength: 200
 *               postal_code:
 *                 type: string
 *                 maxLength: 20
 *               latitude:
 *                 type: number
 *                 format: float
 *               longitude:
 *                 type: number
 *                 format: float
 *     responses:
 *       200:
 *         description: Ubicación actualizada exitosamente
 *       400:
 *         description: ID inválido o datos inválidos
 *       404:
 *         description: Ubicación no encontrada
 *       500:
 *         description: Error interno del servidor
 *   delete:
 *     summary: Eliminar ubicación específica
 *     description: Elimina una ubicación del sistema usando su ID
 *     tags: [Ubicaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Ubicación eliminada exitosamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Ubicación no encontrada
 *       500:
 *         description: Error interno del servidor
 */
export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const controller = new LocationController();
  const { id } = req.query;

  // Validar UUID usando utilidad centralizada
  const validationError = validateUUID(id, "ubicación");
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  // Mapear método HTTP a operación del controller
  switch (req.method) {
    case "GET":
      req.query = { ...req.query, id };
      return controller.handle(req, res);

    case "PUT":
      req.body = { ...req.body, id };
      return controller.handle(req, res);

    case "DELETE":
      req.body = { id };
      return controller.handle(req, res);

    default:
      return res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
  }
});
