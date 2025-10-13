// Controller para manejo de requests HTTP de Booking
import logger from "@/config/logger";
import type { NextApiRequest, NextApiResponse } from "next";
import { BookingService } from "../services/booking.service";
import type { CreateBookingDto, UpdateBookingDto } from "../dto/booking.dto";
import type { PaginationParams } from "../types/common.types";

// Esquemas de validación Zod centralizados
import {
  createBookingSchema,
  updateBookingSchema,
  deleteBookingSchema,
} from "../schemas/booking.schema";

export class BookingController {
  private service: BookingService;

  constructor(service?: BookingService) {
    this.service = service || new BookingService();
  }

  /**
   * Handler principal que enruta según el método HTTP
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
            error: `Method ${req.method} Not Allowed`,
          });
      }
    } catch (error) {
      return this.handleError(error, res, startTime);
    }
  }

  /**
   * GET - Obtener bookings con filtros y paginación
   */
  private async getAll(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const {
      page = "1",
      limit = "10",
      user_id,
      service_point_id,
      workshop_id,
      service_type,
      status,
      payment_status,
      start_date,
      end_date,
      action,
    } = req.query;

    // Manejar acciones especiales
    if (action === "upcoming") {
      const days = parseInt(req.query.days as string) || 7;
      const bookings = await this.service.findUpcomingBookings(days);

      this.logRequest(req, 200, startTime);
      return res.status(200).json({
        data: bookings,
      });
    }

    if (action === "active") {
      const bookings = await this.service.findActiveBookings();

      this.logRequest(req, 200, startTime);
      return res.status(200).json({
        data: bookings,
      });
    }

    if (action === "user-status" && user_id && status) {
      const bookings = await this.service.findByUserAndStatus(
        user_id as string,
        status as string
      );

      this.logRequest(req, 200, startTime);
      return res.status(200).json({
        data: bookings,
      });
    }

    // Construir filtros
    const filters: Record<string, string | undefined> = {};
    if (user_id) filters.user_id = user_id as string;
    if (service_point_id) filters.service_point_id = service_point_id as string;
    if (workshop_id) filters.workshop_id = workshop_id as string;
    if (service_type) filters.service_type = service_type as string;
    if (status) filters.status = status as string;
    if (payment_status) filters.payment_status = payment_status as string;
    if (start_date) filters.start_date = start_date as string;
    if (end_date) filters.end_date = end_date as string;

    // Paginación
    const pagination: PaginationParams = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };

    const result = await this.service.findAllBookings(filters, pagination);

    // Headers de caché
    res.setHeader("Cache-Control", "private, max-age=0, must-revalidate");

    this.logRequest(req, 200, startTime);
    return res.status(200).json({
      data: result.data,
      pagination: result.pagination,
    });
  }

  /**
   * POST - Crear nuevo booking
   */
  private async create(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    // Validar datos con Zod
    const validation = createBookingSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const bookingData = validation.data as unknown as CreateBookingDto;
    const booking = await this.service.createBooking(bookingData);

    this.logRequest(req, 201, startTime);
    return res.status(201).json([booking]);
  }

  /**
   * PUT - Actualizar booking existente
   */
  private async update(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const { action } = req.query;
    const { id } = req.body;

    if (!id || typeof id !== "string") {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: [{ message: "Booking ID is required" }],
      });
    }

    // Validar UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: [{ message: "Invalid UUID format" }],
      });
    }

    // Manejar acciones especiales
    if (action === "cancel") {
      const booking = await this.service.cancelBooking(id);
      this.logRequest(req, 200, startTime);
      return res.status(200).json([booking]);
    }

    if (action === "confirm") {
      const booking = await this.service.confirmBooking(id);
      this.logRequest(req, 200, startTime);
      return res.status(200).json([booking]);
    }

    if (action === "complete") {
      const actualCost = req.body.actual_cost
        ? parseFloat(req.body.actual_cost)
        : undefined;
      const booking = await this.service.completeBooking(id, actualCost);
      this.logRequest(req, 200, startTime);
      return res.status(200).json([booking]);
    }

    // Actualización normal
    const validation = updateBookingSchema.safeParse({
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

    const updateData = validation.data as unknown as UpdateBookingDto;
    const booking = await this.service.updateBooking(updateData);

    this.logRequest(req, 200, startTime);
    return res.status(200).json([booking]);
  }

  /**
   * DELETE - Eliminar booking
   */
  private async delete(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    // Validar datos con schema centralizado
    const validation = deleteBookingSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const { id } = validation.data;
    await this.service.delete(id);

    this.logRequest(req, 204, startTime);
    res.status(204).end();
  }

  /**
   * Manejo de errores centralizado
   */
  private handleError(
    error: unknown,
    res: NextApiResponse,
    startTime: number
  ): void {
    logger.error("[BookingController] Error:", error);

    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    logger.info(
      JSON.stringify({
        level: "error",
        message: errorMessage,
        duration,
        timestamp: new Date().toISOString(),
      })
    );

    if (errorMessage.includes("not found")) {
      return res.status(404).json({
        error: errorMessage,
      });
    }

    if (
      errorMessage.includes("Validation") ||
      errorMessage.includes("Invalid") ||
      errorMessage.includes("must be") ||
      errorMessage.includes("Cannot create") ||
      errorMessage.includes("Either")
    ) {
      return res.status(400).json({
        error: errorMessage,
      });
    }

    return res.status(500).json({
      error: "Internal server error",
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
    logger.info(
      JSON.stringify({
        level: "info",
        method: req.method,
        path: "/api/booking",
        statusCode,
        duration,
        timestamp: new Date().toISOString(),
      })
    );
  }
}
