/**
 * API Route: /api/stats/alerts
 * Method: GET - Critical business alerts
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { asyncHandler } from "@/middlewares/error-handler";
import { ErrorMessages } from "@/constants/error-messages";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Alert {
  id: string;
  type: "stock" | "machine" | "payment" | "request";
  severity: "critical" | "warning";
  message: string;
  created_at: string;
}

/**
 * @swagger
 * /api/stats/alerts:
 *   get:
 *     summary: Get critical business alerts
 *     description: Returns critical alerts for stock, machines, payments, and requests
 *     tags: [Stats]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *           minimum: 1
 *           maximum: 50
 *         description: Number of alerts to return
 *     responses:
 *       200:
 *         description: Alerts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: number
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                       severity:
 *                         type: string
 *                       message:
 *                         type: string
 *                       created_at:
 *                         type: string
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Internal server error
 */
export default asyncHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "GET") {
      return res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
    }

    const { limit = "5" } = req.query;
    const limitNum = Math.min(parseInt(limit as string, 10), 50);

    const alerts: Alert[] = [];

    // Check low stock in vending slots
    const { data: slotsData } = await supabase
      .from("vending_machine_slots")
      .select("id, slot_number, stock_actual, stock_minimo, machine_id")
      .lte("stock_actual", 2)
      .gt("stock_minimo", 0);

    slotsData?.forEach((slot) => {
      alerts.push({
        id: `stock-slot-${slot.id}`,
        type: "stock",
        severity: slot.stock_actual === 0 ? "critical" : "warning",
        message: `Stock bajo en Slot #${slot.slot_number} - Solo ${slot.stock_actual} unidades`,
        created_at: new Date().toISOString(),
      });
    });

    // Check warehouse low stock
    const { data: warehouseData } = await supabase
      .from("warehouse_inventory")
      .select("id, producto_id, cantidad, stock_minimo, productos(nombre)")
      .lt("cantidad", supabase.rpc("warehouse_inventory.stock_minimo"));

    warehouseData?.forEach((item: { id: string; producto_id: string; cantidad: number; stock_minimo: number; productos?: { nombre: string } }) => {
      alerts.push({
        id: `stock-warehouse-${item.id}`,
        type: "stock",
        severity: "critical",
        message: `Warehouse bajo mínimo: ${item.productos?.nombre || "Producto"} (${item.cantidad}/${item.stock_minimo})`,
        created_at: new Date().toISOString(),
      });
    });

    // Check failed payments (last 24h)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: paymentsData } = await supabase
      .from("payments")
      .select("id, booking_id, created_at")
      .eq("status", "failed")
      .gte("created_at", yesterday.toISOString());

    paymentsData?.forEach((payment) => {
      alerts.push({
        id: `payment-${payment.id}`,
        type: "payment",
        severity: "warning",
        message: `Pago fallido - Booking #${payment.booking_id}`,
        created_at: payment.created_at,
      });
    });

    // Check pending stock requests
    const { data: stockRequestsData } = await supabase
      .from("stock_requests")
      .select("id, created_at")
      .eq("estado", "pendiente");

    if (stockRequestsData && stockRequestsData.length > 0) {
      alerts.push({
        id: "stock-requests-pending",
        type: "request",
        severity: "warning",
        message: `${stockRequestsData.length} Stock Requests pendientes de aprobar`,
        created_at: new Date().toISOString(),
      });
    }

    // Sort by severity (critical first) and created_at
    alerts.sort((a, b) => {
      if (a.severity !== b.severity) {
        return a.severity === "critical" ? -1 : 1;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return res.status(200).json({
      count: alerts.length,
      items: alerts.slice(0, limitNum),
    });
  }
);
