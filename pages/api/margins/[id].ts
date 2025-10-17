import { marginController } from "@/api/controllers/margin.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";
import { ErrorMessages } from "@/shared/constants/error-messages";
import { validateUUID } from "@/api/middlewares/validate-uuid";

/**
 * @swagger
 * /api/margins/{id}:
 *   get:
 *     summary: Obtener configuración de margen general
 *     description: Recupera la configuración de margen general para un punto de servicio
 *     tags: [Margins]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del punto de servicio
 *     responses:
 *       200:
 *         description: Configuración de margen obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     service_point_id:
 *                       type: string
 *                       format: uuid
 *                     general_margin_percentage:
 *                       type: number
 *                       format: float
 *                       description: Porcentaje de margen general (0-100)
 *       400:
 *         description: ID inválido
 *       500:
 *         description: Error interno del servidor
 *   put:
 *     summary: Actualizar margen general
 *     description: Actualiza o crea el margen general para un punto de servicio
 *     tags: [Margins]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del punto de servicio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - general_margin_percentage
 *             properties:
 *               general_margin_percentage:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Porcentaje de margen general
 *                 example: 25.5
 *     responses:
 *       200:
 *         description: Margen actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error interno del servidor
 */

export default asyncHandler(async (req, res) => {
  const { id } = req.query;

  // Validar UUID usando utilidad centralizada
  const validationError = validateUUID(id, "punto de servicio");
  if (validationError) {
    return res.status(400).json({
      success: false,
      error: validationError,
    });
  }

  switch (req.method) {
    case "GET": {
      const result = await marginController.getMarginConfig(id as string);
      return res.status(result.success ? 200 : 400).json(result);
    }

    case "PUT": {
      const { general_margin_percentage } = req.body;

      if (general_margin_percentage === undefined) {
        return res.status(400).json({
          success: false,
          error: "general_margin_percentage es requerido",
        });
      }

      const result = await marginController.upsertGeneralMargin(
        id as string,
        parseFloat(general_margin_percentage)
      );

      return res.status(result.success ? 200 : 400).json(result);
    }

    default:
      return res.status(405).json({
        success: false,
        error: ErrorMessages.METHOD_NOT_ALLOWED,
      });
  }
});
