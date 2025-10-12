/**
 * Controller Layer: VentaApp
 * HTTP request handling for ventas from mobile app
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { VentaAppService } from "../services/venta_app.service";
import { VentaAppRepository } from "../repositories/venta_app.repository";
import type {
  CreateVentaAppDto,
  UpdateVentaAppDto,
  VentaAppFilters,
  ReservarStockDto,
  ConfirmarPagoDto,
  ConfirmarRetiroDto,
  CancelarVentaDto,
  CrearYPagarVentaDto,
} from "../dto/venta_app.dto";
import type { PaginationParams } from "../types/common.types";

// Esquemas de validación Zod centralizados
import {
  createVentaAppSchema,
  updateVentaAppSchema,
  deleteVentaAppSchema,
  reservarStockSchema,
  confirmarPagoSchema,
  confirmarRetiroSchema,
  cancelarVentaSchema,
  crearYPagarVentaSchema,
  queryVentasSchema,
  getVentasActivasSchema,
  getVentasPorExpirarSchema,
} from "../schemas/venta_app.schema";

export class VentaAppController {
  private service: VentaAppService;

  constructor(service?: VentaAppService) {
    this.service = service || new VentaAppService(new VentaAppRepository());
  }

  /**
   * Handler principal que enruta según el método HTTP y action
   */
  async handle(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const startTime = Date.now();

    try {
      switch (req.method) {
        case "GET":
          return await this.getAll(req, res, startTime);
        case "POST":
          return await this.create(req, res, startTime);
        case "PUT":
          return await this.update(req, res, startTime);
        case "DELETE":
          return await this.delete(req, res, startTime);
        default:
          res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
          return res.status(405).json({
            success: false,
            error: `Método ${req.method} no permitido`,
          });
      }
    } catch (error) {
      return this.handleError(error, res, startTime);
    }
  }

  /**
   * GET - Obtener ventas con filtros y paginación
   */
  private async getAll(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const { action } = req.query;

    // === ACCIONES ESPECIALES ===

    // GET /api/ventas-app?action=activas&user_id=xxx
    if (action === "activas") {
      const validation = getVentasActivasSchema.safeParse(req.query);

      if (!validation.success) {
        this.logRequest(req, 400, startTime);
        return res.status(400).json({
          error: "Errores de validación",
          details: validation.error.issues,
        });
      }

      const { user_id } = validation.data;
      const ventas = await this.service.getVentasActivas(user_id);

      this.logRequest(req, 200, startTime);
      return res.status(200).json({
        data: ventas,
      });
    }

    // GET /api/ventas-app?action=por-expirar&minutos=10
    if (action === "por-expirar") {
      const validation = getVentasPorExpirarSchema.safeParse(req.query);

      if (!validation.success) {
        this.logRequest(req, 400, startTime);
        return res.status(400).json({
          error: "Errores de validación",
          details: validation.error.issues,
        });
      }

      const { minutos } = validation.data;
      const ventas = await this.service.getVentasPorExpirar(minutos);

      this.logRequest(req, 200, startTime);
      return res.status(200).json({
        data: ventas,
      });
    }

    // GET /api/ventas-app?action=estadisticas
    if (action === "estadisticas") {
      const estadisticas = await this.service.getEstadisticas();

      this.logRequest(req, 200, startTime);
      return res.status(200).json({
        data: estadisticas,
      });
    }

    // GET /api/ventas-app?action=notificaciones&minutos=5
    if (action === "notificaciones") {
      const minutos = req.query.minutos
        ? parseInt(req.query.minutos as string)
        : 5;
      const notificaciones =
        await this.service.getNotificacionesVentasPorExpirar(minutos);

      this.logRequest(req, 200, startTime);
      return res.status(200).json({
        data: notificaciones,
      });
    }

    // GET /api/ventas-app?action=by-codigo&codigo=ABC123
    if (action === "by-codigo") {
      const { codigo } = req.query;

      if (!codigo || typeof codigo !== "string") {
        this.logRequest(req, 400, startTime);
        return res.status(400).json({
          error: "Código de retiro requerido",
        });
      }

      const venta = await this.service.findByCodigoRetiro(codigo);

      if (!venta) {
        this.logRequest(req, 404, startTime);
        return res.status(404).json({
          error: "Venta no encontrada con el código proporcionado",
        });
      }

      this.logRequest(req, 200, startTime);
      return res.status(200).json({
        data: venta,
      });
    }

    // === QUERY NORMAL CON FILTROS ===

    // Validar query params
    const validation = queryVentasSchema.safeParse(req.query);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const {
      page,
      limit,
      slot_id,
      user_id,
      producto_id,
      estado,
      fecha_desde,
      fecha_hasta,
      precio_min,
      precio_max,
      machine_id,
    } = validation.data;

    // Construir filtros
    const filters: VentaAppFilters = {};
    if (slot_id) filters.slot_id = slot_id;
    if (user_id) filters.user_id = user_id;
    if (producto_id) filters.producto_id = producto_id;
    if (estado) filters.estado = estado;
    if (fecha_desde) filters.fecha_desde = fecha_desde;
    if (fecha_hasta) filters.fecha_hasta = fecha_hasta;
    if (precio_min !== undefined) filters.precio_min = precio_min;
    if (precio_max !== undefined) filters.precio_max = precio_max;
    if (machine_id) filters.machine_id = machine_id;

    // Paginación
    const pagination: PaginationParams = {
      page: page || 1,
      limit: limit || 10,
    };

    // Agregar paginación a filtros usando any para compatibilidad
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filtersWithPagination: any = {
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
    };

    // Obtener ventas (siempre usar la versión full por ahora)
    const result = await this.service.getVentasFull(filtersWithPagination);

    // Calcular pagination metadata
    const totalPages = Math.ceil(result.count / pagination.limit);

    // Headers de caché
    res.setHeader("Cache-Control", "private, max-age=0, must-revalidate");

    this.logRequest(req, 200, startTime);
    return res.status(200).json({
      data: result.data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: result.count,
        totalPages,
      },
    });
  }

  /**
   * POST - Crear nueva venta o ejecutar acciones
   */
  private async create(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const { action } = req.query;

    // === ACCIONES ESPECIALES ===

    // POST /api/ventas-app?action=reservar-stock
    if (action === "reservar-stock") {
      const validation = reservarStockSchema.safeParse(req.body);

      if (!validation.success) {
        this.logRequest(req, 400, startTime);
        return res.status(400).json({
          error: "Errores de validación",
          details: validation.error.issues,
        });
      }

      const dto = validation.data as ReservarStockDto;
      const result = await this.service.reservarStock(dto);

      this.logRequest(req, 200, startTime);
      return res.status(200).json([result]);
    }

    // POST /api/ventas-app?action=confirmar-pago
    if (action === "confirmar-pago") {
      const validation = confirmarPagoSchema.safeParse(req.body);

      if (!validation.success) {
        this.logRequest(req, 400, startTime);
        return res.status(400).json({
          error: "Errores de validación",
          details: validation.error.issues,
        });
      }

      const dto = validation.data as ConfirmarPagoDto;
      const result = await this.service.confirmarPago(dto);

      this.logRequest(req, 200, startTime);
      return res.status(200).json([result]);
    }

    // POST /api/ventas-app?action=confirmar-retiro
    if (action === "confirmar-retiro") {
      const validation = confirmarRetiroSchema.safeParse(req.body);

      if (!validation.success) {
        this.logRequest(req, 400, startTime);
        return res.status(400).json({
          error: "Errores de validación",
          details: validation.error.issues,
        });
      }

      const dto = validation.data as ConfirmarRetiroDto;
      const result = await this.service.confirmarRetiro(dto);

      this.logRequest(req, 200, startTime);
      return res.status(200).json({
        data: result,
      });
    }

    // POST /api/ventas-app?action=cancelar
    if (action === "cancelar") {
      const validation = cancelarVentaSchema.safeParse(req.body);

      if (!validation.success) {
        this.logRequest(req, 400, startTime);
        return res.status(400).json({
          error: "Errores de validación",
          details: validation.error.issues,
        });
      }

      const dto = validation.data as CancelarVentaDto;
      const result = await this.service.cancelarVenta(dto);

      this.logRequest(req, 200, startTime);
      return res.status(200).json({
        data: result,
      });
    }

    // POST /api/ventas-app?action=crear-y-pagar
    if (action === "crear-y-pagar") {
      const validation = crearYPagarVentaSchema.safeParse(req.body);

      if (!validation.success) {
        this.logRequest(req, 400, startTime);
        return res.status(400).json({
          error: "Errores de validación",
          details: validation.error.issues,
        });
      }

      const dto = validation.data as CrearYPagarVentaDto;
      const result = await this.service.crearYPagarVenta(dto);

      this.logRequest(req, 201, startTime);
      return res.status(201).json({
        data: result,
      });
    }

    // POST /api/ventas-app?action=liberar-expirado (ADMIN)
    if (action === "liberar-expirado") {
      const result = await this.service.liberarStockExpirado();

      this.logRequest(req, 200, startTime);
      return res.status(200).json({
        data: result,
      });
    }

    // === CREAR VENTA NORMAL ===

    const validation = createVentaAppSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const ventaData = validation.data as unknown as CreateVentaAppDto;
    const venta = await this.service.createVenta(ventaData);

    this.logRequest(req, 201, startTime);
    return res.status(201).json([venta]);
  }

  /**
   * PUT - Actualizar venta existente
   */
  private async update(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const { id } = req.body;

    if (!id || typeof id !== "string") {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: [{ message: "Venta ID es requerido" }],
      });
    }

    // Validar UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: [{ message: "Formato de UUID inválido" }],
      });
    }

    // Validar datos con schema centralizado
    const validation = updateVentaAppSchema.safeParse({
      ...req.body,
      id,
    });

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const updateData = validation.data as unknown as UpdateVentaAppDto;
    const venta = await this.service.updateVenta(id, updateData);

    this.logRequest(req, 200, startTime);
    return res.status(200).json([venta]);
  }

  /**
   * DELETE - Eliminar venta (solo borradores)
   */
  private async delete(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    // Validar datos con schema centralizado
    const validation = deleteVentaAppSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const { id } = validation.data;

    await this.service.deleteVenta(id);

    this.logRequest(req, 200, startTime);
    return res.status(200).json({
      message: "Venta eliminada exitosamente",
    });
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(
    error: unknown,
    res: NextApiResponse,
    startTime: number
  ): void {
    const duration = Date.now() - startTime;

    console.error("❌ VentaApp Controller Error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`,
    });

    if (error instanceof Error) {
      // Errores de validación
      if (error.message.includes("validación")) {
        return res.status(400).json({
          error: error.message,
        });
      }

      // Errores de not found
      if (error.message.includes("no encontrad")) {
        return res.status(404).json({
          error: error.message,
        });
      }

      // Errores de conflicto (estado inválido, etc.)
      if (
        error.message.includes("estado") ||
        error.message.includes("transición")
      ) {
        return res.status(409).json({
          error: error.message,
        });
      }

      // Error genérico con mensaje
      return res.status(500).json({
        error: error.message,
      });
    }

    // Error desconocido
    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }

  /**
   * Logging de requests
   */
  private logRequest(
    req: NextApiRequest,
    statusCode: number,
    startTime: number
  ): void {
    const duration = Date.now() - startTime;
    const statusEmoji = statusCode >= 400 ? "❌" : "✅";

    console.log(
      `${statusEmoji} ${req.method} ${req.url} - ${statusCode} - ${duration}ms`
    );
  }
}
