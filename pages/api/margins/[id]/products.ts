import { marginController } from "@/controllers/margin.controller";
import { asyncHandler } from "@/middlewares/error-handler";
import { ErrorMessages } from "@/constants/error-messages";
import { validateUUID } from "@/middlewares/validate-uuid";

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

  if (req.method !== "PUT") {
    return res.status(405).json({
      success: false,
      error: ErrorMessages.METHOD_NOT_ALLOWED,
    });
  }

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
    id as string,
    product_specific_margins
  );

  return res.status(result.success ? 200 : 400).json(result);
});
