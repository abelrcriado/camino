/**
 * API Route: /api/stats/top-products
 * Method: GET - Top selling products statistics
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

interface TopProduct {
  producto_id: string;
  producto_nombre: string;
  cantidad: number;
  revenue: number;
}

/**
 * @swagger
 * /api/stats/top-products:
 *   get:
 *     summary: Get top selling products
 *     description: Returns top 5 most sold products by period
 *     tags: [Stats]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month]
 *           default: today
 *         description: Time period for statistics
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *           minimum: 1
 *           maximum: 20
 *         description: Number of top products to return
 *     responses:
 *       200:
 *         description: Top products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   producto_id:
 *                     type: string
 *                   producto_nombre:
 *                     type: string
 *                   cantidad:
 *                     type: number
 *                   revenue:
 *                     type: number
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

    const { period = "today", limit = "5" } = req.query;
    const limitNum = Math.min(parseInt(limit as string, 10), 20);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let startDate = today;

    if (period === "week") {
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "month") {
      startDate = new Date(today);
      startDate.setMonth(startDate.getMonth() - 1);
    }

    // Get completed sales from ventas_app
    const { data: ventasData, error: ventasError } = await supabase
      .from("ventas_app")
      .select("producto_id, producto_nombre, cantidad, precio_total, fecha_retiro")
      .eq("estado", "completado")
      .gte("fecha_retiro", startDate.toISOString());

    if (ventasError) {
      return res
        .status(500)
        .json({ error: "Error al obtener productos más vendidos" });
    }

    // Aggregate by product
    const productMap = new Map<
      string,
      { producto_nombre: string; cantidad: number; revenue: number }
    >();

    ventasData?.forEach((venta) => {
      const existing = productMap.get(venta.producto_id);
      if (existing) {
        existing.cantidad += venta.cantidad;
        existing.revenue += venta.precio_total;
      } else {
        productMap.set(venta.producto_id, {
          producto_nombre: venta.producto_nombre,
          cantidad: venta.cantidad,
          revenue: venta.precio_total,
        });
      }
    });

    // Convert to array and sort by quantity
    const topProducts: TopProduct[] = Array.from(productMap.entries())
      .map(([producto_id, data]) => ({
        producto_id,
        producto_nombre: data.producto_nombre,
        cantidad: data.cantidad,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, limitNum);

    return res.status(200).json(topProducts);
  }
);
