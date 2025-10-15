/**
 * API Route: /api/alerts/[id]/marcar-leida
 * 
 * @swagger
 * /api/alerts/{id}/marcar-leida:
 *   put:
 *     summary: Marcar alerta como leída
 *     description: Marca una alerta específica como leída o no leída
 *     tags: [Alerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la alerta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - leida
 *             properties:
 *               leida:
 *                 type: boolean
 *                 description: Estado de lectura (true = leída, false = no leída)
 *     responses:
 *       200:
 *         description: Alerta actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Alert'
 *       400:
 *         description: ID inválido o datos faltantes
 *       404:
 *         description: Alerta no encontrada
 *       500:
 *         description: Error del servidor
 */

import { NextApiRequest, NextApiResponse } from "next";
import { AlertService } from "@/services/alert.service";
import { validateUUID } from "@/middlewares/validate-uuid";
import { asyncHandler } from "@/middlewares/error-handler";
import { marcarLeidaSchema } from "@/schemas/alert.schema";
import logger from "@/config/logger";

const service = new AlertService();

export default asyncHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const startTime = Date.now();

    if (req.method !== "PUT") {
      res.setHeader("Allow", ["PUT"]);
      return res.status(405).json({
        error: "Método no permitido",
      });
    }

    try {
      const { id } = req.query;

      // Validar UUID
      const uuidError = validateUUID(id as string, "alerta");
      if (uuidError) {
        return res.status(400).json({ error: uuidError });
      }

      // Validar body con Zod
      const validatedData = marcarLeidaSchema.parse({
        id,
        ...req.body,
      });

      const alert = await service.marcarLeida(
        validatedData.id,
        validatedData.leida
      );

      const duration = Date.now() - startTime;
      logger.info(
        `[AlertMarcarLeida] PUT ${req.url} - 200 (${duration}ms) - Alert ${id} marked as ${validatedData.leida ? "read" : "unread"}`
      );

      return res.status(200).json({
        data: [alert],
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";

      logger.error(`[AlertMarcarLeida Error]:`, { error: errorMessage });
      logger.info(`[AlertMarcarLeida] ERROR - Duration: ${duration}ms - ${errorMessage}`);

      // Zod validation errors
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({
          error: "Error de validación",
          details: error,
        });
      }

      return res.status(500).json({
        error: errorMessage || "Error al actualizar alerta",
      });
    }
  }
);
