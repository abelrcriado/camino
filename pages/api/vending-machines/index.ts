import { NextApiRequest, NextApiResponse } from "next";
import { VendingMachineController } from "@/controllers/vending-machine.controller";

const controller = new VendingMachineController();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await controller.handle(req, res);
}
