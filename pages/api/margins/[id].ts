import { NextApiRequest, NextApiResponse } from "next";
import { marginController } from "@/controllers/margin.controller";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      success: false,
      error: "ID de punto de servicio requerido",
    });
  }

  try {
    switch (req.method) {
      case "GET": {
        const result = await marginController.getMarginConfig(id);
        return res.status(result.success ? 200 : 400).json(result);
      }

      case "PUT": {
        const { general_margin_percentage } = req.body;

        if (general_margin_percentage === undefined) {
          return res.status(400).json({
            success: false,
            error: "general_margin_percentage es requerido",
          });
        }

        const result = await marginController.upsertGeneralMargin(
          id,
          parseFloat(general_margin_percentage)
        );

        return res.status(result.success ? 200 : 400).json(result);
      }

      default:
        return res.status(405).json({
          success: false,
          error: `Método ${req.method} no permitido`,
        });
    }
  } catch (error: any) {
    console.error("Error in margins API:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Error interno del servidor",
    });
  }
}
