// Endpoint para estadísticas de transacciones de vending machines
import type { NextApiRequest, NextApiResponse } from "next";
import { VendingTransactionController } from "@/controllers/vending_transaction.controller";
import { asyncHandler } from "@/middlewares/error-handler";

/**
 * @swagger
 * /api/vending-transactions/stats:
 *   get:
 *     summary: Obtener estadísticas de ventas
 *     description: Obtiene estadísticas de transacciones con filtros opcionales
 *     tags: [Vending Transactions]
 *     parameters:
 *       - in: query
 *         name: machine_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por máquina
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha inicio (ISO 8601)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha fin (ISO 8601)
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, year, all]
 *         description: Periodo predefinido
 *     responses:
 *       200:
 *         description: Estadísticas de ventas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     revenue_total:
 *                       type: integer
 *                       description: Revenue total en céntimos
 *                     num_transactions:
 *                       type: integer
 *                       description: Número de transacciones
 *                     cantidad_total:
 *                       type: integer
 *                       description: Cantidad total de productos vendidos
 *                     revenue_promedio:
 *                       type: integer
 *                       description: Revenue promedio por transacción en céntimos
 *                     top_products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           producto_id:
 *                             type: string
 *                             format: uuid
 *                           producto_nombre:
 *                             type: string
 *                           cantidad_vendida:
 *                             type: integer
 *                           revenue:
 *                             type: integer
 *                             description: Revenue en céntimos
 *                     by_metodo_pago:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           metodo_pago:
 *                             type: string
 *                           num_transactions:
 *                             type: integer
 *                           revenue:
 *                             type: integer
 *                     by_machine:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           machine_id:
 *                             type: string
 *                             format: uuid
 *                           machine_name:
 *                             type: string
 *                           num_transactions:
 *                             type: integer
 *                           revenue:
 *                             type: integer
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 */
export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // Añadir action=stats al query para que el controller lo maneje
  req.query.action = "stats";
  
  const controller = new VendingTransactionController();
  return controller.handle(req, res);
});
