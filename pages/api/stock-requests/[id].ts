import type { NextApiRequest, NextApiResponse } from "next";
import { stockRequestController } from "@/controllers/stock-request.controller";
import { asyncHandler } from "@/middlewares/error-handler";


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
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
});
