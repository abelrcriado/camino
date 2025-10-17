/**
 * Schemas de validación Zod para Report
 */

import { z } from "zod";
import {
  uuidSchema,
  isoDateSchema,
  longTextSchema,
  jsonSchema,
} from "./common.schema";
import { REPORT_TYPE_VALUES, REPORT_STATUS_VALUES } from "@/shared/constants/enums";

/**
 * Tipo de reporte
 * Usa enum centralizado para consistencia
 */
const reportTypeSchema = z.enum(REPORT_TYPE_VALUES as [string, ...string[]], {
  message:
    "Tipo debe ser: maintenance, incident, usage, financial, inventory o other",
});

/**
 * Estado del reporte
 * Usa enum centralizado para consistencia
 */
const reportStatusSchema = z
  .enum(REPORT_STATUS_VALUES as [string, ...string[]], {
    message:
      "Status debe ser: draft, submitted, under_review, approved o rejected",
  })
  .optional();

/**
 * Schema para crear reporte (POST)
 */
export const createReportSchema = z
  .object({
    type: reportTypeSchema,
    title: z.string().min(5).max(200),
    description: longTextSchema,
    service_point_id: uuidSchema.optional(),
    user_id: uuidSchema,
    status: reportStatusSchema.default("draft"),
    data: jsonSchema,
    generated_at: isoDateSchema.optional(),
  })
  .strict();

/**
 * Schema para actualizar reporte (PUT)
 */
export const updateReportSchema = z
  .object({
    id: uuidSchema,
    title: z.string().min(5).max(200).optional(),
    description: longTextSchema,
    status: reportStatusSchema,
    data: jsonSchema,
  })
  .strict();

/**
 * Schema para eliminar reporte (DELETE)
 */
export const deleteReportSchema = z
  .object({
    id: uuidSchema,
  })
  .strict();

/**
 * Schema para query parameters de GET
 */
export const queryReportSchema = z
  .object({
    type: reportTypeSchema.optional(),
    status: reportStatusSchema.optional(),
    user_id: uuidSchema.optional(),
    service_point_id: uuidSchema.optional(),
  })
  .optional();

// Tipos TypeScript inferidos
export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;
export type DeleteReportInput = z.infer<typeof deleteReportSchema>;
export type QueryReportInput = z.infer<typeof queryReportSchema>;
