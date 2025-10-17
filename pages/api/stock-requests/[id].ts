import type { NextApiRequest, NextApiResponse } from "next";
import { stockRequestController } from "@/api/controllers/stock-request.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";
import { ErrorMessages } from "@/shared/constants/error-messages";


export default asyncHandler(async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { method } = req;

  switch (method) {
    case "GET":
      return stockRequestController.getById(req, res);

    default:
      res.setHeader("Allow", ["GET"]);
      return res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
  }
});
