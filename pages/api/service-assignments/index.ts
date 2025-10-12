import type { NextApiRequest, NextApiResponse } from "next";
import { serviceAssignmentController } from "@/controllers/service-assignment.controller";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET":
        return await serviceAssignmentController.list(req, res);

      case "POST":
        return await serviceAssignmentController.create(req, res);

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).json({
          success: false,
          error: `Method ${req.method} Not Allowed`,
        });
    }
  } catch (error: any) {
    console.error("Service assignments API error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
