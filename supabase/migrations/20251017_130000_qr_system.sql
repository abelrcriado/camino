-- Migration: QR Offline-First System
-- Date: 2025-10-17
-- Description: Crea tablas y columnas necesarias para el sistema de QR offline-first

-- 1. Agregar columna qr_secret a profiles (tabla de usuarios)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS qr_secret VARCHAR(255);

-- Generar secret único para usuarios existentes (hex de 32 bytes = 64 chars)
UPDATE profiles 
SET qr_secret = encode(gen_random_bytes(32), 'hex')
WHERE qr_secret IS NULL;

-- Hacer qr_secret NOT NULL después de generar valores
ALTER TABLE profiles ALTER COLUMN qr_secret SET NOT NULL;

-- 2. Tabla transactions
-- Almacena todas las transacciones de compra (online y offline)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  items JSONB NOT NULL,                    -- Array de productos/servicios
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'completed',  -- completed, pending_sync, cancelled
  
  -- QR tracking
  qr_used BOOLEAN DEFAULT FALSE,
  qr_used_at TIMESTAMPTZ,
  qr_used_location UUID REFERENCES service_points(id),
  qr_used_by UUID REFERENCES profiles(id), -- Empleado que escaneó
  
  qr_invalidated BOOLEAN DEFAULT FALSE,
  qr_invalidated_at TIMESTAMPTZ,
  qr_invalidated_reason VARCHAR(100),      -- return, cancellation, expired
  
  -- Tracking
  parent_transaction_id UUID REFERENCES transactions(id), -- Si es modificación
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ                    -- Cuando se sincronizó desde offline
);

-- Índices para transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_qr_used ON transactions(qr_used);
CREATE INDEX IF NOT EXISTS idx_transactions_parent ON transactions(parent_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- 3. Tabla access_logs
-- Registra todos los escaneos de QR (auditoría completa)
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES service_points(id) ON DELETE CASCADE,
  qr_data TEXT,                            -- Payload del QR (truncado por seguridad)
  validation_result VARCHAR(50) NOT NULL,  -- valid, invalid, expired, already_used, falsified
  scanned_by UUID REFERENCES profiles(id), -- Empleado que escaneó
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para access_logs
CREATE INDEX IF NOT EXISTS idx_access_logs_transaction ON access_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_user ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_location ON access_logs(location_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON access_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_result ON access_logs(validation_result);

-- 4. Tabla returns
-- Registra devoluciones de productos/servicios
CREATE TABLE IF NOT EXISTS returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  new_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  returned_items JSONB NOT NULL,           -- Items devueltos con cantidades
  reason TEXT,
  refund_amount DECIMAL(10, 2),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para returns
CREATE INDEX IF NOT EXISTS idx_returns_original_tx ON returns(original_transaction_id);
CREATE INDEX IF NOT EXISTS idx_returns_new_tx ON returns(new_transaction_id);
CREATE INDEX IF NOT EXISTS idx_returns_timestamp ON returns(timestamp DESC);

-- 5. Trigger para updated_at en transactions
CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_transactions_updated_at();

-- 6. Comentarios de documentación
COMMENT ON TABLE transactions IS 'Transacciones de compra (online y offline) con tracking de QR';
COMMENT ON COLUMN transactions.items IS 'Array JSONB de productos/servicios: [{"type":"product","id":"uuid","name":"...","quantity":1,"price":100}]';
COMMENT ON COLUMN transactions.status IS 'completed: transacción completada, pending_sync: pendiente de sincronización desde offline, cancelled: cancelada';
COMMENT ON COLUMN transactions.qr_used IS 'TRUE si el QR fue escaneado y usado';
COMMENT ON COLUMN transactions.qr_invalidated IS 'TRUE si el QR fue invalidado (devolución, cancelación)';

COMMENT ON TABLE access_logs IS 'Log de auditoría de todos los escaneos de QR';
COMMENT ON COLUMN access_logs.validation_result IS 'valid, invalid, expired, already_used, falsified';

COMMENT ON TABLE returns IS 'Registro de devoluciones de productos/servicios';
COMMENT ON COLUMN returns.returned_items IS 'Array JSONB de items devueltos: [{"item_id":"uuid","quantity":1}]';

COMMENT ON COLUMN profiles.qr_secret IS 'Secret único del usuario para generar firma HMAC de QR codes (hex de 64 chars)';
