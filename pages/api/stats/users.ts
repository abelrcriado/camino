/**
 * API Route: /api/stats/users
 * Method: GET - User statistics
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

interface UserStats {
  active: number;
  newThisWeek: number;
  total: number;
}

/**
 * @swagger
 * /api/stats/users:
 *   get:
 *     summary: Get user statistics
 *     description: Returns user statistics including active, new, and total users
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 active:
 *                   type: number
 *                   description: Number of active users today
 *                 newThisWeek:
 *                   type: number
 *                   description: Number of new users this week
 *                 total:
 *                   type: number
 *                   description: Total number of registered users
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

    // Get all users
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, created_at, last_login");

    if (usersError) {
      return res
        .status(500)
        .json({ error: "Error al obtener estadísticas de usuarios" });
    }

    let activeCount = 0;
    let newThisWeekCount = 0;
    const totalCount = usersData?.length || 0;

    usersData?.forEach((user) => {
      // Count users active today (logged in today)
      if (user.last_login) {
        const lastLogin = new Date(user.last_login);
        if (lastLogin >= today) {
          activeCount++;
        }
      }

      // Count new users this week
      const createdAt = new Date(user.created_at);
      if (createdAt >= weekAgo) {
        newThisWeekCount++;
      }
    });

    const stats: UserStats = {
      active: activeCount,
      newThisWeek: newThisWeekCount,
      total: totalCount,
    };

    return res.status(200).json(stats);
  }
);
