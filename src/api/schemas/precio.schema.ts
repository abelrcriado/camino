/**
 * SPRINT 4.2: SISTEMA DE PRECIOS JERÁRQUICO
 * Schema Layer - Validación con Zod para el sistema de precios
 *
 * Todos los schemas incluyen mensajes de error en español
 */

import { z } from "zod";
import { NivelPrecio, EntidadTipo } from "@/shared/dto/precio.dto";

// =====================================================
// SCHEMAS AUXILIARES Y VALIDACIONES
// =====================================================

/**
 * Regex para validar UUID v4
 */
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Schema para validar UUID
 */
const uuidSchema = z.string().regex(uuidRegex, "El ID debe ser un UUID válido");

/**
 * Schema para validar fecha ISO 8601 (solo fecha, sin hora)
 */
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD");

/**
 * Schema para nivel de precio
 */
const nivelPrecioSchema = z.nativeEnum(NivelPrecio, {
  message: "El nivel debe ser: base, ubicacion o service_point",
});

/**
 * Schema para tipo de entidad
 */
const entidadTipoSchema = z.nativeEnum(EntidadTipo, {
  message: "El tipo de entidad debe ser: producto o servicio",
});

/**
 * Schema para precio en céntimos
 * Debe ser entero positivo
 */
const precioAmountSchema = z
  .number()
  .int("El precio debe ser un número entero")
  .positive("El precio debe ser mayor que 0")
  .max(999999999, "El precio es demasiado alto");

// =====================================================
// CREATE PRECIO SCHEMA
// =====================================================

export const createPrecioSchema = z
  .object({
    nivel: nivelPrecioSchema,
    entidad_tipo: entidadTipoSchema,
    entidad_id: uuidSchema,

    precio: precioAmountSchema,

    ubicacion_id: z
      .string()
      .uuid("ubicacion_id debe ser un UUID válido")
      .optional()
      .nullable(),
    service_point_id: z
      .string()
      .uuid("service_point_id debe ser un UUID válido")
      .optional()
      .nullable(),

    fecha_inicio: dateSchema.optional(),
    fecha_fin: dateSchema.optional().nullable(),

    notas: z
      .string()
      .max(1000, "Las notas no pueden exceder 1000 caracteres")
      .optional(),
  })
  .refine(
    (data) => {
      // Validación de jerarquía: nivel BASE no debe tener ubicacion_id ni service_point_id
      if (data.nivel === NivelPrecio.BASE) {
        return !data.ubicacion_id && !data.service_point_id;
      }
      return true;
    },
    {
      message: "El nivel BASE no puede tener ubicacion_id ni service_point_id",
      path: ["nivel"],
    }
  )
  .refine(
    (data) => {
      // Validación de jerarquía: nivel UBICACION requiere ubicacion_id, NO service_point_id
      if (data.nivel === NivelPrecio.UBICACION) {
        return data.ubicacion_id && !data.service_point_id;
      }
      return true;
    },
    {
      message:
        "El nivel UBICACION requiere ubicacion_id y NO debe tener service_point_id",
      path: ["ubicacion_id"],
    }
  )
  .refine(
    (data) => {
      // Validación de jerarquía: nivel SERVICE_POINT requiere AMBOS
      if (data.nivel === NivelPrecio.SERVICE_POINT) {
        return data.ubicacion_id && data.service_point_id;
      }
      return true;
    },
    {
      message:
        "El nivel SERVICE_POINT requiere tanto ubicacion_id como service_point_id",
      path: ["service_point_id"],
    }
  )
  .refine(
    (data) => {
      // Validación de fechas: fecha_fin debe ser posterior a fecha_inicio
      if (data.fecha_fin && data.fecha_inicio) {
        const inicio = new Date(data.fecha_inicio);
        const fin = new Date(data.fecha_fin);
        return fin > inicio;
      }
      return true;
    },
    {
      message: "La fecha_fin debe ser posterior a fecha_inicio",
      path: ["fecha_fin"],
    }
  );

export type CreatePrecioInput = z.infer<typeof createPrecioSchema>;

// =====================================================
// UPDATE PRECIO SCHEMA
// =====================================================

export const updatePrecioSchema = z
  .object({
    id: uuidSchema,

    precio: precioAmountSchema.optional(),
    fecha_inicio: dateSchema.optional(),
    fecha_fin: dateSchema.optional().nullable(),
    notas: z
      .string()
      .max(1000, "Las notas no pueden exceder 1000 caracteres")
      .optional(),
  })
  .refine(
    (data) => {
      // Si se proporciona fecha_fin, debe ser posterior a fecha_inicio
      if (data.fecha_fin && data.fecha_inicio) {
        const inicio = new Date(data.fecha_inicio);
        const fin = new Date(data.fecha_fin);
        return fin > inicio;
      }
      return true;
    },
    {
      message: "La fecha_fin debe ser posterior a fecha_inicio",
      path: ["fecha_fin"],
    }
  )
  .refine(
    (data) => {
      // Al menos un campo debe ser proporcionado para actualizar
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...updates } = data;
      return Object.keys(updates).length > 0;
    },
    {
      message: "Debe proporcionar al menos un campo para actualizar",
      path: ["id"],
    }
  );

export type UpdatePrecioInput = z.infer<typeof updatePrecioSchema>;

// =====================================================
// DELETE PRECIO SCHEMA
// =====================================================

export const deletePrecioSchema = z.object({
  id: uuidSchema,
});

export type DeletePrecioInput = z.infer<typeof deletePrecioSchema>;

// =====================================================
// QUERY PRECIOS SCHEMA (para filtros)
// =====================================================

export const queryPreciosSchema = z.object({
  // Filtros
  nivel: nivelPrecioSchema.optional(),
  entidad_tipo: entidadTipoSchema.optional(),
  entidad_id: uuidSchema.optional(),
  ubicacion_id: uuidSchema.optional(),
  service_point_id: uuidSchema.optional(),

  // Filtro de vigencia
  vigente: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
  fecha: dateSchema.optional(),

  // Paginación
  page: z
    .string()
    .optional()
    .default("1")
    .transform(Number)
    .pipe(
      z
        .number()
        .int("page debe ser un número entero")
        .positive("page debe ser mayor que 0")
    ),
  limit: z
    .string()
    .optional()
    .default("20")
    .transform(Number)
    .pipe(
      z
        .number()
        .int("limit debe ser un número entero")
        .positive("limit debe ser mayor que 0")
        .max(100, "limit no puede ser mayor que 100")
    ),

  // Ordenamiento
  order_by: z.enum(["precio", "fecha_inicio", "created_at"]).optional(),
  order_direction: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type QueryPreciosInput = z.infer<typeof queryPreciosSchema>;

// =====================================================
// GET PRECIO APLICABLE SCHEMA
// =====================================================

export const getPrecioAplicableSchema = z.object({
  entidad_tipo: entidadTipoSchema,
  entidad_id: uuidSchema,

  ubicacion_id: uuidSchema.optional(),
  service_point_id: uuidSchema.optional(),

  fecha: dateSchema.optional(),
});

export type GetPrecioAplicableInput = z.infer<typeof getPrecioAplicableSchema>;

// =====================================================
// QUERY PRECIOS VIGENTES SCHEMA
// =====================================================

export const queryPreciosVigentesSchema = z.object({
  // Filtros
  nivel: nivelPrecioSchema.optional(),
  entidad_tipo: entidadTipoSchema.optional(),
  entidad_id: uuidSchema.optional(),
  ubicacion_id: uuidSchema.optional(),
  service_point_id: uuidSchema.optional(),

  // Paginación
  page: z
    .string()
    .optional()
    .default("1")
    .transform(Number)
    .pipe(
      z
        .number()
        .int("page debe ser un número entero")
        .positive("page debe ser mayor que 0")
    ),
  limit: z
    .string()
    .optional()
    .default("20")
    .transform(Number)
    .pipe(
      z
        .number()
        .int("limit debe ser un número entero")
        .positive("limit debe ser mayor que 0")
        .max(100, "limit no puede ser mayor que 100")
    ),

  // Ordenamiento
  order_by: z
    .enum(["precio", "fecha_inicio", "created_at", "dias_restantes"])
    .optional(),
  order_direction: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type QueryPreciosVigentesInput = z.infer<
  typeof queryPreciosVigentesSchema
>;

// =====================================================
// PRECIO RESUELTO SCHEMA (para validar respuestas)
// =====================================================

export const precioResueltoSchema = z.object({
  precio_id: uuidSchema,
  precio: z.number().int().positive(),
  precio_euros: z.number().positive(),
  nivel: nivelPrecioSchema,

  ubicacion_id: uuidSchema.optional().nullable(),
  service_point_id: uuidSchema.optional().nullable(),

  fecha_inicio: dateSchema,
  fecha_fin: dateSchema.optional().nullable(),

  ubicacion_nombre: z.string().optional().nullable(),
  service_point_nombre: z.string().optional().nullable(),
  dias_restantes: z.number().int().nullable().optional(),
  activo_hoy: z.boolean(),
});

export type PrecioResueltoValidated = z.infer<typeof precioResueltoSchema>;

// =====================================================
// PRECIO SCHEMA (para validar entidades completas)
// =====================================================

export const precioEntitySchema = z.object({
  id: uuidSchema,
  nivel: nivelPrecioSchema,
  entidad_tipo: entidadTipoSchema,
  entidad_id: uuidSchema,
  precio: z.number().int().positive(),

  ubicacion_id: uuidSchema.optional().nullable(),
  service_point_id: uuidSchema.optional().nullable(),

  fecha_inicio: dateSchema,
  fecha_fin: dateSchema.optional().nullable(),

  notas: z.string().optional().nullable(),

  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type PrecioValidated = z.infer<typeof precioEntitySchema>;

// =====================================================
// EXPORTAR TODOS LOS SCHEMAS
// =====================================================

export const precioSchemas = {
  create: createPrecioSchema,
  update: updatePrecioSchema,
  delete: deletePrecioSchema,
  query: queryPreciosSchema,
  getPrecioAplicable: getPrecioAplicableSchema,
  queryVigentes: queryPreciosVigentesSchema,
  precioResuelto: precioResueltoSchema,
  precio: precioEntitySchema,
};
