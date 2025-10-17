import { marginController } from "@/api/controllers/margin.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";
import { ErrorMessages } from "@/shared/constants/error-messages";
import { validateUUID } from "@/api/middlewares/validate-uuid";

/**
 * @swagger
 * /api/margins/{id}/products:
 *   put:
 *     summary: Actualizar márgenes específicos por producto
 *     description: Actualiza los márgenes personalizados para productos específicos en un punto de servicio
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
 *               - product_specific_margins
 *             properties:
 *               product_specific_margins:
 *                 type: object
 *                 description: Objeto con product_id como clave y porcentaje de margen como valor
 *                 additionalProperties:
 *                   type: number
 *                   format: float
 *                   minimum: 0
 *                   maximum: 100
 *                 example:
 *                   "a1b2c3d4-e5f6-7890-1234-567890abcdef": 30.5
 *                   "f1e2d3c4-b5a6-7890-1234-567890fedcba": 15.0
 *     responses:
 *       200:
 *         description: Márgenes de productos actualizados exitosamente
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
 *         description: Error de validación (ID inválido o formato incorrecto)
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

  if (req.method !== "PUT") {
    return res.status(405).json({
      success: false,
      error: ErrorMessages.METHOD_NOT_ALLOWED,
    });
  }

  const { product_specific_margins } = req.body;

  if (
    !product_specific_margins ||
    typeof product_specific_margins !== "object"
  ) {
    return res.status(400).json({
      success: false,
      error: "product_specific_margins es requerido y debe ser un objeto",
    });
  }

  const result = await marginController.updateProductMargins(
    id as string,
    product_specific_margins
  );

  return res.status(result.success ? 200 : 400).json(result);
});
