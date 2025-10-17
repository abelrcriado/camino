// Endpoint para operaciones sobre precios individuales
import type { NextApiRequest, NextApiResponse } from "next";
import { PrecioController } from "@/api/controllers/precio.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";
import { ErrorMessages } from "@/shared/constants/error-messages";
import { validateUUID } from "@/api/middlewares/validate-uuid";

/**
 * @swagger
 * /api/precios/{id}:
 *   get:
 *     summary: Obtener precio por ID
 *     description: Obtiene un precio específico del sistema jerárquico por su ID
 *     tags: [Precios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del precio
 *     responses:
 *       200:
 *         description: Detalle del precio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 entidad_tipo:
 *                   type: string
 *                   enum: [BASE, UBICACION, SERVICE_POINT]
 *                 entidad_id:
 *                   type: string
 *                   format: uuid
 *                 producto_id:
 *                   type: string
 *                   format: uuid
 *                 precio:
 *                   type: number
 *                   format: float
 *                 moneda:
 *                   type: string
 *                   default: EUR
 *                 is_active:
 *                   type: boolean
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Precio no encontrado
 *       405:
 *         description: Método no permitido
 *       500:
 *         description: Error interno del servidor
 *   put:
 *     summary: Actualizar precio
 *     description: Actualiza un precio existente en el sistema jerárquico
 *     tags: [Precios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del precio a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               precio:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Nuevo valor del precio
 *               moneda:
 *                 type: string
 *                 maxLength: 3
 *                 description: Código de moneda (ISO 4217)
 *                 example: EUR
 *               is_active:
 *                 type: boolean
 *                 description: Estado del precio
 *     responses:
 *       200:
 *         description: Precio actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Precio no encontrado
 *       500:
 *         description: Error interno del servidor
 *   delete:
 *     summary: Eliminar precio
 *     description: Elimina un precio del sistema jerárquico
 *     tags: [Precios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del precio a eliminar
 *     responses:
 *       200:
 *         description: Precio eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Precio eliminado exitosamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Precio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const allowedMethods = ["GET", "PUT", "DELETE"];

  if (!allowedMethods.includes(req.method || "")) {
    return res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
  }

  const { id } = req.query;

  // Validar UUID usando utilidad centralizada
  const validationError = validateUUID(id, "precio");
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  // Inyectar ID en el body para PUT y en query para todos
  if (req.method === "PUT") {
    req.body = { ...req.body, id };
  }
  req.query = { ...req.query, id };

  // Delegar al controller
  const controller = new PrecioController();
  return controller.handleRequest(req, res);
});
