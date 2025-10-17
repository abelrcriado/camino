/**
 * API Route: /api/service-points/[id]
 * GET/PUT/DELETE un service point específico
 */

import { NextApiRequest, NextApiResponse } from "next";
import { ServicePointController } from "@/api/controllers/service-point.controller";
import { ServicePointService } from "@/api/services/service-point.service";
import { ServicePointRepository } from "@/api/repositories/service-point.repository";
import { asyncHandler } from "@/api/middlewares/error-handler";

// Inicializar dependencias
const repository = new ServicePointRepository();
const service = new ServicePointService(repository);
const controller = new ServicePointController(service);

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  return await controller.handle(req, res);
});
