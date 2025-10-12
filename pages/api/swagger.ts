// Endpoint para servir el JSON de OpenAPI/Swagger
import type { NextApiRequest, NextApiResponse } from "next";
import { swaggerSpec } from "../../src/config/swagger";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "application/json");
  res.status(200).json(swaggerSpec);
}
