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

  if (req.method !== "PUT") {
    return res.status(405).json({
      success: false,
      error: `Método ${req.method} no permitido`,
    });
  }

  try {
    const { product_specific_margins } = req.body;

    if (
      !product_specific_margins ||
      typeof product_specific_margins !== "object"
    ) {
      return res.status(400).json({
        success: false,
        error: "product_specific_margins es requerido y debe ser un objeto",
      });
    }

    const result = await marginController.updateProductMargins(
      id,
      product_specific_margins
    );

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    console.error("Error in product margins API:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Error interno del servidor",
    });
  }
}
