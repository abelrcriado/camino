import type { NextApiRequest, NextApiResponse } from "next";
import { BookingController } from "@/api/controllers/booking.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";

const controller = new BookingController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  return controller.handle(req, res);
});
