/**
 * Sprint 3.2: API Auxiliar - Gestión de reservas de stock
 * Endpoints para reservar, liberar y consumir stock
 *
 * @swagger
 * /api/vending-machine-slots/reserve-stock:
 *   post:
 *     summary: Reservar stock en slot
 *     description: Reserva unidades de stock (mueve de disponible a reservado) con lock transaccional
 *     tags: [Vending Machine Slots]
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
 *                 description: ID del slot
 *               cantidad:
 *                 type: integer
 *                 minimum: 1
 *                 description: Cantidad a reservar
 *     responses:
 *       200:
 *         description: Stock reservado exitosamente
 *       409:
 *         description: Stock insuficiente
 *       500:
 *         description: Error interno del servidor
 *
 * /api/vending-machine-slots/release-stock:
 *   post:
 *     summary: Liberar stock reservado
 *     description: Libera unidades reservadas (mueve de reservado a disponible)
 *     tags: [Vending Machine Slots]
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
 *                 description: ID del slot
 *               cantidad:
 *                 type: integer
 *                 minimum: 1
 *                 description: Cantidad a liberar
 *     responses:
 *       200:
 *         description: Stock liberado exitosamente
 *       500:
 *         description: Error interno del servidor
 *
 * /api/vending-machine-slots/consume-stock:
 *   post:
 *     summary: Consumir stock reservado
 *     description: Consume stock reservado (venta confirmada, reduce stock_reservado)
 *     tags: [Vending Machine Slots]
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
 *                 description: ID del slot
 *               cantidad:
 *                 type: integer
 *                 minimum: 1
 *                 description: Cantidad a consumir
 *     responses:
 *       200:
 *         description: Stock consumido exitosamente
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

  const { pathname } = new URL(req.url || "", `http://${req.headers.host}`);

  if (pathname.endsWith("/reserve-stock")) {
    return controller.reserveStock(req, res);
  } else if (pathname.endsWith("/release-stock")) {
    return controller.releaseStock(req, res);
  } else if (pathname.endsWith("/consume-stock")) {
    return controller.consumeStock(req, res);
  }

  return res.status(404).json({ error: "Endpoint no encontrado" });
}
