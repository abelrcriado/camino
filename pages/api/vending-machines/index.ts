import { NextApiRequest, NextApiResponse } from "next";
import { VendingMachineController } from "@/controllers/vending-machine.controller";
import { asyncHandler } from "@/middlewares/error-handler";

const controller = new VendingMachineController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  await controller.handle(req, res);
});
