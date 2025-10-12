import type { NextApiRequest, NextApiResponse } from "next";
import { serviceAssignmentController } from "@/controllers/service-assignment.controller";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} Not Allowed`,
      });
    }

    return await serviceAssignmentController.unassign(req, res);
  } catch (error: any) {
    console.error("Unassign service API error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
