/**
 * Schemas de validación Zod para Payment
 */

import { z } from "zod";
import { uuidSchema, isoDateSchema } from "./common.schema";
import {
  PAYMENT_STATUS_VALUES,
  PAYMENT_METHOD_VALUES,
} from "@/shared/constants/enums";

/**
 * Estado del pago (Alineado con Stripe Payment Intent)
 */
const paymentStatusSchema = z.enum(
  PAYMENT_STATUS_VALUES as [string, ...string[]],
  {
    message:
      "Status debe ser: pending, processing, succeeded, failed, canceled, refunded, partially_refunded",
  }
);

/**
 * Método de pago (Alineado con DTO)
 */
const paymentMethodSchema = z.enum(
  PAYMENT_METHOD_VALUES as [string, ...string[]],
  {
    message: "Método de pago debe ser: card, bank_transfer, wallet, cash",
  }
);

/**
 * Schema para crear un pago (POST) - CreatePaymentDto
 */
export const createPaymentSchema = z
  .object({
    user_id: uuidSchema,
    booking_id: uuidSchema,
    service_point_id: uuidSchema,
    amount: z.number().positive("Amount debe ser positivo"),
    currency: z
      .string()
      .length(3, "Currency debe ser código de 3 letras (ej: eur, usd)")
      .toLowerCase()
      .default("eur"),
    payment_method: paymentMethodSchema.optional().default("card"),
    description: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

/**
 * Schema para actualizar un pago (PUT) - UpdatePaymentDto
 */
export const updatePaymentSchema = z
  .object({
    id: uuidSchema,
    status: paymentStatusSchema.optional(),
    stripe_payment_intent_id: z.string().optional(),
    stripe_charge_id: z.string().optional(),
    paid_at: isoDateSchema.optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

/**
 * Schema para eliminar un pago (DELETE)
 */
export const deletePaymentSchema = z
  .object({
    id: uuidSchema,
  })
  .strict();

/**
 * Schema para query parameters de GET
 */
export const queryPaymentSchema = z
  .object({
    user_id: uuidSchema.optional(),
    booking_id: uuidSchema.optional(),
    status: paymentStatusSchema.optional(),
  })
  .optional();

// Tipos TypeScript inferidos
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type DeletePaymentInput = z.infer<typeof deletePaymentSchema>;
export type QueryPaymentInput = z.infer<typeof queryPaymentSchema>;
