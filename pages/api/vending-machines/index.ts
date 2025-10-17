import { NextApiRequest, NextApiResponse } from "next";
import { VendingMachineController } from "@/api/controllers/vending-machine.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";

const controller = new VendingMachineController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  await controller.handle(req, res);
});
