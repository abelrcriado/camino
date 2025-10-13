import type { NextApiRequest, NextApiResponse } from "next";
import { BookingController } from "@/controllers/booking.controller";
import { asyncHandler } from "@/middlewares/error-handler";

const controller = new BookingController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`,
    });
  }

  // Extract booking ID from query params
  const { id } = req.query;

  // Redirect to main controller with action=confirm
  req.query.action = "confirm";
  req.body = { ...req.body, id };

  return controller.handle(req, res);
});
