/**
 * Sprint 3.2: API Auxiliar - Asignar producto a slot
 * Endpoint para asignar un producto a un slot con stock inicial
 *
 * @swagger
 * /api/vending-machine-slots/assign-product:
 *   post:
 *     summary: Asignar producto a slot
 *     description: Asigna un producto a un slot específico con stock inicial usando función DB
 *     tags: [Vending Machine Slots]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slot_id
 *               - producto_id
 *               - stock_inicial
 *             properties:
 *               slot_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del slot
 *               producto_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del producto a asignar
 *               stock_inicial:
 *                 type: integer
 *                 minimum: 0
 *                 description: Stock inicial del producto en el slot
 *     responses:
 *       200:
 *         description: Producto asignado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VendingMachineSlot'
 *       400:
 *         description: Datos inválidos o stock excede capacidad
 *       404:
 *         description: Slot o producto no encontrado
 *       500:
 *         description: Error interno del servidor
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { VendingMachineSlotController } from "@/controllers/vending_machine_slot.controller";
import { asyncHandler } from "@/middlewares/error-handler";

const controller = new VendingMachineSlotController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  return controller.assignProduct(req, res);
});
