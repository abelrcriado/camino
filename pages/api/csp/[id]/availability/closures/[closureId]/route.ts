import { NextRequest } from "next/server";
import { AvailabilityController } from "@/controllers/availability.controller";


const controller = new AvailabilityController();

/**
 * @swagger
 * /api/csp/{id}/availability/closures/{closureId}:
 *   delete:
 *     tags:
 *       - Availability
 *     summary: Eliminar un cierre especial
 *     description: Elimina un cierre especial específico de un CSP
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del CSP
 *       - in: path
 *         name: closureId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del cierre especial
 *     responses:
 *       200:
 *         description: Cierre eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Special closure deleted successfully
 *       500:
 *         description: Error del servidor
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; closureId: string }> }
) {
  return controller.deleteSpecialClosure(req, context);
}

export default DELETE;
