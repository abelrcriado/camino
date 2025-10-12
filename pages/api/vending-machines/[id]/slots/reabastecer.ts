// Endpoint para reabastecer un slot de vending machine
import type { NextApiRequest, NextApiResponse } from "next";
import { VendingMachineSlotService } from "@/services/vending_machine_slot.service";
import { VendingMachineSlotRepository } from "@/repositories/vending_machine_slot.repository";
import { asyncHandler } from "@/middlewares/error-handler";

/**
 * @swagger
 * /api/vending-machines/{id}/slots/reabastecer:
 *   post:
 *     summary: Reabastecer slots de una vending machine
 *     description: Incrementa el stock de uno o varios slots de la vending machine
 *     tags: [Vending Machines]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la vending machine
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slot_id
 *               - cantidad
 *             properties:
 *               slot_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del slot a reabastecer
 *               cantidad:
 *                 type: integer
 *                 minimum: 1
 *                 description: Cantidad de productos a agregar
 *                 example: 10
 *     responses:
 *       200:
 *         description: Slot reabastecido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Slot reabastecido exitosamente
 *                 slot:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     slot_number:
 *                       type: integer
 *                     stock_disponible:
 *                       type: integer
 *                       description: Stock disponible después del reabastecimiento
 *                     stock_reservado:
 *                       type: integer
 *                     capacidad_maxima:
 *                       type: integer
 *                 reabastecimiento:
 *                   type: object
 *                   properties:
 *                     cantidad_agregada:
 *                       type: integer
 *                     stock_anterior:
 *                       type: integer
 *                     stock_nuevo:
 *                       type: integer
 *       400:
 *         description: Datos inválidos (cantidad negativa, excede capacidad, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: La cantidad excede la capacidad máxima del slot
 *       404:
 *         description: Vending machine o slot no encontrado
 *       500:
 *         description: Error interno del servidor
 */
export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { id } = req.query;
  const { slot_id, cantidad } = req.body;

  // Validar ID de vending machine
  if (!id || typeof id !== "string") {
    return res
      .status(400)
      .json({ error: "ID de vending machine es requerido" });
  }

  // Validar formato UUID
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({ error: "ID de vending machine inválido" });
  }

  // Validar slot_id
  if (!slot_id || typeof slot_id !== "string") {
    return res.status(400).json({ error: "ID de slot es requerido" });
  }

  if (!uuidRegex.test(slot_id)) {
    return res.status(400).json({ error: "ID de slot inválido" });
  }

  // Validar cantidad
  if (
    cantidad === undefined ||
    cantidad === null ||
    typeof cantidad !== "number"
  ) {
    return res.status(400).json({ error: "Cantidad es requerida" });
  }

  if (cantidad <= 0) {
    return res.status(400).json({ error: "La cantidad debe ser mayor a 0" });
  }

  if (!Number.isInteger(cantidad)) {
    return res
      .status(400)
      .json({ error: "La cantidad debe ser un número entero" });
  }

  const repository = new VendingMachineSlotRepository();
  const service = new VendingMachineSlotService(repository);

  // Verificar que el slot existe y pertenece a la vending machine
  const slot = await service.findById(slot_id);
  if (!slot) {
    return res.status(404).json({ error: "Slot no encontrado" });
  }

  if (slot.machine_id !== id) {
    return res
      .status(404)
      .json({ error: "Slot no encontrado en esta vending machine" });
  }

  // Verificar capacidad
  const stockAnterior = slot.stock_disponible;
  const stockNuevo = stockAnterior + cantidad;

  if (stockNuevo + slot.stock_reservado > slot.capacidad_maxima) {
    return res.status(400).json({
      error: `La cantidad excede la capacidad máxima del slot (${slot.capacidad_maxima})`,
    });
  }

  // Reabastecer slot (actualizar stock disponible)
  const updatedSlot = await service.updateSlot({
    id: slot_id,
    stock_disponible: stockNuevo,
  });

  return res.status(200).json({
    message: "Slot reabastecido exitosamente",
    slot: {
      id: updatedSlot.id,
      slot_number: updatedSlot.slot_number,
      stock_disponible: updatedSlot.stock_disponible,
      stock_reservado: updatedSlot.stock_reservado,
      capacidad_maxima: updatedSlot.capacidad_maxima,
    },
    reabastecimiento: {
      cantidad_agregada: cantidad,
      stock_anterior: stockAnterior,
      stock_nuevo: updatedSlot.stock_disponible,
    },
  });
});
