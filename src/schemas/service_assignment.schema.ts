/**
 * Zod schemas para validación de ServiceAssignment
 */

import { z } from "zod";

// UUID schema helper
const uuidSchema = z.string().uuid({
  message: "Debe ser un UUID válido",
});

// Schema para crear nueva asignación
export const createServiceAssignmentSchema = z.object({
  service_id: uuidSchema,
  service_point_id: uuidSchema,
  is_active: z.boolean().optional().default(true),
  priority: z
    .number()
    .int({ message: "priority debe ser un entero" })
    .min(0, { message: "priority debe ser mayor o igual a 0" })
    .max(100, { message: "priority debe ser menor o igual a 100" })
    .optional()
    .default(0),
  configuracion: z.record(z.string(), z.unknown()).optional().default({}),
});

export type CreateServiceAssignmentInput = z.infer<
  typeof createServiceAssignmentSchema
>;

// Schema para actualizar asignación existente
export const updateServiceAssignmentSchema = z
  .object({
    id: uuidSchema,
    service_id: uuidSchema.optional(),
    service_point_id: uuidSchema.optional(),
    is_active: z.boolean().optional(),
    priority: z
      .number()
      .int({ message: "priority debe ser un entero" })
      .min(0, { message: "priority debe ser mayor o igual a 0" })
      .max(100, { message: "priority debe ser menor o igual a 100" })
      .optional(),
    configuracion: z.record(z.string(), z.unknown()).optional(),
  })
  .refine(
    (data) => {
      // Debe tener al menos un campo además del id
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = data;
      return Object.keys(rest).length > 0;
    },
    {
      message:
        "Debe proporcionar al menos un campo para actualizar además del id",
    }
  );

export type UpdateServiceAssignmentInput = z.infer<
  typeof updateServiceAssignmentSchema
>;

// Schema para eliminar asignación
export const deleteServiceAssignmentSchema = z.object({
  id: uuidSchema,
});

export type DeleteServiceAssignmentInput = z.infer<
  typeof deleteServiceAssignmentSchema
>;

// Schema para queries/filtros
export const queryServiceAssignmentSchema = z.object({
  service_id: uuidSchema.optional(),
  service_point_id: uuidSchema.optional(),
  is_active: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  priority_min: z
    .string()
    .regex(/^\d+$/, { message: "priority_min debe ser un número entero" })
    .transform((val) => parseInt(val, 10))
    .optional(),
  priority_max: z
    .string()
    .regex(/^\d+$/, { message: "priority_max debe ser un número entero" })
    .transform((val) => parseInt(val, 10))
    .optional(),
  page: z
    .string()
    .regex(/^\d+$/, { message: "page debe ser un número entero" })
    .transform((val) => parseInt(val, 10))
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, { message: "limit debe ser un número entero" })
    .transform((val) => parseInt(val, 10))
    .optional(),
  sort_by: z.enum(["priority", "created_at", "updated_at"]).optional(),
  sort_order: z.enum(["asc", "desc"]).optional(),
});

export type QueryServiceAssignmentInput = z.infer<
  typeof queryServiceAssignmentSchema
>;
