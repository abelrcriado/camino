// Endpoint para obtener detalle de una venta específica
import type { NextApiRequest, NextApiResponse } from "next";
import { VentaAppController } from "@/controllers/venta_app.controller";

/**
 * @swagger
 * /api/ventas-app/{id}:
 *   get:
 *     summary: Obtener detalle de venta
 *     description: Obtiene información completa de una venta específica por ID
 *     tags: [Ventas App]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la venta
 *     responses:
 *       200:
 *         description: Detalle de la venta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 user_id:
 *                   type: string
 *                   format: uuid
 *                 slot_id:
 *                   type: string
 *                   format: uuid
 *                 cantidad:
 *                   type: integer
 *                 precio_unitario:
 *                   type: number
 *                 precio_total:
 *                   type: number
 *                 estado:
 *                   type: string
 *                   enum: [reservada, pagada, retirada, cancelada, expirada]
 *                 codigo_retiro:
 *                   type: string
 *                 fecha_reserva:
 *                   type: string
 *                   format: date-time
 *                 fecha_pago:
 *                   type: string
 *                   format: date-time
 *                 fecha_retiro:
 *                   type: string
 *                   format: date-time
 *                 fecha_expiracion:
 *                   type: string
 *                   format: date-time
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Venta no encontrada
 *       405:
 *         description: Método no permitido
 *       500:
 *         description: Error interno del servidor
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "ID de venta es requerido" });
    }

    // Validar formato UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: "ID de venta inválido" });
    }

    // Delegar al controller con ID inyectado
    req.query = { ...req.query, id };
    const controller = new VentaAppController();
    return controller.handle(req, res);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("Error obteniendo venta:", errorMessage);

    return res.status(500).json({
      error: "Error al obtener la venta",
    });
  }
}

export default handler;
