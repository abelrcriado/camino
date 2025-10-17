import { marginController } from "@/api/controllers/margin.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";
import { ErrorMessages } from "@/shared/constants/error-messages";
import { validateUUID } from "@/api/middlewares/validate-uuid";

export default asyncHandler(async (req, res) => {
  const { id } = req.query;

  // Validar UUID usando utilidad centralizada
  const validationError = validateUUID(id, "punto de servicio");
  if (validationError) {
    return res.status(400).json({
      success: false,
      error: validationError,
    });
  }

  switch (req.method) {
    case "GET": {
      const result = await marginController.getMarginConfig(id as string);
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
        id as string,
        parseFloat(general_margin_percentage)
      );

      return res.status(result.success ? 200 : 400).json(result);
    }

    default:
      return res.status(405).json({
        success: false,
        error: ErrorMessages.METHOD_NOT_ALLOWED,
      });
  }
});
