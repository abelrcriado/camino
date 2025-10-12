/**
 * DTO para Productos
 * Define las interfaces TypeScript para el manejo de productos
 */

export type UnidadMedida =
  | "unidad"
  | "paquete"
  | "caja"
  | "litro"
  | "mililitro"
  | "kilogramo"
  | "gramo"
  | "metro"
  | "centimetro"
  | "pieza"
  | "set"
  | "par";

export interface Producto {
  id: string;
  sku: string;
  nombre: string;
  descripcion?: string;
  category_id: string;
  subcategory_id?: string;
  marca?: string;
  modelo?: string;
  especificaciones?: Record<string, unknown>;
  costo_base: number; // En centavos
  precio_venta: number; // En centavos
  tasa_iva?: number;
  margen_beneficio?: number;
  peso_gramos?: number;
  dimensiones?: {
    largo?: number;
    ancho?: number;
    alto?: number;
    unidad?: "cm" | "m" | "mm";
  };
  unidad_medida?: UnidadMedida;
  codigo_barras?: string;
  requiere_refrigeracion?: boolean;
  meses_caducidad?: number;
  dias_caducidad?: number;
  perecedero?: boolean;
  proveedor_nombre?: string;
  proveedor_codigo?: string;
  proveedor_url?: string;
  imagenes?: string[];
  tags?: string[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductoDto {
  sku: string;
  nombre: string;
  descripcion?: string;
  category_id: string;
  subcategory_id?: string;
  marca?: string;
  modelo?: string;
  especificaciones?: Record<string, unknown>;
  costo_base: number;
  precio_venta: number;
  tasa_iva?: number;
  margen_beneficio?: number;
  peso_gramos?: number;
  dimensiones?: {
    largo?: number;
    ancho?: number;
    alto?: number;
    unidad?: "cm" | "m" | "mm";
  };
  unidad_medida?: UnidadMedida;
  codigo_barras?: string;
  requiere_refrigeracion?: boolean;
  meses_caducidad?: number;
  dias_caducidad?: number;
  perecedero?: boolean;
  proveedor_nombre?: string;
  proveedor_codigo?: string;
  proveedor_url?: string;
  imagenes?: string[];
  tags?: string[];
  is_active?: boolean;
}

export interface UpdateProductoDto {
  id: string;
  sku?: string;
  nombre?: string;
  descripcion?: string;
  category_id?: string;
  subcategory_id?: string;
  marca?: string;
  modelo?: string;
  especificaciones?: Record<string, unknown>;
  costo_base?: number;
  precio_venta?: number;
  tasa_iva?: number;
  margen_beneficio?: number;
  peso_gramos?: number;
  dimensiones?: {
    largo?: number;
    ancho?: number;
    alto?: number;
    unidad?: "cm" | "m" | "mm";
  };
  unidad_medida?: UnidadMedida;
  codigo_barras?: string;
  requiere_refrigeracion?: boolean;
  meses_caducidad?: number;
  dias_caducidad?: number;
  perecedero?: boolean;
  proveedor_nombre?: string;
  proveedor_codigo?: string;
  proveedor_url?: string;
  imagenes?: string[];
  tags?: string[];
  is_active?: boolean;
}

export interface ProductoFilters {
  sku?: string;
  nombre?: string;
  category_id?: string;
  subcategory_id?: string;
  marca?: string;
  modelo?: string;
  unidad_medida?: UnidadMedida;
  is_active?: boolean;
  perecedero?: boolean;
  requiere_refrigeracion?: boolean;
  precio_min?: number;
  precio_max?: number;
  search?: string; // Búsqueda general por nombre, SKU, marca
}

export interface ProductoInventario extends Producto {
  category_name?: string;
  subcategory_name?: string;
  costo_base_euros?: number;
  precio_venta_euros?: number;
  // Stock fields - se agregarán en Sprint 5
  stock_total?: number;
  stock_disponible?: number;
  stock_reservado?: number;
  stock_en_transito?: number;
  ubicaciones_con_stock?: number;
}
