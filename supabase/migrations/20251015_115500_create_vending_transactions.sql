-- =====================================================
-- Migración: Crear tabla vending_transactions
-- Sprint: Sistema de Historial de Ventas
-- Fecha: 2025-10-15
-- Descripción: Tabla para registrar transacciones de vending machines
-- =====================================================

-- Tabla de transacciones de vending machines (ventas físicas)
CREATE TABLE IF NOT EXISTS vending_transactions (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relaciones
  slot_id UUID NOT NULL REFERENCES vending_machine_slots(id) ON DELETE RESTRICT,
  machine_id UUID NOT NULL REFERENCES vending_machines(id) ON DELETE RESTRICT,
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
  
  -- Datos de la venta
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  precio_total DECIMAL(10,2) NOT NULL,
  
  -- Método de pago
  metodo_pago VARCHAR(50) NOT NULL DEFAULT 'unknown',
  -- Valores posibles: 'efectivo', 'tarjeta', 'qr', 'app', 'unknown'
  
  -- Información adicional de stock
  stock_antes INTEGER,
  stock_despues INTEGER,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT check_cantidad_positiva CHECK (cantidad > 0),
  CONSTRAINT check_precio_unitario_positivo CHECK (precio_unitario > 0),
  CONSTRAINT check_precio_total_positivo CHECK (precio_total > 0),
  CONSTRAINT check_precio_total_correcto CHECK (precio_total = precio_unitario * cantidad),
  CONSTRAINT check_stock_no_negativo CHECK (stock_antes >= 0 AND stock_despues >= 0),
  CONSTRAINT check_stock_reduccion CHECK (stock_despues <= stock_antes),
  CONSTRAINT check_metodo_pago_valido CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'qr', 'app', 'unknown'))
);

-- ============================================================================
-- ÍNDICES
-- ============================================================================

-- Índices básicos para búsquedas frecuentes
CREATE INDEX idx_vending_transactions_slot ON vending_transactions(slot_id);
CREATE INDEX idx_vending_transactions_machine ON vending_transactions(machine_id);
CREATE INDEX idx_vending_transactions_producto ON vending_transactions(producto_id);
CREATE INDEX idx_vending_transactions_fecha ON vending_transactions(created_at DESC);
CREATE INDEX idx_vending_transactions_metodo_pago ON vending_transactions(metodo_pago);

-- Índice compuesto para analytics de máquina
CREATE INDEX idx_vending_transactions_analytics 
ON vending_transactions(machine_id, created_at DESC);

-- Índice compuesto para analytics de productos
CREATE INDEX idx_vending_transactions_producto_fecha 
ON vending_transactions(producto_id, created_at DESC);

-- ============================================================================
-- COMENTARIOS
-- ============================================================================

COMMENT ON TABLE vending_transactions IS 'Registro de transacciones de ventas en vending machines (ventas físicas)';
COMMENT ON COLUMN vending_transactions.slot_id IS 'Slot donde se realizó la venta';
COMMENT ON COLUMN vending_transactions.machine_id IS 'Máquina donde se realizó la venta';
COMMENT ON COLUMN vending_transactions.producto_id IS 'Producto vendido';
COMMENT ON COLUMN vending_transactions.cantidad IS 'Cantidad de unidades vendidas';
COMMENT ON COLUMN vending_transactions.precio_unitario IS 'Precio por unidad al momento de la venta (en euros)';
COMMENT ON COLUMN vending_transactions.precio_total IS 'Precio total de la transacción (en euros)';
COMMENT ON COLUMN vending_transactions.metodo_pago IS 'Método de pago usado (efectivo, tarjeta, qr, app, unknown)';
COMMENT ON COLUMN vending_transactions.stock_antes IS 'Stock disponible antes de la venta';
COMMENT ON COLUMN vending_transactions.stock_despues IS 'Stock disponible después de la venta';
COMMENT ON COLUMN vending_transactions.created_at IS 'Fecha y hora de la transacción';

-- ============================================================================
-- PERMISOS
-- ============================================================================

GRANT SELECT, INSERT ON vending_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vending_transactions TO service_role;
GRANT SELECT ON vending_transactions TO anon;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE vending_transactions ENABLE ROW LEVEL SECURITY;

-- Política: Permitir SELECT a todos los usuarios autenticados
CREATE POLICY vending_transactions_select_authenticated ON vending_transactions
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Permitir INSERT solo a service_role (para triggers y admin)
CREATE POLICY vending_transactions_insert_service ON vending_transactions
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ============================================================================
-- FIN MIGRACIÓN
-- ============================================================================
