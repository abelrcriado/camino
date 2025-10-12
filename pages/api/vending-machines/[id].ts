import type { NextApiRequest, NextApiResponse } from "next";
import { VendingMachineController } from "@/controllers/vending-machine.controller";

const controller = new VendingMachineController();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Extract id from URL params and add to query
  const { id } = req.query;
  req.query.id = id;

  return controller.handle(req, res);
}
