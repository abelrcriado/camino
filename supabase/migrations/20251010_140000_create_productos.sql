-- =====================================================
-- SPRINT 3.1: TABLA PRODUCTOS
-- Migración: Crear tabla productos mejorada
-- Autor: Sistema Camino
-- Fecha: 2025-10-10
-- =====================================================

-- Crear ENUM para unidad de medida
CREATE TYPE unidad_medida_tipo AS ENUM (
  'unidad',
  'paquete',
  'caja',
  'litro',
  'mililitro',
  'kilogramo',
  'gramo',
  'metro',
  'centimetro',
  'pieza',
  'set',
  'par'
);

-- Tabla productos (nueva estructura mejorada)
CREATE TABLE IF NOT EXISTS productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificación
  sku VARCHAR(100) UNIQUE NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  
  -- Categorización
  category_id UUID NOT NULL REFERENCES product_categories(id) ON DELETE RESTRICT,
  subcategory_id UUID REFERENCES product_subcategories(id) ON DELETE SET NULL,
  
  -- Especificaciones
  marca VARCHAR(100),
  modelo VARCHAR(100),
  especificaciones JSONB DEFAULT '{}',
  
  -- Precios (en centavos para precisión)
  costo_base BIGINT NOT NULL,
  precio_venta BIGINT NOT NULL,
  tasa_iva DECIMAL(5,2) DEFAULT 21.00,
  margen_beneficio DECIMAL(5,2),
  
  -- Dimensiones y peso
  peso_gramos INTEGER,
  dimensiones JSONB DEFAULT '{}', -- {"largo": 10, "ancho": 5, "alto": 3, "unidad": "cm"}
  unidad_medida unidad_medida_tipo DEFAULT 'unidad',
  
  -- Código de barras
  codigo_barras VARCHAR(100),
  
  -- Caducidad y refrigeración
  requiere_refrigeracion BOOLEAN DEFAULT false,
  meses_caducidad INTEGER, -- Vida útil en meses desde fabricación
  dias_caducidad INTEGER,  -- Vida útil en días (alternativa a meses)
  perecedero BOOLEAN DEFAULT false, -- Flag para productos perecederos
  
  -- Proveedor
  proveedor_nombre VARCHAR(200),
  proveedor_codigo VARCHAR(100),
  proveedor_url TEXT,
  
  -- Multimedia y tags
  imagenes TEXT[],
  tags TEXT[],
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas eficientes
CREATE INDEX idx_productos_sku ON productos(sku);
CREATE INDEX idx_productos_nombre ON productos(nombre);
CREATE INDEX idx_productos_category ON productos(category_id);
CREATE INDEX idx_productos_subcategory ON productos(subcategory_id);
CREATE INDEX idx_productos_marca ON productos(marca);
CREATE INDEX idx_productos_active ON productos(is_active) WHERE is_active = true;
CREATE INDEX idx_productos_perecedero ON productos(perecedero) WHERE perecedero = true;
CREATE INDEX idx_productos_codigo_barras ON productos(codigo_barras) WHERE codigo_barras IS NOT NULL;

-- Índice GIN para búsqueda en tags
CREATE INDEX idx_productos_tags ON productos USING GIN(tags);

-- Comentarios
COMMENT ON TABLE productos IS 'Catálogo de productos disponibles para venta en máquinas vending';
COMMENT ON COLUMN productos.sku IS 'Stock Keeping Unit - Identificador único del producto';
COMMENT ON COLUMN productos.unidad_medida IS 'Unidad de medida del producto para inventario';
COMMENT ON COLUMN productos.dimensiones IS 'JSON con largo, ancho, alto, unidad';
COMMENT ON COLUMN productos.meses_caducidad IS 'Vida útil en meses desde fabricación';
COMMENT ON COLUMN productos.dias_caducidad IS 'Vida útil en días (para productos de corta duración)';
COMMENT ON COLUMN productos.perecedero IS 'Indica si el producto tiene fecha de caducidad';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_productos_updated_at
  BEFORE UPDATE ON productos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MIGRACIÓN DE DATOS (de service_products a productos)
-- =====================================================

-- Insertar productos desde service_products
INSERT INTO productos (
  id,
  sku,
  nombre,
  descripcion,
  category_id,
  subcategory_id,
  marca,
  modelo,
  especificaciones,
  costo_base,
  precio_venta,
  tasa_iva,
  margen_beneficio,
  peso_gramos,
  dimensiones,
  codigo_barras,
  requiere_refrigeracion,
  meses_caducidad,
  proveedor_nombre,
  proveedor_codigo,
  proveedor_url,
  imagenes,
  tags,
  is_active,
  created_at,
  updated_at
)
SELECT
  id,
  sku,
  name,
  description,
  category_id,
  subcategory_id,
  brand,
  model,
  specifications,
  base_cost,
  retail_price,
  vat_rate,
  profit_margin,
  weight_grams,
  dimensions,
  barcode,
  requires_refrigeration,
  expiration_months,
  supplier_name,
  supplier_code,
  supplier_url,
  images,
  tags,
  is_active,
  created_at,
  updated_at
FROM service_products
ON CONFLICT (id) DO NOTHING;

-- Actualizar flag perecedero basado en meses_caducidad
UPDATE productos
SET perecedero = true
WHERE meses_caducidad IS NOT NULL OR dias_caducidad IS NOT NULL;

-- =====================================================
-- COMENTARIOS EN TABLA LEGACY
-- =====================================================

-- Marcar service_products como DEPRECATED
COMMENT ON TABLE service_products IS 'DEPRECATED - Usar tabla productos en su lugar. Mantenida para compatibilidad temporal.';

-- =====================================================
-- GRANTS
-- =====================================================

-- Permisos para authenticated users
GRANT SELECT ON productos TO authenticated;
GRANT SELECT ON productos TO anon;

-- Permisos para service role (admin)
GRANT ALL ON productos TO service_role;
