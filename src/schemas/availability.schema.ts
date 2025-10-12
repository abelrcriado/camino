import { z } from "zod";
import { uuidSchema } from "./common.schema";

// Opening Hours Schemas
export const createOpeningHoursSchema = z
  .object({
    csp_id: uuidSchema,
    day_of_week: z.number().min(0).max(6),
    open_time: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
        "Invalid time format. Expected HH:MM:SS"
      ),
    close_time: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
        "Invalid time format. Expected HH:MM:SS"
      ),
    is_closed: z.boolean().default(false),
  })
  .strict();

export const updateOpeningHoursSchema = z
  .object({
    id: uuidSchema,
    open_time: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
        "Invalid time format. Expected HH:MM:SS"
      )
      .optional(),
    close_time: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
        "Invalid time format. Expected HH:MM:SS"
      )
      .optional(),
    is_closed: z.boolean().optional(),
  })
  .strict();

export const deleteOpeningHoursSchema = z
  .object({
    id: uuidSchema,
  })
  .strict();

// Special Closure Schemas
export const createSpecialClosureSchema = z
  .object({
    csp_id: uuidSchema,
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Expected YYYY-MM-DD"),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Expected YYYY-MM-DD"),
    reason: z.string().min(1).max(255),
  })
  .strict();

export const updateSpecialClosureSchema = z
  .object({
    id: uuidSchema,
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Expected YYYY-MM-DD")
      .optional(),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Expected YYYY-MM-DD")
      .optional(),
    reason: z.string().min(1).max(255).optional(),
  })
  .strict();

export const deleteSpecialClosureSchema = z
  .object({
    id: uuidSchema,
  })
  .strict();

// Service Availability Schemas
export const updateServiceAvailabilitySchema = z
  .object({
    id: uuidSchema,
    is_available: z.boolean().optional(),
    available_slots: z.number().min(0).optional(),
    next_available: z.string().datetime().optional(),
    unavailable_reason: z.string().max(255).optional(),
  })
  .strict();

// Query Schemas
export const queryCSPAvailabilitySchema = z
  .object({
    csp_id: uuidSchema.optional(),
    check_time: z.string().datetime().optional(),
  })
  .strict();

export const queryOpeningHoursSchema = z
  .object({
    csp_id: uuidSchema.optional(),
  })
  .strict();

export const querySpecialClosuresSchema = z
  .object({
    csp_id: uuidSchema.optional(),
    from_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Expected YYYY-MM-DD")
      .optional(),
    to_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Expected YYYY-MM-DD")
      .optional(),
  })
  .strict();

export const queryServiceAvailabilitySchema = z
  .object({
    csp_id: uuidSchema.optional(),
    service_type: z.string().min(1).optional(),
  })
  .strict();

export const querySlotAvailabilitySchema = z
  .object({
    csp_id: uuidSchema,
    service_type: z.string().min(1),
    slot_time: z.string().datetime(),
    duration_minutes: z.number().min(1).max(1440).default(60),
  })
  .strict();

// Bulk operations
export const bulkCreateOpeningHoursSchema = z
  .object({
    csp_id: uuidSchema,
    opening_hours: z
      .array(
        z.object({
          day_of_week: z.number().min(0).max(6),
          open_time: z
            .string()
            .regex(
              /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
              "Invalid time format. Expected HH:MM:SS"
            ),
          close_time: z
            .string()
            .regex(
              /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
              "Invalid time format. Expected HH:MM:SS"
            ),
          is_closed: z.boolean().default(false),
        })
      )
      .min(1)
      .max(7),
  })
  .strict();

// Type inference exports
export type CreateOpeningHoursInput = z.infer<typeof createOpeningHoursSchema>;
export type UpdateOpeningHoursInput = z.infer<typeof updateOpeningHoursSchema>;
export type DeleteOpeningHoursInput = z.infer<typeof deleteOpeningHoursSchema>;

export type CreateSpecialClosureInput = z.infer<
  typeof createSpecialClosureSchema
>;
export type UpdateSpecialClosureInput = z.infer<
  typeof updateSpecialClosureSchema
>;
export type DeleteSpecialClosureInput = z.infer<
  typeof deleteSpecialClosureSchema
>;

export type UpdateServiceAvailabilityInput = z.infer<
  typeof updateServiceAvailabilitySchema
>;

export type QueryCSPAvailabilityInput = z.infer<
  typeof queryCSPAvailabilitySchema
>;
export type QueryOpeningHoursInput = z.infer<typeof queryOpeningHoursSchema>;
export type QuerySpecialClosuresInput = z.infer<
  typeof querySpecialClosuresSchema
>;
export type QueryServiceAvailabilityInput = z.infer<
  typeof queryServiceAvailabilitySchema
>;
export type QuerySlotAvailabilityInput = z.infer<
  typeof querySlotAvailabilitySchema
>;

export type BulkCreateOpeningHoursInput = z.infer<
  typeof bulkCreateOpeningHoursSchema
>;
