import { serviceAssignmentController } from "@/api/controllers/service-assignment.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";

/**
 * @swagger
 * /api/service-assignments/unassign:
 *   post:
 *     summary: Desasignar servicio de punto
 *     description: Elimina la relación entre un servicio y un punto de servicio
 *     tags: [Service Assignments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - service_id
 *               - service_point_id
 *             properties:
 *               service_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del servicio a desasignar
 *               service_point_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del punto de servicio
 *     responses:
 *       200:
 *         description: Servicio desasignado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Error de validación (IDs inválidos)
 *       404:
 *         description: Asignación no encontrada
 *       405:
 *         description: Método no permitido (solo POST)
 *       500:
 *         description: Error interno del servidor
 */

export default asyncHandler(async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`,
    });
  }

  return await serviceAssignmentController.unassign(req, res);
});
