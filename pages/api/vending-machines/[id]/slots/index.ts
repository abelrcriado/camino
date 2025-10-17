// Endpoint para listar slots de una vending machine
import type { NextApiRequest, NextApiResponse } from "next";
import { VendingMachineSlotService } from "@/api/services/vending_machine_slot.service";
import { VendingMachineSlotRepository } from "@/api/repositories/vending_machine_slot.repository";
import { asyncHandler } from "@/api/middlewares/error-handler";
import { ErrorMessages } from "@/shared/constants/error-messages";
import { validateUUID } from "@/api/middlewares/validate-uuid";

/**
 * @swagger
 * /api/vending-machines/{id}/slots:
 *   get:
 *     summary: Obtener slots de una vending machine
 *     description: Retorna todos los slots (ranuras) de una máquina expendedora específica
 *     tags: [Vending Machines]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único de la vending machine
 *       - in: query
 *         name: numero_slot
 *         schema:
 *           type: string
 *         description: Filtrar por número de slot específico (ej. A1, B2)
 *       - in: query
 *         name: producto_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por producto asignado
 *     responses:
 *       200:
 *         description: Lista de slots obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       vending_machine_id:
 *                         type: string
 *                         format: uuid
 *                       numero_slot:
 *                         type: string
 *                         example: A1
 *                       producto_id:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *                       cantidad_actual:
 *                         type: integer
 *                         example: 5
 *                       capacidad_maxima:
 *                         type: integer
 *                         example: 10
 *                       precio_venta:
 *                         type: number
 *                         format: float
 *                         example: 2.50
 *                       estado:
 *                         type: string
 *                         enum: [disponible, vacio, bloqueado, mantenimiento]
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                 total:
 *                   type: integer
 *                 vending_machine:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Vending machine no encontrada
 *       500:
 *         description: Error interno del servidor
 */
export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
  }

  const { id, numero_slot, producto_id } = req.query;

  // Validar UUID usando utilidad centralizada
  const validationError = validateUUID(id, "vending machine");
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  // Obtener slots
  const repository = new VendingMachineSlotRepository();
  const service = new VendingMachineSlotService(repository);

  // Obtener slots de la vending machine
  const slots = await service.findByMachine(id as string);

  // Aplicar filtros adicionales si existen
  let filteredSlots = slots;
  if (numero_slot && typeof numero_slot === "string") {
    const slotNum = parseInt(numero_slot, 10);
    if (!isNaN(slotNum)) {
      filteredSlots = slots.filter((slot) => slot.slot_number === slotNum);
    }
  }
  if (producto_id && typeof producto_id === "string") {
    filteredSlots = filteredSlots.filter(
      (slot) => slot.producto_id === producto_id
    );
  }

  return res.status(200).json({
    data: filteredSlots,
    total: filteredSlots.length,
    vending_machine: {
      id,
    },
  });
});
