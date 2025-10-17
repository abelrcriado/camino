// CRUD endpoints para VentaApp - Clean Architecture
import type { NextApiRequest, NextApiResponse} from "next";
import { VentaAppController } from "@/api/controllers/venta_app.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";

/**
 * @swagger
 * /api/ventas-app:
 *   get:
 *     summary: Listar ventas de app móvil con paginación y filtros
 *     description: Obtiene una lista paginada de ventas realizadas desde la app móvil con opciones de filtrado avanzado
 *     tags: [VentasApp]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Cantidad de resultados por página
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de usuario
 *       - in: query
 *         name: slot_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de slot
 *       - in: query
 *         name: machine_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de máquina expendedora
 *       - in: query
 *         name: producto_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de producto
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [borrador, reservado, pagado, completado, cancelado, expirado]
 *         description: Filtrar por estado de la venta
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtrar ventas desde esta fecha
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtrar ventas hasta esta fecha
 *       - in: query
 *         name: precio_min
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Precio mínimo en céntimos
 *       - in: query
 *         name: precio_max
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Precio máximo en céntimos
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [activas, por-expirar, estadisticas, notificaciones, by-codigo]
 *         description: Acción especial (activas, por-expirar, estadisticas, notificaciones, by-codigo)
 *       - in: query
 *         name: minutos
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 1440
 *         description: Para action=por-expirar o notificaciones, minutos restantes
 *       - in: query
 *         name: codigo
 *         schema:
 *           type: string
 *           pattern: '^[A-Z0-9]{6,10}$'
 *         description: Para action=by-codigo, código de retiro a buscar
 *     responses:
 *       200:
 *         description: Lista de ventas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VentaApp'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Venta no encontrada (solo para action=by-codigo)
 *       500:
 *         description: Error interno del servidor
 *
 *   post:
 *     summary: Crear una nueva venta o ejecutar acciones
 *     description: Crea una nueva venta desde app móvil o ejecuta operaciones sobre ventas existentes
 *     tags: [VentasApp]
 *     parameters:
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [reservar-stock, confirmar-pago, confirmar-retiro, cancelar, crear-y-pagar, liberar-expirado]
 *         description: Acción a ejecutar (opcional para creación normal)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/CreateVentaAppDto'
 *               - $ref: '#/components/schemas/ReservarStockDto'
 *               - $ref: '#/components/schemas/ConfirmarPagoDto'
 *               - $ref: '#/components/schemas/ConfirmarRetiroDto'
 *               - $ref: '#/components/schemas/CancelarVentaDto'
 *               - $ref: '#/components/schemas/CrearYPagarVentaDto'
 *     responses:
 *       200:
 *         description: Operación ejecutada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ReservarStockResponse'
 *                 - $ref: '#/components/schemas/ConfirmarPagoResponse'
 *                 - $ref: '#/components/schemas/ConfirmarRetiroResponse'
 *                 - $ref: '#/components/schemas/CancelarVentaResponse'
 *                 - $ref: '#/components/schemas/LiberarStockExpiradoResponse'
 *       201:
 *         description: Venta creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VentaApp'
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Venta no encontrada
 *       409:
 *         description: Conflicto (transición de estado inválida)
 *       500:
 *         description: Error interno del servidor
 *
 *   put:
 *     summary: Actualizar una venta existente
 *     description: Actualiza metadata y notas de una venta (solo campos editables)
 *     tags: [VentasApp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               notas:
 *                 type: string
 *                 maxLength: 500
 *               metadata:
 *                 type: object
 *                 additionalProperties: true
 *     responses:
 *       200:
 *         description: Venta actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VentaApp'
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Venta no encontrada
 *       500:
 *         description: Error interno del servidor
 *
 *   delete:
 *     summary: Eliminar una venta
 *     description: Elimina una venta en estado borrador (sin stock reservado)
 *     tags: [VentasApp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Venta eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Error de validación o venta no es borrador
 *       404:
 *         description: Venta no encontrada
 *       500:
 *         description: Error interno del servidor
 *
 * components:
 *   schemas:
 *     VentaApp:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         slot_id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         payment_id:
 *           type: string
 *           format: uuid
 *         producto_id:
 *           type: string
 *           format: uuid
 *         producto_nombre:
 *           type: string
 *         producto_sku:
 *           type: string
 *         cantidad:
 *           type: integer
 *           minimum: 1
 *         precio_unitario:
 *           type: integer
 *           description: Precio en céntimos
 *         precio_total:
 *           type: integer
 *           description: Precio total en céntimos
 *         estado:
 *           type: string
 *           enum: [borrador, reservado, pagado, completado, cancelado, expirado]
 *         codigo_retiro:
 *           type: string
 *           pattern: '^[A-Z0-9]{6,10}$'
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *         fecha_reserva:
 *           type: string
 *           format: date-time
 *         fecha_pago:
 *           type: string
 *           format: date-time
 *         fecha_expiracion:
 *           type: string
 *           format: date-time
 *         fecha_retiro:
 *           type: string
 *           format: date-time
 *         fecha_cancelacion:
 *           type: string
 *           format: date-time
 *         notas:
 *           type: string
 *         metadata:
 *           type: object
 *           additionalProperties: true
 *
 *     CreateVentaAppDto:
 *       type: object
 *       required:
 *         - slot_id
 *         - producto_id
 *       properties:
 *         slot_id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         producto_id:
 *           type: string
 *           format: uuid
 *         cantidad:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 1
 *         metadata:
 *           type: object
 *           additionalProperties: true
 *
 *     ReservarStockDto:
 *       type: object
 *       required:
 *         - venta_id
 *       properties:
 *         venta_id:
 *           type: string
 *           format: uuid
 *
 *     ReservarStockResponse:
 *       type: object
 *       properties:
 *         venta_id:
 *           type: string
 *           format: uuid
 *         estado:
 *           type: string
 *           enum: [reservado]
 *         fecha_reserva:
 *           type: string
 *           format: date-time
 *
 *     ConfirmarPagoDto:
 *       type: object
 *       required:
 *         - venta_id
 *         - payment_id
 *       properties:
 *         venta_id:
 *           type: string
 *           format: uuid
 *         payment_id:
 *           type: string
 *           format: uuid
 *         tiempo_expiracion_minutos:
 *           type: integer
 *           minimum: 1
 *           maximum: 1440
 *           default: 60
 *
 *     ConfirmarPagoResponse:
 *       type: object
 *       properties:
 *         venta_id:
 *           type: string
 *           format: uuid
 *         estado:
 *           type: string
 *           enum: [pagado]
 *         codigo_retiro:
 *           type: string
 *           pattern: '^[A-Z0-9]{6,10}$'
 *         fecha_pago:
 *           type: string
 *           format: date-time
 *         fecha_expiracion:
 *           type: string
 *           format: date-time
 *
 *     ConfirmarRetiroDto:
 *       type: object
 *       required:
 *         - venta_id
 *         - codigo_retiro
 *       properties:
 *         venta_id:
 *           type: string
 *           format: uuid
 *         codigo_retiro:
 *           type: string
 *           pattern: '^[A-Z0-9]{6,10}$'
 *
 *     ConfirmarRetiroResponse:
 *       type: object
 *       properties:
 *         venta_id:
 *           type: string
 *           format: uuid
 *         estado:
 *           type: string
 *           enum: [completado]
 *         fecha_retiro:
 *           type: string
 *           format: date-time
 *
 *     CancelarVentaDto:
 *       type: object
 *       required:
 *         - venta_id
 *       properties:
 *         venta_id:
 *           type: string
 *           format: uuid
 *         motivo:
 *           type: string
 *           maxLength: 500
 *
 *     CancelarVentaResponse:
 *       type: object
 *       properties:
 *         venta_id:
 *           type: string
 *           format: uuid
 *         estado:
 *           type: string
 *           enum: [cancelado]
 *         stock_liberado:
 *           type: boolean
 *         fecha_cancelacion:
 *           type: string
 *           format: date-time
 *
 *     CrearYPagarVentaDto:
 *       type: object
 *       required:
 *         - slot_id
 *         - producto_id
 *         - payment_id
 *       properties:
 *         slot_id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         producto_id:
 *           type: string
 *           format: uuid
 *         cantidad:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 1
 *         payment_id:
 *           type: string
 *           format: uuid
 *         tiempo_expiracion_minutos:
 *           type: integer
 *           minimum: 1
 *           maximum: 1440
 *           default: 60
 *         metadata:
 *           type: object
 *           additionalProperties: true
 *
 *     LiberarStockExpiradoResponse:
 *       type: object
 *       properties:
 *         ventas_expiradas:
 *           type: integer
 *         stock_liberado:
 *           type: integer
 */
export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const controller = new VentaAppController();
  return controller.handle(req, res);
});
