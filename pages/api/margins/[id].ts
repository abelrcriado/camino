import { marginController } from "@/controllers/margin.controller";
import { asyncHandler } from "@/middlewares/error-handler";

export default asyncHandler(async (req, res) => {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      success: false,
      error: "ID de punto de servicio requerido",
    });
  }

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
});
