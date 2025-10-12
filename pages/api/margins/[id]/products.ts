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

  if (req.method !== "PUT") {
    return res.status(405).json({
      success: false,
      error: `Método ${req.method} no permitido`,
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
    id,
    product_specific_margins
  );

  return res.status(result.success ? 200 : 400).json(result);
});
