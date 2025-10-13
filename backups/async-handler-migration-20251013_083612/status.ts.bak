import type { NextApiRequest, NextApiResponse } from "next";
import { ServiceController } from "@/controllers/service.controller";

const controller = new ServiceController();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`,
    });
  }

  return controller.updateStatus(req, res);
}
