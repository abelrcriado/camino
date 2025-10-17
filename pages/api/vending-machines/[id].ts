import type { NextApiRequest, NextApiResponse } from "next";
import { VendingMachineController } from "@/api/controllers/vending-machine.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";

const controller = new VendingMachineController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // Extract id from URL params and add to query
  const { id } = req.query;
  req.query.id = id;

  return controller.handle(req, res);
});
