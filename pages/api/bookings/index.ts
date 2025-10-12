import type { NextApiRequest, NextApiResponse } from "next";
import { BookingController } from "@/controllers/booking.controller";

const controller = new BookingController();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return controller.handle(req, res);
}
