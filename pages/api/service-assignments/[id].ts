import type { NextApiRequest, NextApiResponse } from "next";
import { serviceAssignmentController } from "@/controllers/service-assignment.controller";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET":
        return await serviceAssignmentController.getById(req, res);

      case "PATCH":
      case "PUT":
        return await serviceAssignmentController.update(req, res);

      case "DELETE":
        return await serviceAssignmentController.delete(req, res);

      default:
        res.setHeader("Allow", ["GET", "PATCH", "PUT", "DELETE"]);
        return res.status(405).json({
          success: false,
          error: `Method ${req.method} Not Allowed`,
        });
    }
  } catch (error: any) {
    console.error("Service assignment API error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
