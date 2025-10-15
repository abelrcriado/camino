-- =====================================================
-- Migración: Crear tabla payments con soporte Stripe Connect
-- Fecha: 2025-10-15
-- Descripción: Sistema de pagos con splits automáticos
-- =====================================================

-- Tabla de pagos con integración Stripe
CREATE TABLE IF NOT EXISTS payments (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relaciones
  booking_id UUID NOT NULL, -- FK a bookings
  user_id UUID NOT NULL,    -- FK a auth.users (Supabase)
  service_point_id UUID NOT NULL, -- FK a service_points (CSP)
  
  -- Montos (en céntimos para precisión)
  amount INTEGER NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'eur',
  
  -- Stripe IDs
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_charge_id VARCHAR(255),
  stripe_transfer_id VARCHAR(255), -- ID de transferencia a partner (Stripe Connect)
  stripe_account_id VARCHAR(255),  -- Cuenta Stripe Connect del partner
  
  -- Método y estado de pago
  payment_method VARCHAR(50) NOT NULL DEFAULT 'card',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- Estados: pending, processing, succeeded, failed, canceled, refunded, partially_refunded
  
  -- Comisiones y splits (en céntimos)
  platform_fee INTEGER NOT NULL DEFAULT 0,  -- Comisión plataforma
  csp_amount INTEGER NOT NULL DEFAULT 0,    -- Monto para CSP/partner
  commission_percentage DECIMAL(5,4),       -- Porcentaje de comisión (ej: 0.15 = 15%)
  partner_amount INTEGER,                   -- Monto neto para partner después de comisión
  
  -- Metadata
  description TEXT,
  metadata JSONB,
  
  -- Reembolsos
  refunded_amount INTEGER NOT NULL DEFAULT 0,
  refund_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT check_status_valid CHECK (status IN (
    'pending', 'processing', 'succeeded', 'failed', 
    'canceled', 'refunded', 'partially_refunded'
  )),
  CONSTRAINT check_payment_method_valid CHECK (payment_method IN (
    'card', 'bank_transfer', 'wallet', 'cash'
  )),
  CONSTRAINT check_commission_percentage_valid CHECK (
    commission_percentage IS NULL OR 
    (commission_percentage >= 0 AND commission_percentage <= 1)
  ),
  CONSTRAINT check_refunded_amount_valid CHECK (
    refunded_amount >= 0 AND refunded_amount <= amount
  )
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_service_point_id ON payments(service_point_id);
CREATE INDEX idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
CREATE INDEX idx_payments_stripe_account_id ON payments(stripe_account_id) WHERE stripe_account_id IS NOT NULL;
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX idx_payments_partner_amount ON payments(partner_amount) WHERE partner_amount IS NOT NULL;
CREATE INDEX idx_payments_platform_fee ON payments(platform_fee);

-- Índice compuesto para reportes de comisiones
CREATE INDEX idx_payments_service_point_status ON payments(service_point_id, status);
CREATE INDEX idx_payments_created_status ON payments(created_at DESC, status);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payments_updated_at();

-- Función RPC para marcar pago como exitoso
CREATE OR REPLACE FUNCTION mark_payment_succeeded(
  p_payment_id UUID,
  p_stripe_charge_id VARCHAR DEFAULT NULL
)
RETURNS payments AS $$
DECLARE
  v_payment payments;
BEGIN
  UPDATE payments
  SET 
    status = 'succeeded',
    stripe_charge_id = COALESCE(p_stripe_charge_id, stripe_charge_id),
    paid_at = NOW()
  WHERE id = p_payment_id
  RETURNING * INTO v_payment;
  
  RETURN v_payment;
END;
$$ LANGUAGE plpgsql;

-- Función RPC para actualizar estado de pago
CREATE OR REPLACE FUNCTION update_payment_status(
  p_payment_id UUID,
  p_status VARCHAR
)
RETURNS payments AS $$
DECLARE
  v_payment payments;
BEGIN
  UPDATE payments
  SET status = p_status
  WHERE id = p_payment_id
  RETURNING * INTO v_payment;
  
  RETURN v_payment;
END;
$$ LANGUAGE plpgsql;

-- Función RPC para procesar reembolso
CREATE OR REPLACE FUNCTION process_payment_refund(
  p_payment_id UUID,
  p_amount INTEGER,
  p_reason TEXT,
  p_stripe_refund_id VARCHAR DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_payment payments;
  v_new_refunded_amount INTEGER;
  v_new_status VARCHAR;
BEGIN
  -- Obtener pago actual
  SELECT * INTO v_payment FROM payments WHERE id = p_payment_id;
  
  IF v_payment IS NULL THEN
    RAISE EXCEPTION 'Payment not found: %', p_payment_id;
  END IF;
  
  IF v_payment.status != 'succeeded' THEN
    RAISE EXCEPTION 'Cannot refund payment with status: %', v_payment.status;
  END IF;
  
  -- Calcular nuevo monto reembolsado
  v_new_refunded_amount := v_payment.refunded_amount + p_amount;
  
  IF v_new_refunded_amount > v_payment.amount THEN
    RAISE EXCEPTION 'Refund amount exceeds payment amount';
  END IF;
  
  -- Determinar nuevo estado
  IF v_new_refunded_amount = v_payment.amount THEN
    v_new_status := 'refunded';
  ELSE
    v_new_status := 'partially_refunded';
  END IF;
  
  -- Actualizar pago
  UPDATE payments
  SET 
    refunded_amount = v_new_refunded_amount,
    status = v_new_status,
    refund_reason = COALESCE(p_reason, refund_reason),
    refunded_at = CASE 
      WHEN v_new_status = 'refunded' THEN NOW()
      ELSE refunded_at
    END
  WHERE id = p_payment_id;
  
  -- Retornar resultado
  RETURN jsonb_build_object(
    'payment_id', p_payment_id,
    'refunded_amount', v_new_refunded_amount,
    'total_amount', v_payment.amount,
    'status', v_new_status,
    'stripe_refund_id', p_stripe_refund_id
  );
END;
$$ LANGUAGE plpgsql;

-- Función RPC para obtener pagos por estado
CREATE OR REPLACE FUNCTION get_payments_by_status(
  p_status VARCHAR,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS SETOF payments AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM payments
  WHERE status = p_status
  ORDER BY created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Función RPC para obtener estadísticas de pagos
CREATE OR REPLACE FUNCTION get_payment_stats(
  p_service_point_id UUID DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE(
  total_payments BIGINT,
  total_amount BIGINT,
  successful_payments BIGINT,
  failed_payments BIGINT,
  refunded_payments BIGINT,
  total_refunded_amount BIGINT,
  total_platform_fees BIGINT,
  average_payment NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_payments,
    COALESCE(SUM(amount), 0)::BIGINT as total_amount,
    COUNT(*) FILTER (WHERE status = 'succeeded')::BIGINT as successful_payments,
    COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as failed_payments,
    COUNT(*) FILTER (WHERE status IN ('refunded', 'partially_refunded'))::BIGINT as refunded_payments,
    COALESCE(SUM(refunded_amount), 0)::BIGINT as total_refunded_amount,
    COALESCE(SUM(platform_fee), 0)::BIGINT as total_platform_fees,
    COALESCE(AVG(amount), 0) as average_payment
  FROM payments
  WHERE 
    (p_service_point_id IS NULL OR service_point_id = p_service_point_id)
    AND (p_user_id IS NULL OR user_id = p_user_id)
    AND (p_start_date IS NULL OR created_at >= p_start_date)
    AND (p_end_date IS NULL OR created_at <= p_end_date);
END;
$$ LANGUAGE plpgsql;

-- Función RPC para obtener ingresos de un service point
CREATE OR REPLACE FUNCTION get_service_point_revenue(
  p_service_point_id UUID,
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE(
  total_revenue BIGINT,
  total_platform_fees BIGINT,
  total_partner_amount BIGINT,
  payment_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(amount), 0)::BIGINT as total_revenue,
    COALESCE(SUM(platform_fee), 0)::BIGINT as total_platform_fees,
    COALESCE(SUM(partner_amount), 0)::BIGINT as total_partner_amount,
    COUNT(*)::BIGINT as payment_count
  FROM payments
  WHERE 
    service_point_id = p_service_point_id
    AND status = 'succeeded'
    AND created_at >= p_start_date
    AND created_at <= p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Función RPC para obtener pagos pendientes
CREATE OR REPLACE FUNCTION get_pending_payments(
  p_user_id UUID
)
RETURNS SETOF payments AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM payments
  WHERE 
    user_id = p_user_id
    AND status = 'pending'
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Comentarios de documentación
COMMENT ON TABLE payments IS 'Pagos con integración Stripe y soporte para splits automáticos';
COMMENT ON COLUMN payments.commission_percentage IS 'Porcentaje de comisión aplicado (0.0-1.0)';
COMMENT ON COLUMN payments.partner_amount IS 'Monto transferido al partner vía Stripe Connect';
COMMENT ON COLUMN payments.platform_fee IS 'Comisión retenida por la plataforma';
COMMENT ON COLUMN payments.stripe_transfer_id IS 'ID de transferencia Stripe Connect';
COMMENT ON COLUMN payments.stripe_account_id IS 'Cuenta Stripe Connect del partner';
