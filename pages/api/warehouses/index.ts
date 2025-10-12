import type { NextApiRequest, NextApiResponse } from "next";
import { WarehouseController } from "@/controllers/warehouse.controller";

const controller = new WarehouseController();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "GET":
      return controller.getAll(req, res);

    case "POST":
      return controller.create(req, res);

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).json({
        success: false,
        error: `Method ${method} Not Allowed`,
      });
  }
}
