import type { NextApiRequest, NextApiResponse } from "next";
import { BookingController } from "@/api/controllers/booking.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";
import { ErrorMessages } from "@/shared/constants/error-messages";

const controller = new BookingController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({
      success: false,
      error: ErrorMessages.METHOD_NOT_ALLOWED,
    });
  }

  // Extract booking ID from query params
  const { id } = req.query;

  // Redirect to main controller with action=cancel
  req.query.action = "cancel";
  req.body = { ...req.body, id };

  return controller.handle(req, res);
});
