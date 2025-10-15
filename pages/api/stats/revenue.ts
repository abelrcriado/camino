/**
 * API Route: /api/stats/revenue
 * Method: GET - Revenue statistics by period
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

interface RevenueStats {
  today: number;
  week: number;
  month: number;
  trend: Array<{ date: string; amount: number }>;
}

/**
 * @swagger
 * /api/stats/revenue:
 *   get:
 *     summary: Get revenue statistics
 *     description: Returns revenue stats for today, week, and month with trend data
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
 *         description: Revenue statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 today:
 *                   type: number
 *                   description: Revenue for today in cents
 *                 week:
 *                   type: number
 *                   description: Revenue for current week in cents
 *                 month:
 *                   type: number
 *                   description: Revenue for current month in cents
 *                 trend:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                       amount:
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

    // Get revenue from ventas_app (completed sales)
    const { data: ventasData, error: ventasError } = await supabase
      .from("ventas_app")
      .select("precio_total, fecha_retiro")
      .eq("estado", "completado");

    if (ventasError) {
      return res
        .status(500)
        .json({ error: "Error al obtener estadísticas de ventas" });
    }

    // Get revenue from payments (completed bookings)
    const { data: paymentsData, error: paymentsError } = await supabase
      .from("payments")
      .select("amount, created_at")
      .eq("status", "succeeded");

    if (paymentsError) {
      return res
        .status(500)
        .json({ error: "Error al obtener estadísticas de pagos" });
    }

    // Calculate revenue by period
    let todayRevenue = 0;
    let weekRevenue = 0;
    let monthRevenue = 0;

    // Process ventas_app
    ventasData?.forEach((venta) => {
      const ventaDate = new Date(venta.fecha_retiro);
      const amount = venta.precio_total || 0;

      if (ventaDate >= today) {
        todayRevenue += amount;
      }
      if (ventaDate >= weekAgo) {
        weekRevenue += amount;
      }
      if (ventaDate >= monthAgo) {
        monthRevenue += amount;
      }
    });

    // Process payments
    paymentsData?.forEach((payment) => {
      const paymentDate = new Date(payment.created_at);
      const amount = payment.amount || 0;

      if (paymentDate >= today) {
        todayRevenue += amount;
      }
      if (paymentDate >= weekAgo) {
        weekRevenue += amount;
      }
      if (paymentDate >= monthAgo) {
        monthRevenue += amount;
      }
    });

    // Calculate trend for last 7 days
    const trend: Array<{ date: string; amount: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      let dailyRevenue = 0;

      // Ventas
      ventasData?.forEach((venta) => {
        const ventaDate = new Date(venta.fecha_retiro);
        if (ventaDate >= date && ventaDate < nextDate) {
          dailyRevenue += venta.precio_total || 0;
        }
      });

      // Payments
      paymentsData?.forEach((payment) => {
        const paymentDate = new Date(payment.created_at);
        if (paymentDate >= date && paymentDate < nextDate) {
          dailyRevenue += payment.amount || 0;
        }
      });

      trend.push({
        date: date.toISOString().split("T")[0],
        amount: dailyRevenue,
      });
    }

    const stats: RevenueStats = {
      today: todayRevenue,
      week: weekRevenue,
      month: monthRevenue,
      trend,
    };

    return res.status(200).json(stats);
  }
);
