import type { NextApiRequest, NextApiResponse } from "next";
import { stockRequestController } from "@/controllers/stock-request.controller";
import { asyncHandler } from "@/middlewares/error-handler";
import { ErrorMessages } from "@/constants/error-messages";


export default asyncHandler(async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { method } = req;

  if (method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
  }

  return stockRequestController.cancel(req, res);
});
