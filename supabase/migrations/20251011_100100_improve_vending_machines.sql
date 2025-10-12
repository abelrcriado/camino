-- ============================================================================
-- Sprint 3.2: Vending Machine Slots
-- Migración: Mejorar vending_machines con políticas de reserva
-- Fecha: 2025-10-11
-- ============================================================================

-- Descripción:
-- Esta migración agrega campos relacionados con la gestión de reservas
-- y políticas de expiración para las máquinas vending.

-- ============================================================================
-- 1. AGREGAR COLUMNAS A VENDING_MACHINES
-- ============================================================================

-- Política de reservas
ALTER TABLE vending_machines
ADD COLUMN IF NOT EXISTS politica_reserva VARCHAR(50) DEFAULT 'hard_reservation'
  CHECK (politica_reserva IN ('hard_reservation', 'soft_reservation', 'no_reservation'));

-- Tiempo de expiración en minutos
ALTER TABLE vending_machines
ADD COLUMN IF NOT EXISTS tiempo_expiracion_minutos INTEGER DEFAULT 15
  CHECK (tiempo_expiracion_minutos > 0 AND tiempo_expiracion_minutos <= 1440);

-- Permitir cancelación
ALTER TABLE vending_machines
ADD COLUMN IF NOT EXISTS permite_cancelacion BOOLEAN DEFAULT true;

-- ============================================================================
-- 2. COMENTARIOS
-- ============================================================================

COMMENT ON COLUMN vending_machines.politica_reserva IS 'Política de reservas: hard_reservation (bloqueo duro), soft_reservation (soft lock), no_reservation (sin reservas)';
COMMENT ON COLUMN vending_machines.tiempo_expiracion_minutos IS 'Tiempo en minutos antes de que una reserva expire';
COMMENT ON COLUMN vending_machines.permite_cancelacion IS 'Indica si se permite cancelar reservas manualmente';

-- ============================================================================
-- 3. ACTUALIZAR DATOS EXISTENTES
-- ============================================================================

-- Todas las máquinas existentes tendrán política hard_reservation con 15 minutos de expiración
UPDATE vending_machines
SET 
  politica_reserva = 'hard_reservation',
  tiempo_expiracion_minutos = 15,
  permite_cancelacion = true
WHERE politica_reserva IS NULL;

-- ============================================================================
-- FIN MIGRACIÓN
-- ============================================================================
