import type { NextApiRequest, NextApiResponse } from "next";
import { BookingController } from "@/controllers/booking.controller";
import { asyncHandler } from "@/middlewares/error-handler";
import { ErrorMessages } from "@/constants/error-messages";

const controller = new BookingController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({
      success: false,
      error: ErrorMessages.METHOD_NOT_ALLOWED,
    });
  }

  // Extract booking ID and new times from request
  const { id } = req.query;
  const { start_time, end_time } = req.body;

  // Send to main controller as a regular update
  req.body = { ...req.body, id, start_time, end_time };

  return controller.handle(req, res);
});
