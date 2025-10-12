// Endpoint dinámico para operaciones sobre un slot específico de una vending machine
import type { NextApiRequest, NextApiResponse } from "next";
import { VendingMachineSlotService } from "@/services/vending_machine_slot.service";
import { VendingMachineSlotRepository } from "@/repositories/vending_machine_slot.repository";
import { validateUUIDs } from "@/middlewares/validate-uuid";
import { validateSlotOwnership } from "@/utils/validate-ownership";
import { ErrorMessages } from "@/constants/error-messages";

/**
 * @swagger
 * /api/vending-machines/{id}/slots/{slotId}:
 *   get:
 *     summary: Obtener slot específico
 *     description: Retorna los detalles de un slot específico de una vending machine
 *     tags: [Vending Machines]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la vending machine
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del slot
 *     responses:
 *       200:
 *         description: Slot encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 vending_machine_id:
 *                   type: string
 *                   format: uuid
 *                 slot_number:
 *                   type: integer
 *                 producto_id:
 *                   type: string
 *                   format: uuid
 *                   nullable: true
 *                 cantidad_actual:
 *                   type: integer
 *                 capacidad_maxima:
 *                   type: integer
 *                 precio_venta:
 *                   type: number
 *                   format: float
 *                 estado:
 *                   type: string
 *                   enum: [disponible, vacio, bloqueado, mantenimiento]
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Slot no encontrado
 *       500:
 *         description: Error interno del servidor
 *   put:
 *     summary: Actualizar slot específico
 *     description: Actualiza la configuración de un slot (producto, precio, capacidad, estado)
 *     tags: [Vending Machines]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: slotId
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
 *               producto_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               precio_venta:
 *                 type: number
 *                 format: float
 *               capacidad_maxima:
 *                 type: integer
 *               estado:
 *                 type: string
 *                 enum: [disponible, vacio, bloqueado, mantenimiento]
 *     responses:
 *       200:
 *         description: Slot actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Slot no encontrado
 *       500:
 *         description: Error interno del servidor
 *   delete:
 *     summary: Eliminar slot
 *     description: Elimina un slot de la vending machine
 *     tags: [Vending Machines]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Slot eliminado exitosamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Slot no encontrado
 *       500:
 *         description: Error interno del servidor
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, slotId } = req.query;

    // Validar UUIDs usando middleware centralizado
    const validationError = validateUUIDs(
      { id, slotId },
      {
        customNames: {
          id: "vending machine",
          slotId: "slot",
        },
      }
    );
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const repository = new VendingMachineSlotRepository();
    const service = new VendingMachineSlotService(repository);

    switch (req.method) {
      case "GET": {
        const slot = await service.findById(slotId as string);

        // Validar ownership usando utility centralizado
        const ownershipError = validateSlotOwnership(slot, id as string);
        if (ownershipError) {
          return res
            .status(ownershipError.status)
            .json({ error: ownershipError.message });
        }

        return res.status(200).json(slot);
      }

      case "PUT": {
        // Verificar que el slot existe y pertenece a la vending machine
        const existing = await service.findById(slotId as string);
        
        const ownershipError = validateSlotOwnership(existing, id as string);
        if (ownershipError) {
          return res
            .status(ownershipError.status)
            .json({ error: ownershipError.message });
        }

        const updated = await service.update(slotId as string, req.body);
        return res.status(200).json({ data: [updated] });
      }

      case "DELETE": {
        // Verificar que el slot existe y pertenece a la vending machine
        const existing = await service.findById(slotId as string);
        
        const ownershipError = validateSlotOwnership(existing, id as string);
        if (ownershipError) {
          return res
            .status(ownershipError.status)
            .json({ error: ownershipError.message });
        }

        await service.delete(slotId as string);
        return res.status(200).json({ message: "Slot eliminado exitosamente" });
      }

      default:
        return res
          .status(405)
          .json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("Error en operación de slot:", errorMessage);

    return res.status(500).json({
      error: "Error al procesar la operación del slot",
    });
  }
}

export default handler;
