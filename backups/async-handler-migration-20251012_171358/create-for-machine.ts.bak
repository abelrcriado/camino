/**
 * Sprint 3.2: API Auxiliar - Crear slots masivamente
 * Endpoint para crear múltiples slots en una máquina vending
 *
 * @swagger
 * /api/vending-machine-slots/create-for-machine:
 *   post:
 *     summary: Crear slots masivamente para una máquina
 *     description: Crea N slots automáticamente en una máquina vending usando función DB
 *     tags: [Vending Machine Slots]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - machine_id
 *               - num_slots
 *             properties:
 *               machine_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la máquina vending
 *               num_slots:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 description: Número de slots a crear
 *               capacidad_maxima:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 1000
 *                 default: 10
 *                 description: Capacidad máxima para cada slot
 *     responses:
 *       201:
 *         description: Slots creados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 created:
 *                   type: integer
 *                   description: Número de slots creados
 *                 message:
 *                   type: string
 *                   example: "10 slots creados exitosamente para la máquina xxx"
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Máquina no encontrada
 *       500:
 *         description: Error interno del servidor
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { VendingMachineSlotController } from "@/controllers/vending_machine_slot.controller";

const controller = new VendingMachineSlotController();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  return controller.createSlotsForMachine(req, res);
}
