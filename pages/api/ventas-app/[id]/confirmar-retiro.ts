// Endpoint para confirmar retiro de producto comprado
import type { NextApiRequest, NextApiResponse } from "next";
import { VentaAppService } from "@/api/services/venta_app.service";
import { VentaAppRepository } from "@/api/repositories/venta_app.repository";
import { asyncHandler } from "@/api/middlewares/error-handler";
import { ErrorMessages } from "@/shared/constants/error-messages";
import { validateUUID } from "@/api/middlewares/validate-uuid";

/**
 * @swagger
 * /api/ventas-app/{id}/confirmar-retiro:
 *   post:
 *     summary: Confirmar retiro de producto
 *     description: Marca la venta como retirada y consume el stock reservado
 *     tags: [Ventas App]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la venta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigo_retiro
 *             properties:
 *               codigo_retiro:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 pattern: '^[A-Z0-9]{6}$'
 *                 description: Código de 6 dígitos para validar el retiro
 *                 example: ABC123
 *               confirmado_por:
 *                 type: string
 *                 format: uuid
 *                 description: ID del usuario/empleado que confirma el retiro (opcional)
 *     responses:
 *       200:
 *         description: Retiro confirmado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Retiro confirmado exitosamente
 *                 venta:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     estado:
 *                       type: string
 *                       enum: [retirada]
 *                     fecha_retiro:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Código inválido, venta no está en estado válido, o ya fue retirada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Código de retiro inválido
 *       404:
 *         description: Venta no encontrada
 *       500:
 *         description: Error interno del servidor
 */
export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
  }

  const { id } = req.query;
  const { codigo_retiro } = req.body;

  // Validar UUID usando utilidad centralizada
  const validationError = validateUUID(id, "venta");
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  // Validar código de retiro
  if (!codigo_retiro || typeof codigo_retiro !== "string") {
    return res.status(400).json({ error: ErrorMessages.REQUIRED_CODIGO_RETIRO });
  }

  const codigoTrimmed = codigo_retiro.trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(codigoTrimmed)) {
    return res.status(400).json({
      error: "Código de retiro debe tener 6 caracteres alfanuméricos",
    });
  }

  const repository = new VentaAppRepository();
  const service = new VentaAppService(repository);

  // Confirmar retiro
  const result = await service.confirmarRetiro({
    venta_id: id as string,
    codigo_retiro: codigoTrimmed,
  });

  return res.status(200).json({
    message: "Retiro confirmado exitosamente",
    venta: {
      id: result.venta_id,
      estado: result.estado,
      fecha_retiro: result.fecha_retiro,
    },
  });
});
