// Endpoint para servir el JSON de OpenAPI/Swagger
import type { NextApiRequest, NextApiResponse } from "next";
import { swaggerSpec } from "../../src/config/swagger";
import { asyncHandler } from "@/api/middlewares/error-handler";

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).json(swaggerSpec);
});
