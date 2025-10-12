-- =====================================================
-- Migración 8: Crear tabla ventas_app
-- Sprint 4.1 - Sistema de Ventas desde App
-- Fecha: 2025-10-11
-- =====================================================

-- Tabla de ventas de productos desde la app móvil
CREATE TABLE IF NOT EXISTS ventas_app (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relaciones
  slot_id UUID NOT NULL REFERENCES vending_machine_slots(id) ON DELETE RESTRICT,
  user_id UUID,  -- FK a auth.users (Supabase), sin constraint explícito
  payment_id UUID,  -- FK a payments, sin constraint por ahora
  
  -- Datos del producto vendido (snapshot al momento de la venta)
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
  producto_nombre VARCHAR(255) NOT NULL,
  producto_sku VARCHAR(100),
  cantidad INTEGER NOT NULL DEFAULT 1,
  
  -- Precios (en céntimos para precisión)
  precio_unitario INTEGER NOT NULL,  -- Precio por unidad al momento de venta
  precio_total INTEGER NOT NULL,     -- precio_unitario * cantidad
  
  -- Estado del flujo de venta
  estado VARCHAR(50) NOT NULL DEFAULT 'borrador',
  -- Estados posibles:
  -- 'borrador': Venta iniciada pero no confirmada
  -- 'reservado': Stock reservado, esperando pago
  -- 'pagado': Pago confirmado, esperando retiro
  -- 'completado': Producto retirado exitosamente
  -- 'cancelado': Venta cancelada por usuario o sistema
  -- 'expirado': Reserva expirada por tiempo
  
  -- Código de retiro (generado al pagar)
  codigo_retiro VARCHAR(10) UNIQUE,
  
  -- Timestamps de flujo
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_reserva TIMESTAMP WITH TIME ZONE,
  fecha_pago TIMESTAMP WITH TIME ZONE,
  fecha_expiracion TIMESTAMP WITH TIME ZONE,
  fecha_retiro TIMESTAMP WITH TIME ZONE,
  fecha_cancelacion TIMESTAMP WITH TIME ZONE,
  
  -- Metadatos
  notas TEXT,
  metadata JSONB,  -- Información adicional (ej: ubicación, dispositivo)
  
  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT check_cantidad_positiva CHECK (cantidad > 0),
  CONSTRAINT check_precio_unitario_positivo CHECK (precio_unitario > 0),
  CONSTRAINT check_precio_total_positivo CHECK (precio_total > 0),
  CONSTRAINT check_precio_total_correcto CHECK (precio_total = precio_unitario * cantidad),
  CONSTRAINT check_estado_valido CHECK (estado IN ('borrador', 'reservado', 'pagado', 'completado', 'cancelado', 'expirado')),
  CONSTRAINT check_codigo_retiro_formato CHECK (codigo_retiro ~ '^[A-Z0-9]{6,10}$' OR codigo_retiro IS NULL),
  CONSTRAINT check_fecha_expiracion_futura CHECK (
    fecha_expiracion IS NULL OR 
    fecha_expiracion > fecha_pago
  )
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_ventas_app_slot_id ON ventas_app(slot_id);
CREATE INDEX idx_ventas_app_user_id ON ventas_app(user_id);
CREATE INDEX idx_ventas_app_payment_id ON ventas_app(payment_id);
CREATE INDEX idx_ventas_app_producto_id ON ventas_app(producto_id);
CREATE INDEX idx_ventas_app_estado ON ventas_app(estado);
CREATE INDEX idx_ventas_app_codigo_retiro ON ventas_app(codigo_retiro) WHERE codigo_retiro IS NOT NULL;
CREATE INDEX idx_ventas_app_fecha_creacion ON ventas_app(fecha_creacion DESC);
CREATE INDEX idx_ventas_app_fecha_expiracion ON ventas_app(fecha_expiracion) WHERE estado = 'pagado';

-- Índice compuesto para búsquedas de ventas activas por usuario
CREATE INDEX idx_ventas_app_user_estado ON ventas_app(user_id, estado) WHERE estado IN ('reservado', 'pagado');

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_ventas_app_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ventas_app_updated_at
  BEFORE UPDATE ON ventas_app
  FOR EACH ROW
  EXECUTE FUNCTION update_ventas_app_updated_at();

-- Comentarios de documentación
COMMENT ON TABLE ventas_app IS 'Ventas de productos desde la aplicación móvil';
COMMENT ON COLUMN ventas_app.id IS 'Identificador único de la venta';
COMMENT ON COLUMN ventas_app.slot_id IS 'Slot de máquina vending donde está el producto';
COMMENT ON COLUMN ventas_app.user_id IS 'Usuario que realiza la compra (puede ser NULL para compras anónimas)';
COMMENT ON COLUMN ventas_app.payment_id IS 'Referencia al pago en Stripe/sistema de pagos';
COMMENT ON COLUMN ventas_app.producto_id IS 'Producto vendido (snapshot al momento de venta)';
COMMENT ON COLUMN ventas_app.producto_nombre IS 'Nombre del producto al momento de venta (para historial)';
COMMENT ON COLUMN ventas_app.cantidad IS 'Cantidad de unidades vendidas';
COMMENT ON COLUMN ventas_app.precio_unitario IS 'Precio por unidad en céntimos (ej: 250 = 2.50€)';
COMMENT ON COLUMN ventas_app.precio_total IS 'Precio total en céntimos (precio_unitario * cantidad)';
COMMENT ON COLUMN ventas_app.estado IS 'Estado del flujo de venta: borrador, reservado, pagado, completado, cancelado, expirado';
COMMENT ON COLUMN ventas_app.codigo_retiro IS 'Código alfanumérico para retirar el producto (ej: ABC123)';
COMMENT ON COLUMN ventas_app.fecha_creacion IS 'Cuando se inició la venta';
COMMENT ON COLUMN ventas_app.fecha_reserva IS 'Cuando se reservó el stock';
COMMENT ON COLUMN ventas_app.fecha_pago IS 'Cuando se confirmó el pago';
COMMENT ON COLUMN ventas_app.fecha_expiracion IS 'Cuando expira la reserva si no se retira';
COMMENT ON COLUMN ventas_app.fecha_retiro IS 'Cuando se retiró el producto físicamente';
COMMENT ON COLUMN ventas_app.fecha_cancelacion IS 'Cuando se canceló la venta';
COMMENT ON COLUMN ventas_app.metadata IS 'Información adicional en formato JSON (ubicación, dispositivo, etc.)';

-- Permisos
GRANT SELECT, INSERT, UPDATE ON ventas_app TO authenticated;
GRANT SELECT ON ventas_app TO anon;

-- Row Level Security (RLS)
ALTER TABLE ventas_app ENABLE ROW LEVEL SECURITY;

-- Política: Permitir SELECT a usuarios autenticados
CREATE POLICY ventas_app_select_authenticated ON ventas_app
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Permitir INSERT a usuarios autenticados
CREATE POLICY ventas_app_insert_authenticated ON ventas_app
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política: Permitir UPDATE a usuarios autenticados
CREATE POLICY ventas_app_update_authenticated ON ventas_app
  FOR UPDATE
  TO authenticated
  USING (true);
