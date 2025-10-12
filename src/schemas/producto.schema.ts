/**
 * Esquemas de validación Zod para Productos
 * Validación completa con SKU único, unidad_medida enum, dimensiones, caducidad
 */

import { z } from "zod";

// Enum para unidad de medida
export const UnidadMedidaEnum = z.enum([
  "unidad",
  "paquete",
  "caja",
  "litro",
  "mililitro",
  "kilogramo",
  "gramo",
  "metro",
  "centimetro",
  "pieza",
  "set",
  "par",
]);

// Schema para dimensiones
export const DimensionesSchema = z
  .object({
    largo: z.number().positive().optional(),
    ancho: z.number().positive().optional(),
    alto: z.number().positive().optional(),
    unidad: z.enum(["cm", "m", "mm"]).optional().default("cm"),
  })
  .optional();

// Schema base UUID
const uuidSchema = z.string().uuid({ message: "ID debe ser un UUID válido" });

// =====================================================
// CREATE PRODUCTO SCHEMA
// =====================================================

export const createProductoSchema = z
  .object({
    sku: z
      .string()
      .min(1, "SKU es requerido")
      .max(100, "SKU no puede exceder 100 caracteres")
      .regex(
        /^[A-Z0-9-_]+$/,
        "SKU debe contener solo mayúsculas, números, guiones y guiones bajos"
      ),

    nombre: z
      .string()
      .min(2, "Nombre debe tener al menos 2 caracteres")
      .max(200, "Nombre no puede exceder 200 caracteres"),

    descripcion: z.string().optional(),

    category_id: uuidSchema,
    subcategory_id: uuidSchema.optional(),

    marca: z.string().max(100).optional(),
    modelo: z.string().max(100).optional(),

    especificaciones: z.record(z.string(), z.unknown()).optional().default({}),

    costo_base: z
      .number()
      .int({ message: "Costo base debe ser entero (centavos)" })
      .nonnegative({ message: "Costo base no puede ser negativo" }),

    precio_venta: z
      .number()
      .int({ message: "Precio venta debe ser entero (centavos)" })
      .positive({ message: "Precio venta debe ser mayor a 0" }),

    tasa_iva: z
      .number()
      .min(0, "Tasa IVA no puede ser negativa")
      .max(100, "Tasa IVA no puede exceder 100%")
      .optional()
      .default(21.0),

    margen_beneficio: z
      .number()
      .min(0, "Margen de beneficio no puede ser negativo")
      .max(1000, "Margen de beneficio no puede exceder 1000%")
      .optional(),

    peso_gramos: z
      .number()
      .int({ message: "Peso debe ser entero" })
      .positive({ message: "Peso debe ser positivo" })
      .optional(),

    dimensiones: DimensionesSchema,

    unidad_medida: UnidadMedidaEnum.optional().default("unidad"),

    codigo_barras: z.string().max(100).optional(),

    requiere_refrigeracion: z.boolean().optional().default(false),

    meses_caducidad: z
      .number()
      .int({ message: "Meses de caducidad debe ser entero" })
      .positive({ message: "Meses de caducidad debe ser positivo" })
      .optional(),

    dias_caducidad: z
      .number()
      .int({ message: "Días de caducidad debe ser entero" })
      .positive({ message: "Días de caducidad debe ser positivo" })
      .optional(),

    perecedero: z.boolean().optional().default(false),

    proveedor_nombre: z.string().max(200).optional(),
    proveedor_codigo: z.string().max(100).optional(),
    proveedor_url: z
      .string()
      .url({ message: "URL de proveedor inválida" })
      .optional(),

    imagenes: z
      .array(z.string().url({ message: "URL de imagen inválida" }))
      .optional(),
    tags: z.array(z.string()).optional(),

    is_active: z.boolean().optional().default(true),
  })
  .refine((data) => data.precio_venta > data.costo_base, {
    message: "Precio de venta debe ser mayor al costo base",
    path: ["precio_venta"],
  })
  .refine(
    (data) => {
      // Si marca perecedero es true, debe tener meses_caducidad o dias_caducidad
      if (data.perecedero) {
        return (
          data.meses_caducidad !== undefined ||
          data.dias_caducidad !== undefined
        );
      }
      return true;
    },
    {
      message:
        "Producto perecedero debe tener meses_caducidad o dias_caducidad",
      path: ["perecedero"],
    }
  );

export type CreateProductoInput = z.infer<typeof createProductoSchema>;

// =====================================================
// UPDATE PRODUCTO SCHEMA
// =====================================================

export const updateProductoSchema = z
  .object({
    id: uuidSchema,

    sku: z
      .string()
      .min(1, "SKU es requerido")
      .max(100, "SKU no puede exceder 100 caracteres")
      .regex(
        /^[A-Z0-9-_]+$/,
        "SKU debe contener solo mayúsculas, números, guiones y guiones bajos"
      )
      .optional(),

    nombre: z
      .string()
      .min(2, "Nombre debe tener al menos 2 caracteres")
      .max(200, "Nombre no puede exceder 200 caracteres")
      .optional(),

    descripcion: z.string().optional(),

    category_id: uuidSchema.optional(),
    subcategory_id: uuidSchema.optional(),

    marca: z.string().max(100).optional(),
    modelo: z.string().max(100).optional(),

    especificaciones: z.record(z.string(), z.unknown()).optional(),

    costo_base: z
      .number()
      .int({ message: "Costo base debe ser entero (centavos)" })
      .nonnegative({ message: "Costo base no puede ser negativo" })
      .optional(),

    precio_venta: z
      .number()
      .int({ message: "Precio venta debe ser entero (centavos)" })
      .positive({ message: "Precio venta debe ser mayor a 0" })
      .optional(),

    tasa_iva: z
      .number()
      .min(0, "Tasa IVA no puede ser negativa")
      .max(100, "Tasa IVA no puede exceder 100%")
      .optional(),

    margen_beneficio: z
      .number()
      .min(0, "Margen de beneficio no puede ser negativo")
      .max(1000, "Margen de beneficio no puede exceder 1000%")
      .optional(),

    peso_gramos: z
      .number()
      .int({ message: "Peso debe ser entero" })
      .positive({ message: "Peso debe ser positivo" })
      .optional(),

    dimensiones: DimensionesSchema,

    unidad_medida: UnidadMedidaEnum.optional(),

    codigo_barras: z.string().max(100).optional(),

    requiere_refrigeracion: z.boolean().optional(),

    meses_caducidad: z
      .number()
      .int({ message: "Meses de caducidad debe ser entero" })
      .positive({ message: "Meses de caducidad debe ser positivo" })
      .optional(),

    dias_caducidad: z
      .number()
      .int({ message: "Días de caducidad debe ser entero" })
      .positive({ message: "Días de caducidad debe ser positivo" })
      .optional(),

    perecedero: z.boolean().optional(),

    proveedor_nombre: z.string().max(200).optional(),
    proveedor_codigo: z.string().max(100).optional(),
    proveedor_url: z
      .string()
      .url({ message: "URL de proveedor inválida" })
      .optional(),

    imagenes: z
      .array(z.string().url({ message: "URL de imagen inválida" }))
      .optional(),
    tags: z.array(z.string()).optional(),

    is_active: z.boolean().optional(),
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
  )
  .refine(
    (data) => {
      // Si tiene ambos precios, validar que venta > costo
      if (data.precio_venta !== undefined && data.costo_base !== undefined) {
        return data.precio_venta > data.costo_base;
      }
      return true;
    },
    {
      message: "Precio de venta debe ser mayor al costo base",
      path: ["precio_venta"],
    }
  );

export type UpdateProductoInput = z.infer<typeof updateProductoSchema>;

// =====================================================
// DELETE PRODUCTO SCHEMA
// =====================================================

export const deleteProductoSchema = z.object({
  id: uuidSchema,
});

export type DeleteProductoInput = z.infer<typeof deleteProductoSchema>;

// =====================================================
// QUERY PRODUCTO SCHEMA (Filtros)
// =====================================================

export const queryProductoSchema = z.object({
  sku: z.string().optional(),
  nombre: z.string().optional(),
  category_id: uuidSchema.optional(),
  subcategory_id: uuidSchema.optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  unidad_medida: UnidadMedidaEnum.optional(),

  is_active: z
    .string()
    .optional()
    .transform((val) =>
      val === "true" ? true : val === "false" ? false : undefined
    ),

  perecedero: z
    .string()
    .optional()
    .transform((val) =>
      val === "true" ? true : val === "false" ? false : undefined
    ),

  requiere_refrigeracion: z
    .string()
    .optional()
    .transform((val) =>
      val === "true" ? true : val === "false" ? false : undefined
    ),

  precio_min: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),

  precio_max: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),

  search: z.string().optional(), // Búsqueda general

  // Paginación y ordenamiento
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10)),

  limit: z
    .string()
    .optional()
    .default("50")
    .transform((val) => parseInt(val, 10)),

  sort_by: z
    .enum([
      "nombre",
      "sku",
      "precio_venta",
      "created_at",
      "updated_at",
      "stock_total",
    ])
    .optional()
    .default("created_at"),

  sort_order: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type QueryProductoInput = z.infer<typeof queryProductoSchema>;
