import type { NextApiRequest, NextApiResponse } from "next";
import { stockRequestController } from "@/controllers/stock-request.controller";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }

  return stockRequestController.cancel(req, res);
}
