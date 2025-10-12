import { serviceAssignmentController } from "@/controllers/service-assignment.controller";
import { asyncHandler } from "@/middlewares/error-handler";

export default asyncHandler(async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`,
    });
  }

  return await serviceAssignmentController.unassign(req, res);
});
