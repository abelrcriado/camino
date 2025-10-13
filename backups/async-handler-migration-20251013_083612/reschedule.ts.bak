import type { NextApiRequest, NextApiResponse } from "next";
import { BookingController } from "@/controllers/booking.controller";

const controller = new BookingController();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`,
    });
  }

  // Extract booking ID and new times from request
  const { id } = req.query;
  const { start_time, end_time } = req.body;

  // Send to main controller as a regular update
  req.body = { ...req.body, id, start_time, end_time };

  return controller.handle(req, res);
}
