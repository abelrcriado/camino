/**
 * API Route: /api/stats/transactions
 * Method: GET - Transaction statistics by period
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

interface TransactionStats {
  today: number;
  week: number;
  month: number;
  trend: Array<{ date: string; count: number }>;
}

/**
 * @swagger
 * /api/stats/transactions:
 *   get:
 *     summary: Get transaction statistics
 *     description: Returns transaction counts for today, week, and month with trend data
 *     tags: [Stats]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month]
 *         description: Filter by specific period
 *     responses:
 *       200:
 *         description: Transaction statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 today:
 *                   type: number
 *                   description: Number of transactions today
 *                 week:
 *                   type: number
 *                   description: Number of transactions this week
 *                 month:
 *                   type: number
 *                   description: Number of transactions this month
 *                 trend:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                       count:
 *                         type: number
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

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Get transactions from ventas_app (completed sales)
    const { data: ventasData, error: ventasError } = await supabase
      .from("ventas_app")
      .select("id, fecha_retiro")
      .eq("estado", "completado");

    if (ventasError) {
      return res
        .status(500)
        .json({ error: "Error al obtener transacciones de ventas" });
    }

    // Get transactions from payments (completed bookings)
    const { data: paymentsData, error: paymentsError } = await supabase
      .from("payments")
      .select("id, created_at")
      .eq("status", "succeeded");

    if (paymentsError) {
      return res
        .status(500)
        .json({ error: "Error al obtener transacciones de pagos" });
    }

    // Calculate transactions by period
    let todayCount = 0;
    let weekCount = 0;
    let monthCount = 0;

    // Process ventas_app
    ventasData?.forEach((venta) => {
      const ventaDate = new Date(venta.fecha_retiro);

      if (ventaDate >= today) {
        todayCount++;
      }
      if (ventaDate >= weekAgo) {
        weekCount++;
      }
      if (ventaDate >= monthAgo) {
        monthCount++;
      }
    });

    // Process payments
    paymentsData?.forEach((payment) => {
      const paymentDate = new Date(payment.created_at);

      if (paymentDate >= today) {
        todayCount++;
      }
      if (paymentDate >= weekAgo) {
        weekCount++;
      }
      if (paymentDate >= monthAgo) {
        monthCount++;
      }
    });

    // Calculate trend for last 7 days
    const trend: Array<{ date: string; count: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      let dailyCount = 0;

      // Ventas
      ventasData?.forEach((venta) => {
        const ventaDate = new Date(venta.fecha_retiro);
        if (ventaDate >= date && ventaDate < nextDate) {
          dailyCount++;
        }
      });

      // Payments
      paymentsData?.forEach((payment) => {
        const paymentDate = new Date(payment.created_at);
        if (paymentDate >= date && paymentDate < nextDate) {
          dailyCount++;
        }
      });

      trend.push({
        date: date.toISOString().split("T")[0],
        count: dailyCount,
      });
    }

    const stats: TransactionStats = {
      today: todayCount,
      week: weekCount,
      month: monthCount,
      trend,
    };

    return res.status(200).json(stats);
  }
);
