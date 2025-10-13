import type { NextApiRequest, NextApiResponse } from "next";
import { stockRequestController } from "@/controllers/stock-request.controller";
import { asyncHandler } from "@/middlewares/error-handler";


export default asyncHandler(async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { method } = req;

  if (method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }

  return stockRequestController.markAsDelivered(req, res);
});
