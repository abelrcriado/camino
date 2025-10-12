import { serviceAssignmentController } from "@/controllers/service-assignment.controller";
import { asyncHandler } from "@/middlewares/error-handler";

export default asyncHandler(async (req, res) => {
  switch (req.method) {
    case "GET":
      return await serviceAssignmentController.list(req, res);

    case "POST":
      return await serviceAssignmentController.create(req, res);

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} Not Allowed`,
      });
  }
});
