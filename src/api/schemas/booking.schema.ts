/**
 * Schemas de validación Zod para Booking
 *
 * Zod proporciona:
 * - Type-safety completa en TypeScript
 * - Validaciones más expresivas y claras
 * - Mensajes de error personalizados
 * - Inferencia automática de tipos
 * - Composición de schemas
 */

import { z } from "zod";
import { BOOKING_STATUS_VALUES } from "@/shared/constants/enums";

/**
 * Schema para UUID v4
 * Validación más estricta que regex manual
 */
const uuidSchema = z.string().uuid({
  message: "Debe ser un UUID válido",
});

/**
 * Schema para fechas ISO 8601
 * Acepta strings y los valida como fechas válidas
 */
const isoDateSchema = z.string().datetime({
  message: "Debe ser una fecha en formato ISO 8601",
});

/**
 * Schema para el status de booking
 * Usa enum centralizado para consistencia
 */
const bookingStatusSchema = z.enum(
  BOOKING_STATUS_VALUES as [string, ...string[]],
  {
    message:
      "Status debe ser: pending, confirmed, cancelled, completed o no_show",
  }
);

/**
 * Schema para crear un nuevo booking (POST)
 * Todos los campos requeridos excepto status (default: 'pending')
 */
export const createBookingSchema = z
  .object({
    user_id: uuidSchema,
    service_point_id: uuidSchema.optional(),
    workshop_id: uuidSchema.optional(),
    service_type: z.string().min(1, "service_type es requerido"),
    start_time: isoDateSchema,
    end_time: isoDateSchema,
    status: bookingStatusSchema.optional().default("pending"),
    notes: z.string().optional(),
    estimated_cost: z.number().int().nonnegative().optional(), // in cents
    payment_status: z
      .enum(["pending", "paid", "refunded"])
      .optional()
      .default("pending"),
    bike_details: z.record(z.string(), z.unknown()).optional(),
    service_details: z.record(z.string(), z.unknown()).optional(),
  })
  .strict()
  .refine(
    (data) => {
      // Validación personalizada: end_time debe ser después de start_time
      const start = new Date(data.start_time);
      const end = new Date(data.end_time);
      return end > start;
    },
    {
      message: "end_time debe ser posterior a start_time",
      path: ["end_time"],
    }
  )
  .refine(
    (data) => {
      // Al menos uno de service_point_id o workshop_id debe estar presente
      return data.service_point_id || data.workshop_id;
    },
    {
      message: "Debe especificar service_point_id o workshop_id",
      path: ["service_point_id"],
    }
  );

/**
 * Schema para actualizar un booking (PUT)
 * El ID es requerido, los demás campos opcionales
 */
export const updateBookingSchema = z
  .object({
    id: uuidSchema,
    user_id: uuidSchema.optional(),
    service_point_id: uuidSchema.optional(),
    workshop_id: uuidSchema.optional(),
    service_type: z.string().min(1).optional(),
    start_time: isoDateSchema.optional(),
    end_time: isoDateSchema.optional(),
    status: bookingStatusSchema.optional(),
    notes: z.string().optional(),
    estimated_cost: z.number().int().nonnegative().optional(), // in cents
    actual_cost: z.number().int().nonnegative().optional(), // in cents
    payment_status: z.enum(["pending", "paid", "refunded"]).optional(),
    bike_details: z.record(z.string(), z.unknown()).optional(),
    service_details: z.record(z.string(), z.unknown()).optional(),
  })
  .strict()
  .refine(
    (data) => {
      // Solo validar fechas si ambas están presentes
      if (data.start_time && data.end_time) {
        const start = new Date(data.start_time);
        const end = new Date(data.end_time);
        return end > start;
      }
      return true;
    },
    {
      message: "end_time debe ser posterior a start_time",
      path: ["end_time"],
    }
  );

/**
 * Schema para eliminar un booking (DELETE)
 * Solo requiere el ID
 */
export const deleteBookingSchema = z
  .object({
    id: uuidSchema,
  })
  .strict();

/**
 * Schema para query parameters de GET
 * Todos opcionales para filtrado
 */
export const queryBookingSchema = z
  .object({
    page: z.string().regex(/^\d+$/).optional().transform(Number),
    limit: z.string().regex(/^\d+$/).optional().transform(Number),
    user_id: uuidSchema.optional(),
    service_point_id: uuidSchema.optional(),
    workshop_id: uuidSchema.optional(),
    service_type: z.string().optional(),
    status: bookingStatusSchema.optional(),
    payment_status: z.enum(["pending", "paid", "refunded"]).optional(),
    start_date: isoDateSchema.optional(),
    end_date: isoDateSchema.optional(),
  })
  .optional();

// Tipos TypeScript inferidos automáticamente desde los schemas
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type DeleteBookingInput = z.infer<typeof deleteBookingSchema>;
export type QueryBookingInput = z.infer<typeof queryBookingSchema>;
