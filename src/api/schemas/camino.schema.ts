/**
 * Schemas de validación Zod para Caminos
 */

import { z } from "zod";
import { uuidSchema } from "./common.schema";

/**
 * Schema para código de camino (ej: CSF, CN, CP)
 */
const codigoCaminoSchema = z
  .string()
  .min(2, { message: "El código debe tener al menos 2 caracteres" })
  .max(10, { message: "El código no puede exceder 10 caracteres" })
  .regex(/^[A-Z0-9_-]+$/, {
    message:
      "El código solo puede contener letras mayúsculas, números, guiones y guiones bajos",
  });

/**
 * Schema para nombre de camino
 */
const nombreCaminoSchema = z
  .string()
  .min(3, { message: "El nombre debe tener al menos 3 caracteres" })
  .max(150, { message: "El nombre no puede exceder 150 caracteres" });

/**
 * Schema para estado operativo
 */
const estadoOperativoSchema = z.enum(
  ["activo", "inactivo", "mantenimiento", "planificado"],
  {
    message:
      "Estado operativo debe ser: activo, inactivo, mantenimiento o planificado",
  }
);

/**
 * Schema para crear un nuevo camino (POST)
 */
export const createCaminoSchema = z
  .object({
    nombre: nombreCaminoSchema,
    codigo: codigoCaminoSchema,
    zona_operativa: z
      .string()
      .max(100, {
        message: "La zona operativa no puede exceder 100 caracteres",
      })
      .optional(),
    region: z
      .string()
      .max(100, { message: "La región no puede exceder 100 caracteres" })
      .optional(),
    estado_operativo: estadoOperativoSchema.optional().default("activo"),
    descripcion: z
      .string()
      .max(1000, { message: "La descripción no puede exceder 1000 caracteres" })
      .optional(),
  })
  .strict();

/**
 * Schema para actualizar un camino (PUT)
 */
export const updateCaminoSchema = z
  .object({
    id: uuidSchema,
    nombre: nombreCaminoSchema.optional(),
    codigo: codigoCaminoSchema.optional(),
    zona_operativa: z
      .string()
      .max(100, {
        message: "La zona operativa no puede exceder 100 caracteres",
      })
      .optional(),
    region: z
      .string()
      .max(100, { message: "La región no puede exceder 100 caracteres" })
      .optional(),
    estado_operativo: estadoOperativoSchema.optional(),
    descripcion: z
      .string()
      .max(1000, { message: "La descripción no puede exceder 1000 caracteres" })
      .optional(),
  })
  .strict()
  .refine(
    (data) => {
      // Al menos un campo además de id debe estar presente
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = data;
      return Object.keys(rest).length > 0;
    },
    {
      message: "Debe proporcionar al menos un campo para actualizar",
    }
  );

/**
 * Schema para eliminar un camino (DELETE)
 */
export const deleteCaminoSchema = z
  .object({
    id: uuidSchema,
  })
  .strict();

/**
 * Schema para query parameters de GET
 */
export const queryCaminoSchema = z
  .object({
    codigo: codigoCaminoSchema.optional(),
    estado_operativo: estadoOperativoSchema.optional(),
    region: z.string().optional(),
    zona_operativa: z.string().optional(),
  })
  .optional();

// Tipos TypeScript inferidos
export type CreateCaminoInput = z.infer<typeof createCaminoSchema>;
export type UpdateCaminoInput = z.infer<typeof updateCaminoSchema>;
export type DeleteCaminoInput = z.infer<typeof deleteCaminoSchema>;
export type QueryCaminoInput = z.infer<typeof queryCaminoSchema>;
