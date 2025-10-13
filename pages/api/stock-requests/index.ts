import type { NextApiRequest, NextApiResponse } from "next";
import { stockRequestController } from "@/controllers/stock-request.controller";
import { asyncHandler } from "@/middlewares/error-handler";
import { ErrorMessages } from "@/constants/error-messages";


export default asyncHandler(async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { method } = req;

  switch (method) {
    case "GET":
      return stockRequestController.list(req, res);

    case "POST":
      return stockRequestController.create(req, res);

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
  }
});
