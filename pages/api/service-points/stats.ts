/**
 * API Route: /api/service-points/stats
 * Estadísticas de toda la red
 */

import { NextApiRequest, NextApiResponse } from "next";
import { ServicePointController } from "../../../src/controllers/service-point.controller";
import { ServicePointService } from "../../../src/services/service-point.service";
import { ServicePointRepository } from "../../../src/repositories/service-point.repository";

// Inicializar dependencias
const repository = new ServicePointRepository();
const service = new ServicePointService(repository);
const controller = new ServicePointController(service);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return await controller.handle(req, res);
}
