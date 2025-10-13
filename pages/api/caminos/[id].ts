// Endpoint dinámico para operaciones sobre un camino específico
import type { NextApiRequest, NextApiResponse } from "next";
import { CaminoController } from "../../../src/controllers/camino.controller";
import { validateUUID } from "@/middlewares/validate-uuid";
import { ErrorMessages } from "@/constants/error-messages";
import { asyncHandler } from "@/middlewares/error-handler";

/**
 * @swagger
 * /api/caminos/{id}:
 *   get:
 *     summary: Obtener camino por ID
 *     description: Retorna los detalles completos de un camino específico
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
 *         description: Camino encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Camino'
 *       400:
 *         description: ID inválido (no es UUID válido)
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
 *   put:
 *     summary: Actualizar camino específico
 *     description: Actualiza los datos de un camino usando su ID como parámetro de ruta
 *     tags: [Caminos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del camino a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 150
 *                 example: Camino de Santiago Francés
 *               codigo:
 *                 type: string
 *                 pattern: '^[A-Z0-9_-]+$'
 *                 minLength: 2
 *                 maxLength: 10
 *                 example: CSF
 *               zona_operativa:
 *                 type: string
 *                 maxLength: 100
 *                 example: Norte de España
 *               region:
 *                 type: string
 *                 maxLength: 100
 *                 example: Galicia
 *               estado_operativo:
 *                 type: string
 *                 enum: [activo, inactivo, mantenimiento, planificado]
 *               descripcion:
 *                 type: string
 *                 example: Ruta principal del Camino de Santiago
 *     responses:
 *       200:
 *         description: Camino actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Camino'
 *       400:
 *         description: ID inválido o al menos un campo debe ser actualizado
 *       404:
 *         description: Camino no encontrado
 *       409:
 *         description: El código de camino ya existe
 *       500:
 *         description: Error interno del servidor
 *   delete:
 *     summary: Eliminar camino específico
 *     description: Elimina un camino del sistema usando su ID
 *     tags: [Caminos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del camino a eliminar
 *     responses:
 *       200:
 *         description: Camino eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Camino eliminado exitosamente
 *       400:
 *         description: ID de camino inválido
 *       404:
 *         description: Camino no encontrado
 *       500:
 *         description: Error interno del servidor
 */
export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const controller = new CaminoController();

  // Extraer ID del query param
  const { id } = req.query;

  // Validar UUID usando middleware centralizado
  const validationError = validateUUID(id, "camino");
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  // Mapear método HTTP a operación del controller
  switch (req.method) {
    case "GET":
      // Inyectar ID en query para el controller
      req.query = { ...req.query, id };
      return controller.handle(req, res);

    case "PUT":
      // Inyectar ID en el body para el controller
      req.body = { ...req.body, id };
      return controller.handle(req, res);

    case "DELETE":
      // Inyectar ID en body para el controller
      req.body = { id };
      return controller.handle(req, res);

    default:
      return res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
  }
});

