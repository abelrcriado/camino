import { serviceAssignmentController } from "@/api/controllers/service-assignment.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";

export default asyncHandler(async (req, res) => {
  switch (req.method) {
    case "GET":
      return await serviceAssignmentController.getById(req, res);

    case "PATCH":
    case "PUT":
      return await serviceAssignmentController.update(req, res);

    case "DELETE":
      return await serviceAssignmentController.delete(req, res);

    default:
      res.setHeader("Allow", ["GET", "PATCH", "PUT", "DELETE"]);
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} Not Allowed`,
      });
  }
});
