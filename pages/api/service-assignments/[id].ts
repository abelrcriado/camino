import { serviceAssignmentController } from "@/api/controllers/service-assignment.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";

/**
 * @swagger
 * /api/service-assignments/{id}:
 *   get:
 *     summary: Obtener asignación por ID
 *     description: Recupera los detalles de una asignación servicio-punto específica
 *     tags: [Service Assignments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la asignación
 *     responses:
 *       200:
 *         description: Asignación encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/ServiceAssignment'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Asignación no encontrada
 *       500:
 *         description: Error interno del servidor
 *   patch:
 *     summary: Actualizar asignación (PATCH)
 *     description: Actualización parcial de una asignación existente
 *     tags: [Service Assignments]
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
 *               is_active:
 *                 type: boolean
 *               priority:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *               configuracion:
 *                 type: object
 *     responses:
 *       200:
 *         description: Asignación actualizada
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Asignación no encontrada
 *       500:
 *         description: Error interno del servidor
 *   put:
 *     summary: Actualizar asignación (PUT)
 *     description: Actualización completa de una asignación existente
 *     tags: [Service Assignments]
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
 *             $ref: '#/components/schemas/ServiceAssignment'
 *     responses:
 *       200:
 *         description: Asignación actualizada
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Asignación no encontrada
 *       500:
 *         description: Error interno del servidor
 *   delete:
 *     summary: Eliminar asignación
 *     description: Marca una asignación como inactiva (soft delete)
 *     tags: [Service Assignments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Asignación eliminada exitosamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Asignación no encontrada
 *       500:
 *         description: Error interno del servidor
 */

export default asyncHandler(async (req, res) => {
  switch (req.method) {
    case "GET":
      return await serviceAssignmentController.getById(req, res);

    case "PATCH":
    case "PUT":
      return await serviceAssignmentController.update(req, res);

    case "DELETE":
      return await serviceAssignmentController.delete(req, res);

    default:
      res.setHeader("Allow", ["GET", "PATCH", "PUT", "DELETE"]);
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} Not Allowed`,
      });
  }
});
