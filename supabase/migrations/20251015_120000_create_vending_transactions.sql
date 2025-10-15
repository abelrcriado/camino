-- =====================================================
-- Migración: Crear tabla vending_transactions
-- Sprint 6.5 - Sistema de Historial de Ventas
-- Fecha: 2025-10-15
-- =====================================================

-- Tabla de transacciones de ventas en vending machines
CREATE TABLE IF NOT EXISTS vending_transactions (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relaciones
  slot_id UUID NOT NULL REFERENCES vending_machine_slots(id) ON DELETE RESTRICT,
  machine_id UUID NOT NULL REFERENCES vending_machines(id) ON DELETE RESTRICT,
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
  
  -- Datos de la venta
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario INTEGER NOT NULL,  -- Precio en céntimos
  precio_total INTEGER NOT NULL,     -- precio_unitario * cantidad
  
  -- Método de pago
  metodo_pago VARCHAR(50) NOT NULL, -- 'efectivo', 'tarjeta', 'qr', 'app', 'unknown'
  
  -- Información adicional para auditoría
  stock_antes INTEGER,
  stock_despues INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT check_cantidad_positiva CHECK (cantidad > 0),
  CONSTRAINT check_precio_unitario_positivo CHECK (precio_unitario > 0),
  CONSTRAINT check_precio_total_positivo CHECK (precio_total > 0),
  CONSTRAINT check_precio_total_correcto CHECK (precio_total = precio_unitario * cantidad),
  CONSTRAINT check_metodo_pago_valido CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'qr', 'app', 'unknown')),
  CONSTRAINT check_stock_antes_positivo CHECK (stock_antes IS NULL OR stock_antes >= 0),
  CONSTRAINT check_stock_despues_positivo CHECK (stock_despues IS NULL OR stock_despues >= 0)
);

-- Índices para mejorar rendimiento en queries
CREATE INDEX idx_vending_transactions_slot ON vending_transactions(slot_id);
CREATE INDEX idx_vending_transactions_machine ON vending_transactions(machine_id);
CREATE INDEX idx_vending_transactions_producto ON vending_transactions(producto_id);
CREATE INDEX idx_vending_transactions_fecha ON vending_transactions(created_at DESC);
CREATE INDEX idx_vending_transactions_metodo_pago ON vending_transactions(metodo_pago);

-- Índice compuesto para analytics (machine + fecha)
CREATE INDEX idx_vending_transactions_analytics 
ON vending_transactions(machine_id, created_at DESC);

-- Índice compuesto para stats por producto
CREATE INDEX idx_vending_transactions_producto_fecha 
ON vending_transactions(producto_id, created_at DESC);

-- Comentarios para documentación
COMMENT ON TABLE vending_transactions IS 'Historial de ventas realizadas en vending machines';
COMMENT ON COLUMN vending_transactions.slot_id IS 'Slot donde se realizó la venta';
COMMENT ON COLUMN vending_transactions.machine_id IS 'Máquina donde se realizó la venta';
COMMENT ON COLUMN vending_transactions.producto_id IS 'Producto vendido';
COMMENT ON COLUMN vending_transactions.cantidad IS 'Cantidad de unidades vendidas';
COMMENT ON COLUMN vending_transactions.precio_unitario IS 'Precio por unidad en céntimos al momento de la venta';
COMMENT ON COLUMN vending_transactions.precio_total IS 'Precio total de la transacción en céntimos';
COMMENT ON COLUMN vending_transactions.metodo_pago IS 'Método de pago utilizado';
COMMENT ON COLUMN vending_transactions.stock_antes IS 'Stock disponible antes de la venta';
COMMENT ON COLUMN vending_transactions.stock_despues IS 'Stock disponible después de la venta';
COMMENT ON COLUMN vending_transactions.created_at IS 'Fecha y hora de la transacción';

-- Permisos
GRANT SELECT ON vending_transactions TO authenticated;
GRANT SELECT ON vending_transactions TO anon;

-- Row Level Security (RLS)
ALTER TABLE vending_transactions ENABLE ROW LEVEL SECURITY;

-- Política: Permitir SELECT a usuarios autenticados
CREATE POLICY vending_transactions_select_authenticated ON vending_transactions
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Permitir SELECT público (para dashboard públicos si es necesario)
CREATE POLICY vending_transactions_select_anon ON vending_transactions
  FOR SELECT
  TO anon
  USING (true);
